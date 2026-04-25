import React, { useEffect, useState } from 'react';
import { users as usersApi, projects as projectsApi } from '../api/client.js';
import { useAuth } from '../contexts/AuthContext.jsx';

// ── Roles del sistema ─────────────────────────────────────────────────
export const ROLES = {
  admin:    { l: 'Administrador',     desc: 'Acceso total al sistema',                           perms: ['create_project','delete_project','fill_controls','add_evidence','approve_evidence','edit_evidence','delete_evidence','manage_users'] },
  lider:    { l: 'Líder Técnico',     desc: 'Gestión de proyectos y evidencias asignadas',       perms: ['create_project','fill_controls','add_evidence','approve_evidence','edit_evidence','delete_evidence'] },
  analista: { l: 'Analista',          desc: 'Documenta controles y sube evidencias',             perms: ['fill_controls','add_evidence','edit_evidence'] },
  auditor:  { l: 'Auditor / Revisor', desc: 'Solo aprueba o rechaza evidencias',                perms: ['approve_evidence'] },
  viewer:   { l: 'Solo lectura',      desc: 'Puede ver proyectos asignados sin modificar',      perms: [] },
};

export const ROLE_COLORS = {
  admin: 'badge-red', lider: 'badge-orange', analista: 'badge-blue', auditor: 'badge-green', viewer: 'badge-gray',
};

// ── Niveles de acceso por proyecto (igual que V2) ────────────────────
export const PROJECT_ACCESS = {
  none:     { l: 'Sin acceso',           icon: '❌', desc: 'No puede ver este proyecto',                color: '#DC2626' },
  full:     { l: 'Completo',             icon: '✅', desc: 'Puede hacer todo según su rol',             color: '#2E8B57' },
  fill:     { l: 'Solo llenar controles',icon: '📝', desc: 'Solo documenta controles',                 color: '#1A7AB5' },
  evidence: { l: 'Solo evidencias',      icon: '📎', desc: 'Solo agrega evidencias',                   color: '#D97706' },
  view:     { l: 'Solo ver',             icon: '👁️', desc: 'Solo lectura de este proyecto',            color: '#6B7280' },
};

const PERM_LABELS = {
  create_project:'Crear proyectos', delete_project:'Eliminar proyectos',
  fill_controls:'Documentar controles', add_evidence:'Agregar evidencias',
  approve_evidence:'Aprobar/rechazar evidencias', edit_evidence:'Editar evidencias',
  delete_evidence:'Eliminar evidencias', manage_users:'Administrar usuarios',
};

function getRoleLabel(r) { return ROLES[r]?.l || r || '—'; }
function getRoleColor(r) { return ROLE_COLORS[r] || 'badge-gray'; }

