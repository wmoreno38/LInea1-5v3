import { requireAuth, supabaseAdmin, handleOptions } from '../lib/supabase.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await requireAuth(req, res);
  if (!user) return;

  await supabaseAdmin.from('audit_logs').insert({
    type: 'LOGOUT', category: 'Acceso',
    user_name: user.name, user_id: user.id,
    detail: 'Cierre de sesión: ' + user.name
  });

  res.json({ success: true });
}
