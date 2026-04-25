import { requireAuth, supabaseAdmin, handleOptions } from '../lib/supabase.js';

// Sanitiza el nombre del archivo para usar como clave en Supabase Storage
// Conserva la extensión, reemplaza caracteres problemáticos por guiones bajos
function safeName(name) {
  const parts = (name || 'archivo').split('.');
  const ext = parts.length > 1 ? '.' + parts.pop() : '';
  const base = parts.join('.')
    .normalize('NFD')                        // descomponer acentos
    .replace(/[\u0300-\u036f]/g, '')         // quitar marcas diacríticas
    .replace(/[^a-zA-Z0-9._\-]/g, '_')      // reemplazar caracteres especiales
    .replace(/_+/g, '_')                     // colapsar guiones bajos múltiples
    .substring(0, 100);                      // limitar longitud
  return base + ext;
}

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
          // Nombre seguro para Storage, nombre original para mostrar al usuario
          const safe = safeName(f.name);
          const path = projectId + '/' + controlId + '/' + ev.id + '/' + safe;
          const base64Data = f.data.split(',')[1] || f.data;
          const buffer = Buffer.from(base64Data, 'base64');

          const { error: uploadError } = await supabaseAdmin.storage
            .from('evidencias')
            .upload(path, buffer, {
              contentType: f.type || 'application/octet-stream',
              upsert: true, // evitar error si ya existe
            });

          if (!uploadError) {
            await supabaseAdmin.from('evidence_files').insert({
              evidence_id: ev.id,
              name: f.name,          // nombre original para mostrar
              type: f.type || '',
              size: buffer.length,
              storage_path: path,    // ruta segura en Storage
            });
          } else {
            console.error('Error uploading file:', uploadError.message);
          }
        }
      }
    }

    // Log
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
