import React, { useState, useRef, useEffect } from 'react';
import { DEFAULT_CONTROLS } from '../data/defaultControls.js';

const STORAGE_KEY = 'l15_control_template';

/* ── Utilidades ───────────────────────────────────────────────── */
function loadTemplate() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveTemplate(controls) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(controls));
}

function clearTemplate() {
  localStorage.removeItem(STORAGE_KEY);
}

/* Lee un archivo Excel con SheetJS y devuelve array de filas como objetos */
async function readExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        // Carga SheetJS dinámicamente (viene bundleado por vite si está en deps)
        import('xlsx').then(XLSX => {
          const wb = XLSX.read(e.target.result, { type: 'binary' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
          resolve(rows);
        }).catch(reject);
      } catch (err) { reject(err); }
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
}

/* Mapea una fila Excel → estructura de control */
function rowToControl(row, idx) {
  // Acepta variantes de nombres de columna (mayúsculas/minúsculas/espacios)
  const get = (...keys) => {
    for (const k of keys) {
      const found = Object.keys(row).find(r => r.toLowerCase().replace(/\s+/g,'') === k.toLowerCase().replace(/\s+/g,''));
      if (found && row[found] !== '') return String(row[found]);
    }
    return '';
  };

  return {
    code:            get('code', 'codigo', 'código', 'ct'),
    causaBase:       get('causaBase', 'causabase', 'causa_base', 'causa base'),
    causasAsociadas: get('causasAsociadas', 'causasasociadas', 'causas_asociadas', 'causas asociadas'),
    controlBase:     get('controlBase', 'controlbase', 'control_base', 'control base'),
    riNiv:           get('riNiv', 'riniv', 'ri_niv', 'ri niv', 'riesgo inherente', 'RI'),
    rrNiv:           get('rrNiv', 'rrniv', 'rr_niv', 'rr niv', 'riesgo residual', 'RR'),
    normatividad: {
      iso27001: get('iso27001', 'ISO27001', 'iso 27001'),
      iso27002: get('iso27002', 'ISO27002', 'iso 27002'),
      circular: get('circular'),
      sfc:      get('sfc', 'SFC'),
      otras:    get('otras', 'Otras', 'otras normas'),
    },
  };
}

/* Mapea JSON genérico → estructura de control (tolerante) */
function jsonToControl(obj, idx) {
  const n = obj.normatividad || obj.Normatividad || {};
  return {
    code:            obj.code || obj.codigo || obj.código || `CT-${String(idx+1).padStart(3,'0')}`,
    causaBase:       obj.causaBase || obj.causa_base || obj.causabase || '',
    causasAsociadas: obj.causasAsociadas || obj.causas_asociadas || '',
    controlBase:     obj.controlBase || obj.control_base || '',
    riNiv:           obj.riNiv || obj.ri_niv || 'Extremo',
    rrNiv:           obj.rrNiv || obj.rr_niv || 'Bajo',
    normatividad: {
      iso27001: n.iso27001 || '',
      iso27002: n.iso27002 || '',
      circular: n.circular || '',
      sfc:      n.sfc || '',
      otras:    n.otras || '',
    },
  };
}

const RISK_COLORS = { Extremo:'badge-red', Alto:'badge-red', Medio:'badge-yellow', Bajo:'badge-green' };

