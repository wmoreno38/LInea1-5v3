import { requireAuth, supabaseAdmin, handleOptions } from '../lib/supabase.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  const user = await requireAuth(req, res);
  if (!user) return;

  // GET: List archived projects
  if (req.method === 'GET') {
    const { data: projects } = await supabaseAdmin
      .from('projects')
      .select('*')
      .not('archived_at', 'is', null)
      .order('archived_at', { ascending: false });

    if (!projects || projects.length === 0) return res.json([]);

    const projectIds = projects.map(p => p.id);
    const { data: controls } = await supabaseAdmin.from('controls').select('*').in('project_id', projectIds).order('sort_order');
    const { data: evidences } = await supabaseAdmin.from('evidences').select('*, evidence_files(*)').in('project_id', projectIds);

    const STORAGE_URL = process.env.SUPABASE_URL + '/storage/v1/object/public/evidencias/';

    const result = projects.map(p => {
      const pControls = (controls || []).filter(c => c.project_id === p.id).map(c => ({
        id: c.id, code: c.code, causaBase: c.causa_base, causasAsociadas: c.causas_asociadas,
        controlBase: c.control_base, compliance: c.compliance || '', riNiv: c.ri_niv,
        rrNiv: c.rr_niv, normatividad: c.normatividad || {}
      }));
      const pEvidences = (evidences || []).filter(e => e.project_id === p.id).map(e => ({
        id: e.id, controlId: e.control_id, type: e.type, description: e.description,
        date: e.date, notes: e.notes, reviewer: e.reviewer, status: e.status, createdAt: e.created_at,
        files: (e.evidence_files || []).map(f => ({
          id: f.id, name: f.name, type: f.type, size: f.size,
          storagePath: f.storage_path, data: STORAGE_URL + f.storage_path
        }))
      }));
      return {
        id: p.id, name: p.name, publishDate: p.publish_date, responsible: p.responsible,
        createdAt: p.created_at, archivedAt: p.archived_at, finalizedBy: p.finalized_by,
        finalizedByRole: p.finalized_by_role, stats: p.stats || {},
        controls: pControls, evidences: pEvidences
      };
    });

    return res.json(result);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
