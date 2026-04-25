import React, { useEffect, useState } from 'react';
import { users as usersApi, projects as projectsApi } from '../api/client.js';
import { useAuth } from '../contexts/AuthContext.jsx';

const ROLES = { admin: 'Administrador', viewer: 'Líder/Visor' };

export default function Users() {
  const [data, setData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [permsModal, setPermsModal] = useState(null);
  const [form, setForm] = useState({ email: '', password: '', username: '', name: '', role: 'viewer' });
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
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await usersApi.create(form);
      setModal(false);
      setForm({ email: '', password: '', username: '', name: '', role: 'viewer' });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (u) => {
    await usersApi.update(u.id, { action: 'toggle', active: !u.active }).catch(e => alert(e.message));
    load();
  };

  const handleDelete = async (u) => {
    if (!confirm(`¿Eliminar usuario ${u.name}? Esta acción no se puede deshacer.`)) return;
    await usersApi.delete(u.id).catch(e => alert(e.message));
    load();
  };

  const savePerms = async (userId, perms) => {
    await usersApi.update(userId, { action: 'update_perms', project_perms: perms }).catch(e => alert(e.message));
    load();
    setPermsModal(null);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Usuarios</h2>
          <div className="subtitle">{data.length} usuarios registrados</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Nuevo usuario
        </button>
      </div>

      <div className="page-body">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Cargando usuarios...</div>
        ) : (
          <div className="table-wrap card">
            <table>
              <thead>
                <tr><th>Usuario</th><th>Email</th><th>Rol</th><th>Estado</th><th>Intentos fallidos</th><th></th></tr>
              </thead>
              <tbody>
                {data.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: u.id === me?.userId ? 'var(--orange)' : 'var(--bg)', border: '2px solid var(--border)', display: 'grid', placeItems: 'center', fontSize: '.8rem', fontWeight: 700, color: u.id === me?.userId ? '#fff' : 'var(--text-muted)', flexShrink: 0 }}>
                          {(u.name || u.username || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '.88rem' }}>{u.name}</div>
                          <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '.82rem', color: 'var(--text-muted)' }}>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-orange' : 'badge-blue'}`}>
                        {ROLES[u.role] || u.role}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`badge ${u.active ? 'badge-green' : 'badge-red'}`}
                        style={{ cursor: u.id !== me?.userId ? 'pointer' : 'default', border: 'none', background: 'none' }}
                        onClick={() => u.id !== me?.userId && toggleActive(u)}
                        title={u.id === me?.userId ? 'No puedes desactivarte a ti mismo' : `Click para ${u.active ? 'desactivar' : 'activar'}`}
                      >
                        {u.active ? '● Activo' : '○ Inactivo'}
                      </button>
                    </td>
                    <td>
                      {u.failedAttempts > 0 ? (
                        <span className={`badge ${u.failedAttempts >= 3 ? 'badge-red' : 'badge-yellow'}`}>
                          {u.failedAttempts} intentos
                          {u.lockedUntil && new Date(u.lockedUntil) > new Date() && ' · Bloqueado'}
                        </span>
                      ) : <span style={{ color: 'var(--text-light)', fontSize: '.78rem' }}>—</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {u.role !== 'admin' && (
                          <button className="btn btn-secondary btn-sm" onClick={() => setPermsModal(u)}>Permisos</button>
                        )}
                        {u.id !== me?.userId && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u)}>Eliminar</button>
                        )}
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
                  <div className="form-group">
                    <label className="form-label">Nombre completo *</label>
                    <input className="form-control" placeholder="Nombre Apellido" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Usuario *</label>
                    <input className="form-control" placeholder="usuario123" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/\s/g, '') }))} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Correo electrónico *</label>
                  <input className="form-control" type="email" placeholder="usuario@porvenir.com.co" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Contraseña *</label>
                    <input className="form-control" type="password" placeholder="Mín. 8 caracteres" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={8} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rol</label>
                    <select className="form-control" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                      <option value="viewer">Líder/Visor</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                </div>
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
      {permsModal && (
        <PermsModal
          user={permsModal}
          projects={projects}
          onSave={savePerms}
          onClose={() => setPermsModal(null)}
        />
      )}
    </>
  );
}

function PermsModal({ user, projects, onSave, onClose }) {
  const [perms, setPerms] = useState(user.projectPerms || {});

  const toggle = (projectId) => {
    setPerms(p => ({ ...p, [projectId]: !p[projectId] }));
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Permisos de {user.name}</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: '.83rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            Selecciona los proyectos a los que este usuario puede acceder.
          </p>
          {projects.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '.85rem' }}>No hay proyectos disponibles.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {projects.map(p => (
                <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: perms[p.id] ? 'var(--orange-light)' : 'var(--surface)' }}>
                  <input type="checkbox" checked={!!perms[p.id]} onChange={() => toggle(p.id)} style={{ accentColor: 'var(--orange)', width: 15, height: 15 }} />
                  <span style={{ fontSize: '.85rem', fontWeight: 500 }}>{p.name}</span>
                  {p.responsible && <span style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>{p.responsible}</span>}
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => onSave(user.id, perms)}>Guardar permisos</button>
        </div>
      </div>
    </div>
  );
}
