import { supabaseAdmin, handleOptions } from '../lib/supabase.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' });

  // Check lockout
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (profile && profile.locked_until && new Date(profile.locked_until) > new Date()) {
    return res.status(423).json({ error: 'Cuenta bloqueada temporalmente. Intenta en 15 minutos.' });
  }

  // Attempt login
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });

  if (error) {
    // Register failed attempt
    if (profile) {
      const attempts = (profile.failed_attempts || 0) + 1;
      const locked = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null;
      await supabaseAdmin.from('profiles').update({ failed_attempts: attempts, locked_until: locked }).eq('id', profile.id);
      
      if (locked) {
        return res.status(423).json({ error: 'Cuenta bloqueada por 15 minutos debido a múltiples intentos fallidos' });
      }
      const remaining = 5 - attempts;
      return res.status(401).json({ error: 'Credenciales incorrectas' + (remaining > 0 && remaining < 3 ? ` (${remaining} intentos restantes)` : '') });
    }
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  if (!profile) return res.status(404).json({ error: 'Perfil no encontrado' });
  if (!profile.active) return res.status(403).json({ error: 'Cuenta desactivada' });

  // Reset failed attempts
  await supabaseAdmin.from('profiles').update({ failed_attempts: 0, locked_until: null }).eq('id', data.user.id);

  // Log login
  await supabaseAdmin.from('audit_logs').insert({
    type: 'LOGIN', category: 'Acceso',
    user_name: profile.name, user_id: data.user.id,
    detail: 'Inicio de sesión: ' + profile.name + ' (' + profile.role + ')'
  });

  res.json({
    token: data.session.access_token,
    refreshToken: data.session.refresh_token,
    user: {
      userId: data.user.id,
      username: profile.username,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      loginAt: new Date().toISOString()
    }
  });
}