export default function Users() {
  const [data, setData]         = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all');
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal]     = useState(null);
  const [permsModal, setPermsModal]   = useState(null);
  const [form, setForm]         = useState({ email:'', password:'', username:'', name:'', role:'analista' });
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const { user: me }            = useAuth();

  const load = () => {
    setLoading(true);
    Promise.all([usersApi.list(), projectsApi.list()])
      .then(([u, p]) => { setData(u); setProjects(p); })
      .catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleCreate = async e => {
    e.preventDefault(); setSaving(true); setError('');
    try { await usersApi.create(form); setCreateModal(false); setForm({ email:'', password:'', username:'', name:'', role:'analista' }); load(); }
    catch(err) { setError(err.message); } finally { setSaving(false); }
  };

  const handleEditRole = async (userId, newRole) => {
    await usersApi.update(userId, { role: newRole }).catch(e => alert(e.message));
    load(); setEditModal(null);
  };

  const toggleActive = async u => {
    await usersApi.update(u.id, { action:'toggle', active:!u.active }).catch(e => alert(e.message)); load();
  };

  const handleDelete = async u => {
    if (!confirm(`¿Eliminar usuario ${u.name}?`)) return;
    await usersApi.delete(u.id).catch(e => alert(e.message)); load();
  };

  const savePerms = async (userId, perms) => {
    await usersApi.update(userId, { action:'update_perms', project_perms:perms }).catch(e => alert(e.message));
    load(); setPermsModal(null);
  };

  const filtered = data.filter(u => {
    const q = search.toLowerCase();
    const matchQ = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.username?.toLowerCase().includes(q);
    const matchF = filter==='all' || (filter==='active'&&u.active) || (filter==='inactive'&&!u.active);
    return matchQ && matchF;
  });

  return (
    <>
      <div className="page-header">
        <div>
          <h2>⚙️ Administración de Usuarios</h2>
          <div className="subtitle">Crear, editar y asignar permisos por proyecto</div>
        </div>
        <button className="btn btn-primary" onClick={() => setCreateModal(true)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Nuevo Usuario
        </button>
      </div>

      <div className="page-body">
        {/* Contadores */}
        <div style={{ display:'flex', gap:10, marginBottom:16 }}>
          {[
            { k:'all',      l:`${data.length} Total`,             c:'var(--text)' },
            { k:'active',   l:`${data.filter(u=>u.active).length} Activos`,    c:'var(--success)' },
            { k:'inactive', l:`${data.filter(u=>!u.active).length} Inactivos`, c:'var(--danger)' },
          ].map(b => (
            <button key={b.k}
              onClick={() => setFilter(b.k)}
              style={{ padding:'6px 14px', borderRadius:20, border:`1.5px solid ${filter===b.k?b.c:'var(--border)'}`, background:filter===b.k?b.c+'18':'var(--surface)', color:b.c, fontWeight:700, fontSize:'.8rem', cursor:'pointer', fontFamily:'var(--font)' }}>
              {b.l}
            </button>
          ))}
        </div>

        {/* Buscador */}
        <div className="search-box" style={{ marginBottom:16 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input className="form-control" placeholder="Buscar usuario..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>Cargando usuarios...</div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {filtered.map(u => {
              const perms = u.projectPerms || {};
              const assignedProjects = projects.filter(p => perms[p.id] && perms[p.id] !== 'none');
              return (
                <div key={u.id} className="card" style={{ padding:'16px 20px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                    {/* Avatar */}
                    <div style={{ width:40, height:40, borderRadius:'50%', background:u.id===me?.userId?'var(--orange)':'var(--bg)', border:'2px solid var(--border)', display:'grid', placeItems:'center', fontSize:'.85rem', fontWeight:800, color:u.id===me?.userId?'#fff':'var(--text-muted)', flexShrink:0 }}>
                      {(u.name||'U').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                        <span style={{ fontWeight:700, fontSize:'.92rem' }}>{u.name}</span>
                        <span style={{ fontSize:'.72rem', color:'var(--text-muted)', fontFamily:'var(--mono)' }}>@{u.username}</span>
                        <span className={`badge ${getRoleColor(u.role)}`}>{getRoleLabel(u.role)}</span>
                      </div>
                      <div style={{ fontSize:'.78rem', color:'var(--text-muted)' }}>{u.email}</div>
                      {/* Proyectos asignados */}
                      {assignedProjects.length > 0 && (
                        <div style={{ marginTop:6, display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                          <span style={{ fontSize:'.7rem', color:'var(--text-muted)' }}>Proyectos asignados:</span>
                          {assignedProjects.map(p => {
                            const acc = PROJECT_ACCESS[perms[p.id]];
                            return (
                              <span key={p.id} style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 8px', borderRadius:20, background:acc?.color+'18', border:`1px solid ${acc?.color}44`, fontSize:'.7rem', fontWeight:600, color:acc?.color }}>
                                {acc?.icon} {p.name} → {acc?.l}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Estado */}
                    <button
                      onClick={() => u.id!==me?.userId && toggleActive(u)}
                      style={{ padding:'6px 14px', borderRadius:20, border:'none', background:u.active?'#dcfce7':'#fee2e2', color:u.active?'#15803d':'#b91c1c', fontWeight:700, fontSize:'.8rem', cursor:u.id!==me?.userId?'pointer':'default', fontFamily:'var(--font)' }}>
                      {u.active ? '✓ Activo' : '○ Inactivo'}
                    </button>

                    {/* Acciones */}
                    <div style={{ display:'flex', gap:6 }}>
                      {/* Permisos por proyecto */}
                      {u.role!=='admin' && (
                        <button className="btn btn-secondary btn-icon" onClick={()=>setPermsModal(u)} title="Permisos por proyecto">
                          🔑
                        </button>
                      )}
                      {/* Editar rol */}
                      {u.id!==me?.userId && (
                        <button className="btn btn-secondary btn-icon" onClick={()=>setEditModal(u)} title="Editar rol">
                          ✏️
                        </button>
                      )}
                      {/* Eliminar */}
                      {u.id!==me?.userId && (
                        <button className="btn btn-danger btn-icon" onClick={()=>handleDelete(u)} title="Eliminar usuario">
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.length===0 && <div className="empty card" style={{padding:40}}><p>Sin usuarios</p></div>}
          </div>
        )}

        {/* Matriz de roles */}
        <div className="card" style={{ marginTop:24 }}>
          <div className="card-header"><span className="card-title">Matriz de roles y permisos del sistema</span></div>
          <div className="table-wrap" style={{ border:'none', borderRadius:0 }}>
            <table>
              <thead>
                <tr>
                  <th>Permiso</th>
                  {Object.entries(ROLES).map(([k,r]) => <th key={k}><span className={`badge ${getRoleColor(k)}`}>{r.l}</span></th>)}
                </tr>
              </thead>
              <tbody>
                {Object.entries(PERM_LABELS).map(([perm,label]) => (
                  <tr key={perm}>
                    <td style={{ fontSize:'.82rem', fontWeight:500 }}>{label}</td>
                    {Object.entries(ROLES).map(([k,r]) => (
                      <td key={k} style={{ textAlign:'center' }}>
                        {r.perms.includes(perm) ? <span style={{ color:'var(--success)', fontSize:'1.1rem' }}>✓</span> : <span style={{ color:'var(--border)' }}>—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Modal crear ─────────────────────────────────────────────── */}
      {createModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setCreateModal(false)}>
          <div className="modal">
            <div className="modal-header"><span className="modal-title">Nuevo usuario</span><button className="btn btn-ghost btn-icon" onClick={()=>setCreateModal(false)}>✕</button></div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                {error && <div className="alert alert-error mb-4">{error}</div>}
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Nombre completo *</label><input className="form-control" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required /></div>
                  <div className="form-group"><label className="form-label">Usuario *</label><input className="form-control" value={form.username} onChange={e=>setForm(f=>({...f,username:e.target.value.toLowerCase().replace(/\s/g,'')}))} required /></div>
                </div>
                <div className="form-group"><label className="form-label">Correo *</label><input className="form-control" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} required /></div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Contraseña *</label><input className="form-control" type="password" placeholder="Mín. 8 caracteres" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} required minLength={8} /></div>
                  <div className="form-group">
                    <label className="form-label">Rol</label>
                    <select className="form-control" value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>
                      {Object.entries(ROLES).map(([k,r])=><option key={k} value={k}>{r.l}</option>)}
                    </select>
                  </div>
                </div>
                {form.role && ROLES[form.role] && (
                  <div className="alert alert-info">
                    <div><strong>{ROLES[form.role].l}:</strong> {ROLES[form.role].desc}</div>
                    <div style={{ marginTop:6, display:'flex', flexWrap:'wrap', gap:4 }}>
                      {ROLES[form.role].perms.length>0 ? ROLES[form.role].perms.map(p=><span key={p} className="chip" style={{fontSize:'.68rem'}}>{PERM_LABELS[p]}</span>) : <span style={{fontSize:'.75rem',color:'var(--text-muted)'}}>Sin permisos de edición</span>}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={()=>setCreateModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Creando...':'Crear usuario'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal editar rol ─────────────────────────────────────────── */}
      {editModal && <EditRolModal user={editModal} onSave={handleEditRole} onClose={()=>setEditModal(null)} />}

      {/* ── Modal permisos por proyecto ──────────────────────────────── */}
      {permsModal && <PermsModal user={permsModal} projects={projects} onSave={savePerms} onClose={()=>setPermsModal(null)} />}
    </>
  );
}

// ── Modal editar rol ─────────────────────────────────────────────────
function EditRolModal({ user, onSave, onClose }) {
  const [role, setRole] = useState(user.role || 'viewer');
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div><span className="modal-title">Editar rol — {user.name}</span><div style={{fontSize:'.75rem',color:'var(--text-muted)',marginTop:2}}>@{user.username}</div></div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {Object.entries(ROLES).map(([k,r]) => (
              <label key={k} style={{ display:'flex', alignItems:'flex-start', gap:10, cursor:'pointer', padding:'12px 14px', borderRadius:'var(--radius-sm)', border:`1.5px solid ${role===k?'var(--orange)':'var(--border)'}`, background:role===k?'var(--orange-light)':'var(--surface)', transition:'all .15s' }}>
                <input type="radio" name="role" value={k} checked={role===k} onChange={()=>setRole(k)} style={{ accentColor:'var(--orange)', marginTop:3, flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}><span className={`badge ${ROLE_COLORS[k]}`}>{r.l}</span></div>
                  <div style={{ fontSize:'.75rem', color:'var(--text-muted)', marginBottom:4 }}>{r.desc}</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:3 }}>
                    {r.perms.length>0 ? r.perms.map(p=><span key={p} className="chip" style={{fontSize:'.62rem',padding:'2px 5px'}}>{p.replace(/_/g,' ')}</span>) : <span style={{fontSize:'.7rem',color:'var(--text-light)'}}>Sin permisos de edición</span>}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={()=>onSave(user.id, role)} disabled={role===user.role}>Guardar cambio de rol</button>
        </div>
      </div>
    </div>
  );
}

// ── Modal permisos por proyecto con 5 niveles ────────────────────────
function PermsModal({ user, projects, onSave, onClose }) {
  const [perms, setPerms] = useState({ ...(user.projectPerms||{}) });
  const setAccess = (pid, level) => setPerms(p => ({ ...p, [pid]: level }));

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <div>
            <span className="modal-title">Permisos de: {user.name}</span>
            <div style={{ fontSize:'.75rem', color:'var(--text-muted)', marginTop:4 }}>
              Asigna el nivel de acceso para cada proyecto:
            </div>
            {/* Leyenda */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:6 }}>
              {Object.entries(PROJECT_ACCESS).filter(([k])=>k!=='none').map(([k,v]) => (
                <span key={k} style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 10px', borderRadius:20, background:v.color+'18', border:`1px solid ${v.color}44`, fontSize:'.7rem', fontWeight:600, color:v.color }}>
                  {v.icon} {v.l}
                </span>
              ))}
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {projects.length === 0 ? (
            <p style={{ color:'var(--text-muted)' }}>No hay proyectos disponibles.</p>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {projects.map(p => {
                const current = perms[p.id] || 'none';
                const acc = PROJECT_ACCESS[current];
                return (
                  <div key={p.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderRadius:'var(--radius-sm)', border:`1.5px solid ${current!=='none'?acc?.color+'55':'var(--border)'}`, background:current!=='none'?acc?.color+'08':'var(--surface)' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:600, fontSize:'.88rem' }}>{p.name}</div>
                      {p.responsible && <div style={{ fontSize:'.72rem', color:'var(--text-muted)' }}>{p.responsible}</div>}
                    </div>
                    {/* Selector de nivel */}
                    <select
                      value={current}
                      onChange={e => setAccess(p.id, e.target.value)}
                      style={{ padding:'7px 12px', borderRadius:'var(--radius-sm)', border:`1.5px solid ${acc?.color||'var(--border)'}`, background:'var(--surface)', color:acc?.color||'var(--text)', fontWeight:700, fontSize:'.82rem', cursor:'pointer', fontFamily:'var(--font)', outline:'none', minWidth:180 }}
                    >
                      {Object.entries(PROJECT_ACCESS).map(([k,v]) => (
                        <option key={k} value={k}>{v.icon} {v.l}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={()=>onSave(user.id, perms)}>Guardar permisos</button>
        </div>
      </div>
    </div>
  );
}
