import { requireAuth, supabaseAdmin, handleOptions } from '../lib/supabase.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  const user = await requireAuth(req, res);
  if (!user) return;

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID requerido' });

  // Get evidence info for logging
  async function getEvInfo() {
    const { data: ev } = await supabaseAdmin.from('evidences').select('description, control_id, project_id').eq('id', id).single();
    let ctrlCode = '', projName = '';
    if (ev?.control_id) {
      const { data: c } = await supabaseAdmin.from('controls').select('code').eq('id', ev.control_id).single();
      ctrlCode = c?.code || '';
    }
    if (ev?.project_id) {
      const { data: p } = await supabaseAdmin.from('projects').select('name').eq('id', ev.project_id).single();
      projName = p?.name || '';
    }
    return { description: ev?.description || '', ctrlCode, projName };
  }

  // PUT: Update evidence (status or fields)
  if (req.method === 'PUT') {
    const { status, type, description, date, notes, reviewer } = req.body;
    const updates = {};
    if (status !== undefined) { updates.status = status; updates.reviewer = reviewer || user.name; }
    if (type !== undefined) updates.type = type;
    if (description !== undefined) updates.description = description;
    if (date !== undefined) updates.date = date;
    if (notes !== undefined) updates.notes = notes;
    if (reviewer !== undefined) updates.reviewer = reviewer;

    await supabaseAdmin.from('evidences').update(updates).eq('id', id);

    const info = await getEvInfo();

    if (status) {
      const logType = status === 'aprobada' ? 'EVIDENCE_APPROVE' : status === 'rechazada' ? 'EVIDENCE_REJECT' : 'EVIDENCE_EDIT';
      await supabaseAdmin.from('audit_logs').insert({
        type: logType, category: 'Evidencia',
        user_name: user.name, user_id: user.id,
        detail: 'Evidencia ' + (status === 'aprobada' ? 'aprobada' : status === 'rechazada' ? 'rechazada' : 'editada') + ': ' + info.description + ' → ' + info.ctrlCode,
        project: info.projName
      });
    } else {
      await supabaseAdmin.from('audit_logs').insert({
        type: 'EVIDENCE_EDIT', category: 'Evidencia',
        user_name: user.name, user_id: user.id,
        detail: 'Evidencia editada: ' + info.description, project: info.projName
      });
    }

    return res.json({ success: true });
  }

  // DELETE: Delete evidence and its files
  if (req.method === 'DELETE') {
    const info = await getEvInfo();

    // Delete files from storage
    const { data: files } = await supabaseAdmin.from('evidence_files').select('storage_path').eq('evidence_id', id);
    if (files && files.length > 0) {
      await supabaseAdmin.storage.from('evidencias').remove(files.map(f => f.storage_path));
    }

    await supabaseAdmin.from('evidences').delete().eq('id', id);

    await supabaseAdmin.from('audit_logs').insert({
      type: 'EVIDENCE_DELETE', category: 'Evidencia',
      user_name: user.name, user_id: user.id,
      detail: 'Evidencia eliminada: ' + info.description, project: info.projName
    });

    return res.json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
