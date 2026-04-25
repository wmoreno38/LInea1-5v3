import { supabaseAdmin, handleOptions } from '../lib/supabase.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requerido' });

  const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
    redirectTo: process.env.FRONTEND_URL || 'https://linea-1-5-v2.vercel.app'
  });

  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true, message: 'Se envió un enlace de recuperación a ' + email });
}
