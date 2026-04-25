import { requireAuth, supabaseAdmin, handleOptions } from '../lib/supabase.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  const user = await requireAuth(req, res);
  if (!user) return;

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID requerido' });

  // PUT: Update compliance
  if (req.method === 'PUT') {
    const { compliance } = req.body;

    const { data: ctrl } = await supabaseAdmin.from('controls').select('code, project_id').eq('id', id).single();
    await supabaseAdmin.from('controls').update({ compliance: compliance || '' }).eq('id', id);

    // Get project name for log
    let projectName = '';
    if (ctrl?.project_id) {
      const { data: proj } = await supabaseAdmin.from('projects').select('name').eq('id', ctrl.project_id).single();
      projectName = proj?.name || '';
    }

    const type = compliance && compliance.trim() ? 'CONTROL_FILL' : 'CONTROL_CLEAR';
    await supabaseAdmin.from('audit_logs').insert({
      type, category: 'Control',
      user_name: user.name, user_id: user.id,
      detail: (type === 'CONTROL_FILL' ? 'Cumplimiento documentado: ' : 'Cumplimiento borrado: ') + (ctrl?.code || ''),
      project: projectName
    });

    return res.json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
