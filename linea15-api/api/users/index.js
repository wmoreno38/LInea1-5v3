import { requireAdmin, supabaseAdmin, handleOptions } from '../lib/supabase.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  // All user management requires admin
  const user = await requireAdmin(req, res);
  if (!user) return;

  // GET: List all users
  if (req.method === 'GET') {
    const { data } = await supabaseAdmin.from('profiles').select('*').order('created_at');
    const users = (data || []).map(u => ({
      id: u.id, username: u.username, name: u.name, email: u.email,
      role: u.role, active: u.active, createdAt: u.created_at,
      projectPerms: u.project_perms || {},
      failedAttempts: u.failed_attempts, lockedUntil: u.locked_until
    }));
    return res.json(users);
  }

  // POST: Create new user
  if (req.method === 'POST') {
    const { email, password, username, name, role } = req.body;
    if (!email || !password || !username || !name) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Contraseña debe tener al menos 8 caracteres' });
    }

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email, password, email_confirm: true
    });
    if (authError) return res.status(400).json({ error: authError.message });

    // Create profile
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: authData.user.id, username, name, email,
      role: role || 'viewer', active: true, project_perms: {}
    });

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return res.status(400).json({ error: profileError.message });
    }

    await supabaseAdmin.from('audit_logs').insert({
      type: 'USER_CREATE', category: 'Usuarios',
      user_name: user.name, user_id: user.id,
      detail: 'Usuario creado: ' + name + ' (@' + username + ') - Rol: ' + (role || 'viewer')
    });

    return res.json({ userId: authData.user.id, success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
