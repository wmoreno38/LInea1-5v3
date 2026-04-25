import { requireAuth, supabaseAdmin, handleOptions } from '../lib/supabase.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;

  const user = await requireAuth(req, res);
  if (!user) return;

  // GET: List logs (admin only)
  if (req.method === 'GET') {
    if (user.role !== 'admin') return res.status(403).json({ error: 'Solo administradores' });

    const limit = parseInt(req.query.limit) || 500;
    const category = req.query.category;

    let query = supabaseAdmin
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data } = await query;
    const logs = (data || []).map(l => ({
      id: l.id, timestamp: l.timestamp, type: l.type, category: l.category,
      user: l.user_name, userId: l.user_id, detail: l.detail,
      project: l.project, ip: l.ip
    }));
    return res.json(logs);
  }

  // POST: Add log entry
  if (req.method === 'POST') {
    const { type, category, detail, project } = req.body;
    await supabaseAdmin.from('audit_logs').insert({
      type: type || 'SYSTEM', category: category || 'Sistema',
      user_name: user.name, user_id: user.id,
      detail: detail || '', project: project || ''
    });
    return res.json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
