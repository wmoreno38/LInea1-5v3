import { supabaseAdmin, requireAuth, handleOptions } from './lib/supabase.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  // Determinar la acción por la URL: /api/auth/login → action = 'login'
  const urlPath = req.url.split('?')[0];
  const action = urlPath.split('/').filter(Boolean).pop(); // login | logout | me | recovery

  // POST /api/auth/login
  if (req.method === 'POST' && action === 'login') {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' });

    const { data: profile } = await supabaseAdmin
      .from('profiles').select('*').eq('email', email).single();

    if (profile && profile.locked_until && new Date(profile.locked_until) > new Date()) {
      return res.status(423).json({ error: 'Cuenta bloqueada temporalmente. Intenta en 15 minutos.' });
    }

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });

    if (error) {
      if (profile) {
        const attempts = (profile.failed_attempts || 0) + 1;
        const locked = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null;
        await supabaseAdmin.from('profiles').update({ failed_attempts: attempts, locked_until: locked }).eq('id', profile.id);
        if (locked) return res.status(423).json({ error: 'Cuenta bloqueada por 15 minutos debido a múltiples intentos fallidos' });
        const remaining = 5 - attempts;
        return res.status(401).json({ error: 'Credenciales incorrectas' + (remaining > 0 && remaining < 3 ? ` (${remaining} intentos restantes)` : '') });
      }
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    if (!profile) return res.status(404).json({ error: 'Perfil no encontrado' });
    if (!profile.active) return res.status(403).json({ error: 'Cuenta desactivada' });

    await supabaseAdmin.from('profiles').update({ failed_attempts: 0, locked_until: null }).eq('id', data.user.id);
    await supabaseAdmin.from('audit_logs').insert({
      type: 'LOGIN', category: 'Acceso',
      user_name: profile.name, user_id: data.user.id,
      detail: 'Inicio de sesión: ' + profile.name + ' (' + profile.role + ')'
    });

    return res.json({
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: {
        userId: data.user.id, username: profile.username,
        name: profile.name, email: profile.email,
        role: profile.role, loginAt: new Date().toISOString()
      }
    });
  }

  // POST /api/auth/logout
  if (req.method === 'POST' && action === 'logout') {
    const user = await requireAuth(req, res);
    if (!user) return;
    await supabaseAdmin.from('audit_logs').insert({
      type: 'LOGOUT', category: 'Acceso',
      user_name: user.name, user_id: user.id,
      detail: 'Cierre de sesión: ' + user.name
    });
    return res.json({ success: true });
  }

  // GET /api/auth/me
  if (req.method === 'GET' && action === 'me') {
    const user = await requireAuth(req, res);
    if (!user) return;
    return res.json({
      userId: user.id, username: user.username,
      name: user.name, email: user.email, role: user.role
    });
  }

  // POST /api/auth/recovery
  if (req.method === 'POST' && action === 'recovery') {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requerido' });
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: process.env.FRONTEND_URL || 'https://linea-1-5-v2.vercel.app'
    });
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ success: true, message: 'Se envió un enlace de recuperación a ' + email });
  }

  return res.status(404).json({ error: 'Ruta no encontrada' });
}
