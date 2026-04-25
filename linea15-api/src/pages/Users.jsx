import React, { useEffect, useState } from 'react';
import { users as usersApi, projects as projectsApi } from '../api/client.js';
import { useAuth } from '../contexts/AuthContext.jsx';

// ── 5 roles con permisos segregados (igual que V2) ──────────────────
export const ROLES = {
  admin:    { l: 'Administrador',    desc: 'Acceso total al sistema',                                   perms: ['create_project','delete_project','fill_controls','add_evidence','approve_evidence','edit_evidence','delete_evidence','manage_users'] },
  lider:    { l: 'Líder Técnico',    desc: 'Gestión de proyectos y evidencias asignadas',               perms: ['create_project','fill_controls','add_evidence','approve_evidence','edit_evidence','delete_evidence'] },
  analista: { l: 'Analista',         desc: 'Documenta controles y sube evidencias',                     perms: ['fill_controls','add_evidence','edit_evidence'] },
  auditor:  { l: 'Auditor / Revisor',desc: 'Solo puede aprobar o rechazar evidencias',                  perms: ['approve_evidence'] },
  viewer:   { l: 'Solo lectura',     desc: 'Puede ver proyectos asignados sin modificar nada',          perms: [] },
};

const ROLE_COLORS = { admin: 'badge-red', lider: 'badge-orange', analista: 'badge-blue', auditor: 'badge-green', viewer: 'badge-gray' };
const PERM_LABELS = { create_project: 'Crear proyectos', delete_project: 'Eliminar proyectos', fill_controls: 'Documentar controles', add_evidence: 'Agregar evidencias', approve_evidence: 'Aprobar/rechazar evidencias', edit_evidence: 'Editar evidencias', delete_evidence: 'Eliminar evidencias', manage_users: 'Administrar usuarios' };

