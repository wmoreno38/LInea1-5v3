import { requireAuth, handleOptions } from '../lib/supabase.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = await requireAuth(req, res);
  if (!user) return;

  res.json({
    userId: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role
  });
}
