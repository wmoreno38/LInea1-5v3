import { requireAdmin, supabaseAdmin, handleOptions } from '../lib/supabase.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  const user = await requireAdmin(req, res);
  if (!user) return;

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID requerido' });

  // PUT: Update user (toggle, role, perms, etc.)
  if (req.method === 'PUT') {
    const { action, active, role, name, email, project_perms } = req.body;

    if (action === 'toggle') {
      const { data: u } = await supabaseAdmin.from('profiles').select('name, active').eq('id', id).single();
      const newActive = active !== undefined ? active : !(u?.active);
      await supabaseAdmin.from('profiles').update({ active: newActive }).eq('id', id);
      await supabaseAdmin.from('audit_logs').insert({
        type: 'USER_TOGGLE', category: 'Usuarios',
        user_name: user.name, user_id: user.id,
        detail: 'Usuario ' + (newActive ? 'activado' : 'desactivado') + ': ' + (u?.name || '')
      });
      return res.json({ success: true });
    }

    if (action === 'update_perms') {
      await supabaseAdmin.from('profiles').update({ project_perms }).eq('id', id);
      await supabaseAdmin.from('audit_logs').insert({
        type: 'USER_PERMS', category: 'Usuarios',
        user_name: user.name, user_id: user.id,
        detail: 'Permisos actualizados para usuario ID: ' + id
      });
      return res.json({ success: true });
    }

    // General update
    const updates = {};
    if (role) updates.role = role;
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (project_perms !== undefined) updates.project_perms = project_perms;
    
    if (Object.keys(updates).length > 0) {
      await supabaseAdmin.from('profiles').update(updates).eq('id', id);
    }

    return res.json({ success: true });
  }

  // DELETE: Delete user
  if (req.method === 'DELETE') {
    const { data: u } = await supabaseAdmin.from('profiles').select('name').eq('id', id).single();
    await supabaseAdmin.from('profiles').delete().eq('id', id);
    await supabaseAdmin.auth.admin.deleteUser(id);

    await supabaseAdmin.from('audit_logs').insert({
      type: 'USER_DELETE', category: 'Usuarios',
      user_name: user.name, user_id: user.id,
      detail: 'Usuario eliminado: ' + (u?.name || id)
    });

    return res.json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
