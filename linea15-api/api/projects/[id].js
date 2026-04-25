import { requireAuth, supabaseAdmin, handleOptions } from '../lib/supabase.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  const user = await requireAuth(req, res);
  if (!user) return;

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID requerido' });

  // DELETE: Delete project
  if (req.method === 'DELETE') {
    const { data: proj } = await supabaseAdmin.from('projects').select('name').eq('id', id).single();
    await supabaseAdmin.from('projects').delete().eq('id', id);
    await supabaseAdmin.from('audit_logs').insert({
      type: 'PROJECT_DELETE', category: 'Proyecto',
      user_name: user.name, user_id: user.id,
      detail: 'Proyecto eliminado: ' + (proj?.name || id)
    });
    return res.json({ success: true });
  }

  // PUT: Finalize project (archive)
  if (req.method === 'PUT') {
    const { action } = req.body;

    if (action === 'finalize') {
      const { finalizedBy, finalizedByRole, stats } = req.body;
      await supabaseAdmin.from('projects').update({
        archived_at: new Date().toISOString(),
        finalized_by: finalizedBy || user.name,
        finalized_by_role: finalizedByRole || user.role,
        stats: stats || {}
      }).eq('id', id);

      const { data: proj } = await supabaseAdmin.from('projects').select('name').eq('id', id).single();
      await supabaseAdmin.from('audit_logs').insert({
        type: 'PROJECT_FINALIZE', category: 'Proyecto',
        user_name: user.name, user_id: user.id,
        detail: 'Matriz finalizada: ' + (proj?.name || id),
        project: proj?.name || ''
      });
      return res.json({ success: true });
    }

    return res.status(400).json({ error: 'Acción no reconocida' });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
