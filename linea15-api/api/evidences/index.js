import { requireAuth, supabaseAdmin, handleOptions } from '../lib/supabase.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  const user = await requireAuth(req, res);
  if (!user) return;

  // POST: Create evidence
  if (req.method === 'POST') {
    const { projectId, controlId, type, description, date, notes, reviewer, files } = req.body;
    if (!projectId || !controlId || !description) {
      return res.status(400).json({ error: 'projectId, controlId y description son requeridos' });
    }

    const { data: ev, error } = await supabaseAdmin
      .from('evidences')
      .insert({
        project_id: projectId, control_id: controlId,
        type: type || 'Documento', description,
        date: date || null, notes: notes || '', reviewer: reviewer || '',
        status: 'en_revision'
      })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    // Upload files
    if (files && files.length > 0) {
      for (const f of files) {
        if (f.data) {
          const path = projectId + '/' + controlId + '/' + ev.id + '/' + f.name;
          const base64Data = f.data.split(',')[1] || f.data;
          const buffer = Buffer.from(base64Data, 'base64');
          
          await supabaseAdmin.storage.from('evidencias').upload(path, buffer, {
            contentType: f.type || 'application/octet-stream'
          });
          await supabaseAdmin.from('evidence_files').insert({
            evidence_id: ev.id, name: f.name, type: f.type || '',
            size: buffer.length, storage_path: path
          });
        }
      }
    }

    // Get project and control names for log
    const { data: ctrl } = await supabaseAdmin.from('controls').select('code').eq('id', controlId).single();
    const { data: proj } = await supabaseAdmin.from('projects').select('name').eq('id', projectId).single();

    await supabaseAdmin.from('audit_logs').insert({
      type: 'EVIDENCE_ADD', category: 'Evidencia',
      user_name: user.name, user_id: user.id,
      detail: 'Evidencia agregada: ' + description + ' → ' + (ctrl?.code || ''),
      project: proj?.name || ''
    });

    return res.json({ id: ev.id, success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