export default function Users() {
  const [data, setData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [permsModal, setPermsModal] = useState(null);
  const [form, setForm] = useState({ email: '', password: '', username: '', name: '', role: 'analista' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { user: me } = useAuth();

  const load = () => {
    setLoading(true);
    Promise.all([usersApi.list(), projectsApi.list()])
      .then(([u, p]) => { setData(u); setProjects(p); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await usersApi.create(form);
      setModal(false); setForm({ email: '', password: '', username: '', name: '', role: 'analista' }); load();
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  const toggleActive = async (u) => {
    await usersApi.update(u.id, { action: 'toggle', active: !u.active }).catch(e => alert(e.message)); load();
  };

  const handleDelete = async (u) => {
    if (!confirm(`¿Eliminar usuario ${u.name}? Esta acción no se puede deshacer.`)) return;
    await usersApi.delete(u.id).catch(e => alert(e.message)); load();
  };

  const savePerms = async (userId, perms) => {
    await usersApi.update(userId, { action: 'update_perms', project_perms: perms }).catch(e => alert(e.message));
    load(); setPermsModal(null);
  };

  return (
    <>
      <div className="page-header">
        <div><h2>Usuarios</h2><div className="subtitle">{data.length} usuarios · {Object.keys(ROLES).length} roles</div></div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Nuevo usuario
        </button>
      </div>

      <div className="page-body">
        {/* Tabla de roles */}
        <div className="card mb-6">
          <div className="card-header"><span className="card-title">Matriz de roles y permisos</span></div>
          <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Permiso</th>
                  {Object.entries(ROLES).map(([k, r]) => <th key={k}><span className={`badge ${ROLE_COLORS[k]}`}>{r.l}</span></th>)}
                </tr>
              </thead>
              <tbody>
                {Object.entries(PERM_LABELS).map(([perm, label]) => (
                  <tr key={perm}>
                    <td style={{ fontSize: '.82rem', fontWeight: 500 }}>{label}</td>
                    {Object.entries(ROLES).map(([k, r]) => (
                      <td key={k} style={{ textAlign: 'center' }}>
                        {r.perms.includes(perm) ? <span style={{ color: 'var(--success)', fontSize: '1rem' }}>✓</span> : <span style={{ color: 'var(--border)', fontSize: '1rem' }}>—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lista de usuarios */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Cargando usuarios...</div>
        ) : (
          <div className="table-wrap card">
            <table>
              <thead>
                <tr><th>Usuario</th><th>Email</th><th>Rol</th><th>Estado</th><th>Bloqueo</th><th></th></tr>
              </thead>
              <tbody>
                {data.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: u.id === me?.userId ? 'var(--orange)' : 'var(--bg)', border: '2px solid var(--border)', display: 'grid', placeItems: 'center', fontSize: '.8rem', fontWeight: 700, color: u.id === me?.userId ? '#fff' : 'var(--text-muted)', flexShrink: 0 }}>
                          {(u.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '.88rem' }}>{u.name}</div>
                          <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '.82rem', color: 'var(--text-muted)' }}>{u.email}</td>
                    <td>
                      <span className={`badge ${ROLE_COLORS[u.role] || 'badge-gray'}`}>{ROLES[u.role]?.l || u.role}</span>
                      <div style={{ fontSize: '.68rem', color: 'var(--text-muted)', marginTop: 2 }}>{ROLES[u.role]?.desc}</div>
                    </td>
                    <td>
                      <button
                        className={`badge ${u.active ? 'badge-green' : 'badge-red'}`}
                        style={{ cursor: u.id !== me?.userId ? 'pointer' : 'default', border: 'none' }}
                        onClick={() => u.id !== me?.userId && toggleActive(u)}
                        title={u.id === me?.userId ? 'No puedes desactivarte a ti mismo' : `Click para ${u.active ? 'desactivar' : 'activar'}`}
                      >
                        {u.active ? '● Activo' : '○ Inactivo'}
                      </button>
                    </td>
                    <td>
                      {u.failedAttempts > 0
                        ? <span className={`badge ${u.failedAttempts >= 3 ? 'badge-red' : 'badge-yellow'}`}>{u.failedAttempts} intentos{u.lockedUntil && new Date(u.lockedUntil) > new Date() ? ' · 🔒' : ''}</span>
                        : <span style={{ color: 'var(--text-light)', fontSize: '.78rem' }}>—</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {u.role !== 'admin' && <button className="btn btn-secondary btn-sm" onClick={() => setPermsModal(u)}>Permisos</button>}
                        {u.id !== me?.userId && <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u)}>Eliminar</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal crear usuario */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Nuevo usuario</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                {error && <div className="alert alert-error mb-4">{error}</div>}
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Nombre completo *</label><input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
                  <div className="form-group"><label className="form-label">Usuario *</label><input className="form-control" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/\s/g, '') }))} required /></div>
                </div>
                <div className="form-group"><label className="form-label">Correo *</label><input className="form-control" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required /></div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Contraseña *</label><input className="form-control" type="password" placeholder="Mín. 8 caracteres" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={8} /></div>
                  <div className="form-group">
                    <label className="form-label">Rol</label>
                    <select className="form-control" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                      {Object.entries(ROLES).map(([k, r]) => <option key={k} value={k}>{r.l}</option>)}
                    </select>
                  </div>
                </div>
                {form.role && ROLES[form.role] && (
                  <div className="alert alert-info">
                    <strong>{ROLES[form.role].l}:</strong> {ROLES[form.role].desc}
                    <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {ROLES[form.role].perms.map(p => <span key={p} className="chip" style={{ fontSize: '.68rem' }}>{PERM_LABELS[p]}</span>)}
                      {ROLES[form.role].perms.length === 0 && <span style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>Sin permisos de edición</span>}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creando...' : 'Crear usuario'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal permisos por proyecto */}
      {permsModal && <PermsModal user={permsModal} projects={projects} onSave={savePerms} onClose={() => setPermsModal(null)} />}
    </>
  );
}

function PermsModal({ user, projects, onSave, onClose }) {
  const [perms, setPerms] = useState(user.projectPerms || {});
  const toggle = (pid) => setPerms(p => ({ ...p, [pid]: !p[pid] }));
  const allOn = projects.every(p => perms[p.id]);
  const toggleAll = () => {
    if (allOn) setPerms({});
    else setPerms(Object.fromEntries(projects.map(p => [p.id, true])));
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <span className="modal-title">Permisos de {user.name}</span>
            <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
              <span className={`badge ${ROLE_COLORS[user.role] || 'badge-gray'}`} style={{ marginRight: 6 }}>{ROLES[user.role]?.l}</span>
              Selecciona proyectos accesibles
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {projects.length === 0
            ? <p style={{ color: 'var(--text-muted)' }}>No hay proyectos disponibles.</p>
            : <>
                <button className="btn btn-secondary btn-sm" style={{ marginBottom: 10 }} onClick={toggleAll}>{allOn ? 'Quitar todos' : 'Seleccionar todos'}</button>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {projects.map(p => (
                    <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: `1px solid ${perms[p.id] ? 'var(--orange)' : 'var(--border)'}`, background: perms[p.id] ? 'var(--orange-light)' : 'var(--surface)', transition: 'all .15s' }}>
                      <input type="checkbox" checked={!!perms[p.id]} onChange={() => toggle(p.id)} style={{ accentColor: 'var(--orange)', width: 15, height: 15, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '.85rem', fontWeight: 500 }}>{p.name}</div>
                        {p.responsible && <div style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>{p.responsible}</div>}
                      </div>
                    </label>
                  ))}
                </div>
              </>
          }
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => onSave(user.id, perms)}>Guardar permisos</button>
        </div>
      </div>
    </div>
  );
}
