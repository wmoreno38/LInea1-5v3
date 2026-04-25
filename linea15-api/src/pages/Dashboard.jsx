import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projects } from '../api/client.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#3b82f6'];

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    projects.list().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  const totalControls = data.reduce((s, p) => s + (p.controls?.length || 0), 0);
  const filledControls = data.reduce((s, p) => s + (p.controls?.filter(c => c.compliance?.trim()).length || 0), 0);
  const totalEvidences = data.reduce((s, p) => s + (p.evidences?.length || 0), 0);
  const approved = data.reduce((s, p) => s + (p.evidences?.filter(e => e.status === 'aprobada').length || 0), 0);
  const completionPct = totalControls ? Math.round((filledControls / totalControls) * 100) : 0;

  // Para gráficas
  const projectChart = data.slice(0, 8).map(p => ({
    name: p.name.length > 15 ? p.name.slice(0, 15) + '…' : p.name,
    controles: p.controls?.filter(c => c.compliance?.trim()).length || 0,
    total: p.controls?.length || 0,
  }));

  const statusData = [
    { name: 'Aprobadas', value: approved },
    { name: 'En revisión', value: data.reduce((s, p) => s + (p.evidences?.filter(e => e.status === 'en_revision').length || 0), 0) },
    { name: 'Rechazadas', value: data.reduce((s, p) => s + (p.evidences?.filter(e => e.status === 'rechazada').length || 0), 0) },
  ].filter(d => d.value > 0);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando dashboard...</div>;

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <div className="subtitle">Buenos días, {user?.name?.split(' ')[0] || user?.username} · {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
      </div>

      <div className="page-body">
        <div className="kpi-grid">
          <div className="kpi-card orange">
            <div className="kpi-label">Proyectos activos</div>
            <div className="kpi-value">{data.length}</div>
            <div className="kpi-sub">matrices en gestión</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Controles documentados</div>
            <div className="kpi-value">{filledControls}<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/{totalControls}</span></div>
            <div className="progress-bar" style={{ marginTop: 4 }}>
              <div className="progress-fill" style={{ width: completionPct + '%' }} />
            </div>
            <div className="kpi-sub">{completionPct}% completado</div>
          </div>
          <div className="kpi-card green">
            <div className="kpi-label">Evidencias totales</div>
            <div className="kpi-value">{totalEvidences}</div>
            <div className="kpi-sub">{approved} aprobadas</div>
          </div>
          <div className="kpi-card blue">
            <div className="kpi-label">Tasa de aprobación</div>
            <div className="kpi-value">{totalEvidences ? Math.round((approved / totalEvidences) * 100) : 0}%</div>
            <div className="kpi-sub">evidencias aprobadas</div>
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <h3>Controles por proyecto</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={projectChart} margin={{ left: -20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="controles" name="Documentados" fill="#E87722" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total" name="Total" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {statusData.length > 0 && (
            <div className="chart-card">
              <h3>Estado de evidencias</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Proyectos recientes</span>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/projects')}>Ver todos</button>
          </div>
          <div className="table-wrap" style={{ borderRadius: 0, border: 'none' }}>
            <table>
              <thead>
                <tr><th>Proyecto</th><th>Responsable</th><th>Controles</th><th>Evidencias</th><th>Avance</th></tr>
              </thead>
              <tbody>
                {data.slice(0, 5).map(p => {
                  const filled = p.controls?.filter(c => c.compliance?.trim()).length || 0;
                  const total = p.controls?.length || 0;
                  const pct = total ? Math.round((filled / total) * 100) : 0;
                  return (
                    <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/projects/${p.id}`)}>
                      <td><strong>{p.name}</strong></td>
                      <td style={{ color: 'var(--text-muted)' }}>{p.responsible || '—'}</td>
                      <td><span className="font-mono">{filled}/{total}</span></td>
                      <td><span className="badge badge-blue">{p.evidences?.length || 0}</span></td>
                      <td style={{ minWidth: 100 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress-bar" style={{ flex: 1 }}>
                            <div className="progress-fill" style={{ width: pct + '%', background: pct === 100 ? 'var(--success)' : 'var(--orange)' }} />
                          </div>
                          <span style={{ fontSize: '.75rem', color: 'var(--text-muted)', width: 30 }}>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {data.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No hay proyectos activos</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