/* ── Componente principal ─────────────────────────────────────── */
export default function ControlTemplate() {
  const [template, setTemplate]   = useState(null);   // null = usando default
  const [preview,  setPreview]    = useState(null);   // controles parseados antes de guardar
  const [status,   setStatus]     = useState('idle'); // idle | parsing | error | ready
  const [msg,      setMsg]        = useState('');
  const [search,   setSearch]     = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    const t = loadTemplate();
    setTemplate(t);
  }, []);

  /* Controles activos para mostrar */
  const activeControls = template || DEFAULT_CONTROLS;
  const filtered = activeControls.filter(c => {
    const q = search.toLowerCase();
    return !q ||
      c.code?.toLowerCase().includes(q) ||
      c.causaBase?.toLowerCase().includes(q) ||
      c.controlBase?.toLowerCase().includes(q);
  });

  /* ── Procesar archivo ────────────────────────────────────────── */
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus('parsing'); setMsg(''); setPreview(null);

    try {
      let parsed = [];

      if (file.name.endsWith('.json')) {
        const text = await file.text();
        const data = JSON.parse(text);
        const arr  = Array.isArray(data) ? data : data.controls || data.DEFAULT_CONTROLS || [];
        if (!arr.length) throw new Error('El JSON no contiene un array de controles.');
        parsed = arr.map((r, i) => jsonToControl(r, i));
      } else if (file.name.match(/\.xlsx?$/i)) {
        const rows = await readExcel(file);
        if (!rows.length) throw new Error('El Excel está vacío o no tiene datos.');
        parsed = rows.map((r, i) => rowToControl(r, i)).filter(c => c.code);
      } else {
        throw new Error('Formato no soportado. Usa .xlsx, .xls o .json');
      }

      if (parsed.length === 0) throw new Error('No se encontraron controles válidos.');
      setPreview(parsed);
      setStatus('ready');
      setMsg(`${parsed.length} controles leídos. Revisa la vista previa y confirma.`);
    } catch (err) {
      setStatus('error');
      setMsg('Error: ' + err.message);
    } finally {
      fileRef.current.value = '';
    }
  };

  const handleSave = () => {
    if (!preview) return;
    saveTemplate(preview);
    setTemplate(preview);
    setPreview(null);
    setStatus('idle');
    setMsg(`✓ Plantilla actualizada con ${preview.length} controles. Los nuevos proyectos usarán esta base.`);
  };

  const handleCancelPreview = () => {
    setPreview(null);
    setStatus('idle');
    setMsg('');
  };

  const handleClear = () => {
    clearTemplate();
    setTemplate(null);
    setConfirmClear(false);
    setMsg('✓ Plantilla restablecida a los controles por defecto.');
  };

  const viewControls = preview || filtered;
  const isPreviewMode = !!preview;

  /* ── Descarga de la plantilla actual como JSON ────────────────── */
  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(activeControls, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'controles_base.json'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Plantilla de Controles</h2>
          <div className="subtitle">
            {template
              ? `Plantilla personalizada · ${template.length} controles`
              : `Plantilla por defecto · ${DEFAULT_CONTROLS.length} controles`}
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-secondary" onClick={handleDownload}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            Exportar JSON
          </button>
          {template && (
            <button className="btn btn-danger" onClick={() => setConfirmClear(true)}>
              Restablecer por defecto
            </button>
          )}
          <label className="btn btn-primary" style={{ cursor:'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
            Cargar nueva plantilla
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.json" style={{ display:'none' }} onChange={handleFile} />
          </label>
        </div>
      </div>

      <div className="page-body">

        {/* Mensaje de estado */}
        {msg && (
          <div className={`alert ${status === 'error' ? 'alert-danger' : 'alert-info'}`}
            style={{ marginBottom: 16 }}>
            {msg}
          </div>
        )}

        {/* Banner de vista previa */}
        {isPreviewMode && (
          <div style={{
            background: 'rgba(234,179,8,.08)', border: '1.5px solid var(--warning)',
            borderRadius: 'var(--radius)', padding: '14px 18px', marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            <span style={{ flex:1, fontWeight:600 }}>
              Vista previa — {preview.length} controles leídos. ¿Confirmar y guardar como nueva plantilla?
            </span>
            <button className="btn btn-primary" onClick={handleSave}>
              ✓ Confirmar y guardar
            </button>
            <button className="btn btn-secondary" onClick={handleCancelPreview}>
              Cancelar
            </button>
          </div>
        )}

        {/* Instrucciones de formato */}
        {!isPreviewMode && (
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '16px 20px', marginBottom: 16
          }}>
            <div style={{ fontWeight:700, marginBottom:8, fontSize:'.9rem' }}>Cómo cargar una nueva plantilla</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, fontSize:'.82rem', color:'var(--text-muted)' }}>
              <div>
                <strong style={{ color:'var(--text)' }}>Opción A — Excel (.xlsx)</strong><br/>
                Columnas requeridas: <code>code</code>, <code>causaBase</code>, <code>controlBase</code>, <code>riNiv</code>, <code>rrNiv</code><br/>
                Opcionales: <code>causasAsociadas</code>, <code>iso27001</code>, <code>iso27002</code>, <code>circular</code>, <code>sfc</code>, <code>otras</code>
              </div>
              <div>
                <strong style={{ color:'var(--text)' }}>Opción B — JSON</strong><br/>
                Array de objetos con los mismos campos que el Excel, o exporta la plantilla actual y modifícala.
                <br/>
                <button className="btn btn-ghost btn-sm" style={{ marginTop:6, padding:'2px 0', fontSize:'.78rem' }} onClick={handleDownload}>
                  → Descargar plantilla actual como JSON
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Barra de búsqueda (solo en modo normal) */}
        {!isPreviewMode && (
          <div className="toolbar" style={{ marginBottom:12 }}>
            <div className="search-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input className="form-control" placeholder="Buscar control…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <span style={{ fontSize:'.75rem', color:'var(--text-muted)', marginLeft:'auto' }}>
              {filtered.length}/{activeControls.length} controles
              {template ? ' · Plantilla personalizada' : ' · Plantilla por defecto'}
            </span>
          </div>
        )}

        {/* Tabla de controles */}
        <div className="table-wrap card">
          <table>
            <thead>
              <tr>
                <th style={{ width:80 }}>Código</th>
                <th>Causa base</th>
                <th>Control base</th>
                <th style={{ width:80 }}>RI</th>
                <th style={{ width:80 }}>RR</th>
                <th style={{ width:120 }}>Normatividad</th>
              </tr>
            </thead>
            <tbody>
              {(isPreviewMode ? preview : filtered).map((c, i) => {
                const normas = Object.entries(c.normatividad || {})
                  .filter(([, v]) => v && !v.startsWith('Validar') && v !== 'Aplica')
                  .map(([k]) => k.toUpperCase());
                return (
                  <tr key={c.code || i}>
                    <td>
                      <span className="chip" style={{ fontFamily:'var(--mono)', fontWeight:700, color:'var(--orange)', fontSize:'.78rem' }}>
                        {c.code}
                      </span>
                    </td>
                    <td style={{ maxWidth:200, fontSize:'.8rem' }}>
                      <div style={{ fontWeight:600 }}>{c.causaBase || '—'}</div>
                      {c.causasAsociadas && (
                        <div style={{ fontSize:'.72rem', color:'var(--text-muted)', marginTop:2, lineHeight:1.3 }}>
                          {c.causasAsociadas.substring(0,80)}{c.causasAsociadas.length>80?'…':''}
                        </div>
                      )}
                    </td>
                    <td style={{ maxWidth:280, fontSize:'.8rem', lineHeight:1.4 }}>
                      {(c.controlBase||'').substring(0,150)}{(c.controlBase||'').length>150?'…':''}
                    </td>
                    <td><span className={`badge ${RISK_COLORS[c.riNiv]||'badge-gray'}`}>{c.riNiv||'—'}</span></td>
                    <td><span className={`badge ${RISK_COLORS[c.rrNiv]||'badge-gray'}`}>{c.rrNiv||'—'}</span></td>
                    <td>
                      {normas.length > 0
                        ? <div style={{ display:'flex', flexWrap:'wrap', gap:3 }}>
                            {normas.map(n => (
                              <span key={n} style={{ fontSize:'.62rem', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:3, padding:'1px 5px', color:'var(--text-muted)' }}>
                                {n}
                              </span>
                            ))}
                          </div>
                        : <span style={{ color:'var(--text-muted)', fontSize:'.75rem' }}>—</span>}
                    </td>
                  </tr>
                );
              })}
              {(isPreviewMode ? preview : filtered).length === 0 && (
                <tr><td colSpan={6}>
                  <div className="empty"><p>Sin controles con estos filtros</p></div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de confirmación para restablecer */}
      {confirmClear && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget&&setConfirmClear(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Restablecer plantilla</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setConfirmClear(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="alert alert-warning" style={{ marginBottom:12 }}>
                Se eliminará la plantilla personalizada y se volverán a usar los {DEFAULT_CONTROLS.length} controles por defecto.
              </div>
              <p>Los proyectos ya creados <strong>no se verán afectados</strong>. Solo los nuevos proyectos usarán la plantilla por defecto.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setConfirmClear(false)}>Cancelar</button>
              <button className="btn btn-danger" onClick={handleClear}>Sí, restablecer</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
