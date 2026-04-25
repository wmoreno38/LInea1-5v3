import React, { useEffect, useState } from 'react';
import { archive as archiveApi } from '../api/client.js';
import * as XLSX from 'xlsx';

export default function Archive() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    archiveApi.list().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = data.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.responsible || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.finalizedBy || '').toLowerCase().includes(search.toLowerCase())
  );

  const exportProject = (p) => {
    const wb = XLSX.utils.book_new();

    const info = [
      ['MATRIZ DE RIESGOS TECNOLÓGICOS — ARCHIVO'],
      ['Proyecto', p.name],
      ['Responsable', p.responsible || ''],
      ['Finalizado por', p.finalizedBy || ''],
      ['Rol', p.finalizedByRole || ''],
      ['Fecha archivo', new Date(p.archivedAt).toLocaleDateString('es-CO')],
      ['Avance final', (p.stats?.pct || 0) + '%'],
      [],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(info), 'Info');

    const ctrlRows = [['Código', 'Causa Base', 'Causas Asociadas', 'Control Base', 'RI', 'RR', 'Cumplimiento']];
    (p.controls || []).forEach(c => {
      ctrlRows.push([c.code, c.causaBase, c.causasAsociadas, c.controlBase, c.riNiv, c.rrNiv, c.compliance || '']);
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(ctrlRows), 'Controles');

    const evRows = [['Control', 'Tipo', 'Descripción', 'Fecha', 'Estado', 'Revisor']];
    (p.evidences || []).forEach(e => {
      const ctrl = (p.controls || []).find(c => c.id === e.controlId);
      evRows.push([ctrl?.code || '—', e.type, e.description, e.date || '', e.status, e.reviewer || '']);
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(evRows), 'Evidencias');

    XLSX.writeFile(wb, `Archivo_${p.name.replace(/\s/g, '_')}_${new Date(p.archivedAt).toISOString().slice(0, 10)}.xlsx`);
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando archivo...</div>;

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Archivo</h2>
          <div className="subtitle">{data.length} matrices finalizadas</div>
        </div>
      </div>

      <div className="page-body">
        <div className="toolbar">
          <div className="search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input className="form-control" placeholder="Buscar en archivo..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty card" style={{ padding: 60 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"/></svg>
            <p>No hay matrices archivadas aún</p>
          </div>
        ) : (
          <div className="table-wrap card">
            <table>
              <thead>
                <tr><th>Proyecto</th><th>Responsable</th><th>Finalizado por</th><th>Fecha archivo</th><th>Controles</th><th>Evidencias</th><th>Avance</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <button className="btn btn-ghost" style={{ padding: '4px 0', fontWeight: 600, color: 'var(--text)' }} onClick={() => setSelected(selected?.id === p.id ? null : p)}>
                        {p.name}
                      </button>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '.82rem' }}>{p.responsible || '—'}</td>
                    <td style={{ fontSize: '.82rem' }}>{p.finalizedBy || '—'} {p.finalizedByRole && <span className="chip">{p.finalizedByRole}</span>}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '.75rem' }}>{new Date(p.archivedAt).toLocaleDateString('es-CO')}</td>
                    <td style={{ fontFamily: 'var(--mono)' }}>{(p.controls || []).filter(c => c.compliance?.trim()).length}/{p.controls?.length || 0}</td>
                    <td><span className="badge badge-blue">{p.evidences?.length || 0}</span></td>
                    <td>
                      <span className="badge badge-green">{p.stats?.pct || 100}%</span>
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => exportProject(p)}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                        Excel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Panel detalle */}
        {selected && (
          <div className="card" style={{ marginTop: 20 }}>
            <div className="card-header">
              <span className="card-title">Detalle: {selected.name}</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="card-body">
              <div className="tabs">
                <span className="tab active">Controles ({selected.controls?.length || 0})</span>
              </div>
              <div className="table-wrap" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                <table>
                  <thead><tr><th>Código</th><th>Causa Base</th><th>Control Base</th><th>RI</th><th>RR</th><th>Cumplimiento</th></tr></thead>
                  <tbody>
                    {(selected.controls || []).map(c => (
                      <tr key={c.id}>
                        <td><span className="chip" style={{ fontFamily: 'var(--mono)', color: 'var(--orange)' }}>{c.code}</span></td>
                        <td style={{ fontSize: '.8rem', maxWidth: 180 }}>{c.causaBase}</td>
                        <td style={{ fontSize: '.8rem', maxWidth: 200 }}>{c.controlBase}</td>
                        <td><span className={`badge ${c.riNiv === 'Alto' ? 'badge-red' : c.riNiv === 'Medio' ? 'badge-yellow' : 'badge-green'}`}>{c.riNiv}</span></td>
                        <td><span className={`badge ${c.rrNiv === 'Alto' ? 'badge-red' : c.rrNiv === 'Medio' ? 'badge-yellow' : 'badge-green'}`}>{c.rrNiv}</span></td>
                        <td style={{ fontSize: '.78rem', color: c.compliance ? 'var(--text)' : 'var(--text-light)', maxWidth: 250 }}>
                          {c.compliance || <em>Sin documentar</em>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
