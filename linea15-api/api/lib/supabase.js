import { createClient } from '@supabase/supabase-js';

// Admin client (service_role - full access, server-side only)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Create a client scoped to the requesting user's JWT
export function supabaseForUser(req) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
}

// Middleware: extract and validate user from JWT
export async function getUser(req) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return null;

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || !profile.active) return null;

  return {
    id: user.id,
    username: profile.username,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    profile
  };
}

// Auth guard: returns 401 if not authenticated
export async function requireAuth(req, res) {
  const user = await getUser(req);
  if (!user) {
    res.status(401).json({ error: 'No autenticado' });
    return null;
  }
  return user;
}

// Admin guard: returns 403 if not admin
export async function requireAdmin(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return null;
  if (user.role !== 'admin') {
    res.status(403).json({ error: 'Solo administradores' });
    return null;
  }
  return user;
}

// CORS headers
export function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}

// Handle OPTIONS preflight
export function handleOptions(req, res) {
  if (req.method === 'OPTIONS') {
    setCors(res);
    res.status(200).end();
    return true;
  }
  setCors(res);
  return false;
}
