import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projects as projectsApi, controls as controlsApi, evidences as evidencesApi } from '../api/client.js';
import { useAuth } from '../contexts/AuthContext.jsx';

const RISK_COLORS = { Alto: 'badge-red', Medio: 'badge-yellow', Bajo: 'badge-green' };
const EV_STATUS = { aprobada: 'badge-green', rechazada: 'badge-red', en_revision: 'badge-yellow' };
const EV_STATUS_LABEL = { aprobada: 'Aprobada', rechazada: 'Rechazada', en_revision: 'En revisión' };

function toBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('controls');
  const [complianceEdits, setComplianceEdits] = useState({});
  const [saving, setSaving] = useState({});
  const [evModal, setEvModal] = useState(null); // control para agregar evidencia
  const [evForm, setEvForm] = useState({ type: 'Documento', description: '', date: '', notes: '', reviewer: '', files: [] });
  const [savingEv, setSavingEv] = useState(false);
  const [finalModal, setFinalModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState('');

  const load = () => {
    setLoading(true);
    projectsApi.list().then(list => {
      const p = list.find(x => x.id === id);
      setProject(p || null);
    }).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, [id]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando proyecto...</div>;
  if (!project) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--danger)' }}>Proyecto no encontrado</div>;

  const controls = project.controls || [];
  const evs = project.evidences || [];

  const filtered = controls.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.code.toLowerCase().includes(q) || c.causaBase?.toLowerCase().includes(q) || c.controlBase?.toLowerCase().includes(q);
    const matchRisk = !filterRisk || c.riNiv === filterRisk;
    return matchSearch && matchRisk;
  });

  const filledCount = controls.filter(c => c.compliance?.trim()).length;
  const pct = controls.length ? Math.round((filledCount / controls.length) * 100) : 0;

  const saveCompliance = async (ctrl) => {
    const value = complianceEdits[ctrl.id] !== undefined ? complianceEdits[ctrl.id] : ctrl.compliance;
    setSaving(s => ({ ...s, [ctrl.id]: true }));
    try {
      await controlsApi.updateCompliance(ctrl.id, value);
      load();
    } catch (e) { alert(e.message); }
    finally { setSaving(s => ({ ...s, [ctrl.id]: false })); }
  };

  const handleAddEvidence = async (e) => {
    e.preventDefault();
    setSavingEv(true);
    try {
      const filesData = await Promise.all(evForm.files.map(async (f) => ({ name: f.name, type: f.type, data: await toBase64(f) })));
      await evidencesApi.create({ projectId: id, controlId: evModal.id, ...evForm, files: filesData });
      setEvModal(null);
      setEvForm({ type: 'Documento', description: '', date: '', notes: '', reviewer: '', files: [] });
      load();
    } catch (err) { alert(err.message); }
    finally { setSavingEv(false); }
  };

  const handleDeleteEv = async (evId) => {
    if (!confirm('¿Eliminar esta evidencia?')) return;
    await evidencesApi.delete(evId).catch(e => alert(e.message));
    load();
  };

  const handleUpdateEvStatus = async (evId, status) => {
    await evidencesApi.update(evId, { status, reviewer: user?.name }).catch(e => alert(e.message));
    load();
  };

  const handleFinalize = async () => {
    try {
      await projectsApi.finalize(id, { finalizedBy: user?.name, finalizedByRole: user?.role, stats: { pct, filledCount, total: controls.length, evidences: evs.length } });
      navigate('/archive');
    } catch (e) { alert(e.message); }
    setFinalModal(false);
  };

  return (
    <>
      <div className="page-header">
        <button className="btn btn-ghost btn-icon" onClick={() => navigate('/projects')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <div style={{ flex: 1 }}>
          <h2>{project.name}</h2>
          <div className="subtitle">
            {project.responsible && <span>{project.responsible} · </span>}
            {filledCount}/{controls.length} controles · {evs.length} evidencias · {pct}% avance
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="progress-bar" style={{ width: 100 }}>
            <div className="progress-fill" style={{ width: pct + '%', background: pct === 100 ? 'var(--success)' : 'var(--orange)' }} />
          </div>
          <span style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>{pct}%</span>
          {isAdmin && pct === 100 && <button className="btn btn-primary btn-sm" onClick={() => setFinalModal(true)}>Finalizar matriz</button>}
        </div>
      </div>

      <div className="page-body">
        <div className="tabs">
          <button className={`tab ${activeTab === 'controls' ? 'active' : ''}`} onClick={() => setActiveTab('controls')}>Controles ({controls.length})</button>
          <button className={`tab ${activeTab === 'evidences' ? 'active' : ''}`} onClick={() => setActiveTab('evidences')}>Evidencias ({evs.length})</button>
        </div>

        {activeTab === 'controls' && (
          <>
            <div className="toolbar">
              <div className="search-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                <input className="form-control" placeholder="Buscar por código o descripción..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select className="form-control" style={{ width: 'auto' }} value={filterRisk} onChange={e => setFilterRisk(e.target.value)}>
                <option value="">Todos los riesgos</option>
                <option value="Alto">Alto</option>
                <option value="Medio">Medio</option>
                <option value="Bajo">Bajo</option>
              </select>
            </div>
            <div className="table-wrap card">
              <table>
                <thead>
                  <tr><th>Código</th><th>Causa base</th><th>Control base</th><th>RI</th><th>RR</th><th>Cumplimiento</th><th></th></tr>
                </thead>
                <tbody>
                  {filtered.map(c => {
                    const val = complianceEdits[c.id] !== undefined ? complianceEdits[c.id] : (c.compliance || '');
                    const evCount = evs.filter(e => e.controlId === c.id).length;
                    return (
                      <tr key={c.id}>
                        <td><span className="chip" style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--orange)' }}>{c.code}</span></td>
                        <td style={{ maxWidth: 200 }}>
                          <div style={{ fontSize: '.8rem', fontWeight: 600 }}>{c.causaBase}</div>
                          {c.causasAsociadas && <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{c.causasAsociadas}</div>}
                        </td>
                        <td style={{ maxWidth: 220, fontSize: '.8rem' }}>{c.controlBase}</td>
                        <td><span className={`badge ${RISK_COLORS[c.riNiv] || 'badge-gray'}`}>{c.riNiv}</span></td>
                        <td><span className={`badge ${RISK_COLORS[c.rrNiv] || 'badge-gray'}`}>{c.rrNiv}</span></td>
                        <td style={{ minWidth: 220 }}>
                          <div className="compliance-cell">
                            <textarea
                              className="form-control compliance-input"
                              rows={2}
                              placeholder="Documentar cumplimiento..."
                              value={val}
                              onChange={e => setComplianceEdits(ed => ({ ...ed, [c.id]: e.target.value }))}
                              style={{ fontSize: '.78rem', minHeight: 'unset' }}
                            />
                            <button className="btn btn-primary compliance-save" onClick={() => saveCompliance(c)} disabled={saving[c.id]}>
                              {saving[c.id] ? '...' : '✓'}
                            </button>
                          </div>
                        </td>
                        <td>
                          <button className="btn btn-secondary btn-sm" onClick={() => setEvModal(c)}>
                            + Evidencia {evCount > 0 && <span className="badge badge-orange" style={{ marginLeft: 4 }}>{evCount}</span>}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'evidences' && (
          <div>
            {evs.length === 0 ? (
              <div className="empty card" style={{ padding: 60 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                <p>No hay evidencias aún. Ve a la pestaña Controles para agregar.</p>
              </div>
            ) : (
              <div className="table-wrap card">
                <table>
                  <thead>
                    <tr><th>Control</th><th>Tipo</th><th>Descripción</th><th>Fecha</th><th>Archivos</th><th>Estado</th><th>Revisor</th><th></th></tr>
                  </thead>
                  <tbody>
                    {evs.map(ev => {
                      const ctrl = controls.find(c => c.id === ev.controlId);
                      return (
                        <tr key={ev.id}>
                          <td><span className="chip" style={{ fontFamily: 'var(--mono)', color: 'var(--orange)' }}>{ctrl?.code || '—'}</span></td>
                          <td><span className="badge badge-blue">{ev.type}</span></td>
                          <td style={{ maxWidth: 200, fontSize: '.82rem' }}>{ev.description}</td>
                          <td style={{ fontFamily: 'var(--mono)', fontSize: '.75rem' }}>{ev.date ? new Date(ev.date).toLocaleDateString('es-CO') : '—'}</td>
                          <td>
                            {(ev.files || []).map(f => (
                              <a key={f.id} href={f.data} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ padding: '3px 6px', fontSize: '.7rem' }}>
                                📎 {f.name}
                              </a>
                            ))}
                          </td>
                          <td>
                            {isAdmin ? (
                              <select className="form-control" style={{ fontSize: '.75rem', padding: '4px 8px', width: 'auto' }}
                                value={ev.status} onChange={e => handleUpdateEvStatus(ev.id, e.target.value)}>
                                <option value="en_revision">En revisión</option>
                                <option value="aprobada">Aprobada</option>
                                <option value="rechazada">Rechazada</option>
                              </select>
                            ) : (
                              <span className={`badge ${EV_STATUS[ev.status] || 'badge-gray'}`}>{EV_STATUS_LABEL[ev.status]}</span>
                            )}
                          </td>
                          <td style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>{ev.reviewer || '—'}</td>
                          <td>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteEv(ev.id)}>✕</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal agregar evidencia */}
      {evModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEvModal(null)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <span className="modal-title">Agregar evidencia — <span style={{ color: 'var(--orange)', fontFamily: 'var(--mono)' }}>{evModal.code}</span></span>
              <button className="btn btn-ghost btn-icon" onClick={() => setEvModal(null)}>✕</button>
            </div>
            <form onSubmit={handleAddEvidence}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Tipo</label>
                    <select className="form-control" value={evForm.type} onChange={e => setEvForm(f => ({ ...f, type: e.target.value }))}>
                      {['Documento', 'Captura', 'Informe', 'Certificado', 'Acta', 'Otro'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fecha</label>
                    <input className="form-control" type="date" value={evForm.date} onChange={e => setEvForm(f => ({ ...f, date: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Descripción *</label>
                  <textarea className="form-control" rows={2} placeholder="Descripción de la evidencia..." value={evForm.description} onChange={e => setEvForm(f => ({ ...f, description: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Notas adicionales</label>
                  <textarea className="form-control" rows={2} value={evForm.notes} onChange={e => setEvForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Revisor</label>
                  <input className="form-control" placeholder="Nombre del revisor" value={evForm.reviewer} onChange={e => setEvForm(f => ({ ...f, reviewer: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Archivos adjuntos</label>
                  <input type="file" multiple className="form-control" onChange={e => setEvForm(f => ({ ...f, files: Array.from(e.target.files) }))} />
                  {evForm.files.length > 0 && (
                    <div className="file-list">
                      {evForm.files.map((f, i) => (
                        <div key={i} className="file-item">
                          <span className="file-name">{f.name}</span>
                          <span className="file-size">{(f.size / 1024).toFixed(1)} KB</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEvModal(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={savingEv}>{savingEv ? 'Guardando...' : 'Guardar evidencia'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal finalizar */}
      {finalModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setFinalModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Finalizar matriz</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setFinalModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="alert alert-warning mb-4">
                Una vez finalizada, la matriz se moverá al archivo y no podrá editarse.
              </div>
              <p>¿Confirmas la finalización de <strong>{project.name}</strong> con {filledCount}/{controls.length} controles documentados?</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setFinalModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleFinalize}>Confirmar y archivar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
