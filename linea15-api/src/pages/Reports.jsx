import React, { useEffect, useState } from 'react';
import { projects as projectsApi } from '../api/client.js';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid
} from 'recharts';
import * as XLSX from 'xlsx';

const COLORS_PIE = ['#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];
const RISK_COLORS = { Alto: '#ef4444', Medio: '#f59e0b', Bajo: '#22c55e' };

export default function Reports() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState('all');

  useEffect(() => {
    projectsApi.list().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  const projects = selected === 'all' ? data : data.filter(p => p.id === selected);

  const allControls = projects.flatMap(p => (p.controls || []).map(c => ({ ...c, projectName: p.name })));
  const allEvs = projects.flatMap(p => (p.evidences || []).map(e => ({ ...e, projectName: p.name })));

  const filledControls = allControls.filter(c => c.compliance?.trim()).length;
  const totalControls = allControls.length;
  const completionPct = totalControls ? Math.round((filledControls / totalControls) * 100) : 0;

  // Gráfica 1: Avance por proyecto
  const projectProgress = data.slice(0, 10).map(p => {
    const total = p.controls?.length || 0;
    const filled = p.controls?.filter(c => c.compliance?.trim()).length || 0;
    return { name: p.name.slice(0, 18), avance: total ? Math.round((filled / total) * 100) : 0 };
  });

  // Gráfica 2: Distribución de riesgo inherente
  const riskDist = ['Alto', 'Medio', 'Bajo'].map(r => ({
    name: r, value: allControls.filter(c => c.riNiv === r).length
  })).filter(d => d.value > 0);

  // Gráfica 3: Estado de evidencias
  const evStatus = [
    { name: 'Aprobadas', value: allEvs.filter(e => e.status === 'aprobada').length },
    { name: 'En revisión', value: allEvs.filter(e => e.status === 'en_revision').length },
    { name: 'Rechazadas', value: allEvs.filter(e => e.status === 'rechazada').length },
  ].filter(d => d.value > 0);

  // Gráfica 4: Controles por nivel RI y RR
  const rirrData = ['Alto', 'Medio', 'Bajo'].map(nivel => ({
    nivel,
    RI: allControls.filter(c => c.riNiv === nivel).length,
    RR: allControls.filter(c => c.rrNiv === nivel).length,
  }));

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Hoja resumen
    const resumenData = [
      ['Reporte Línea 1.5 — Gestión de Riesgos TI', '', ''],
      ['Fecha', new Date().toLocaleDateString('es-CO'), ''],
      ['', '', ''],
      ['RESUMEN EJECUTIVO', '', ''],
      ['Total proyectos', projects.length, ''],
      ['Total controles', totalControls, ''],
      ['Controles documentados', filledControls, ''],
      ['% Avance general', completionPct + '%', ''],
      ['Total evidencias', allEvs.length, ''],
      ['Evidencias aprobadas', allEvs.filter(e => e.status === 'aprobada').length, ''],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resumenData), 'Resumen');

    // Hoja controles
    const ctrlRows = [['Proyecto', 'Código', 'Causa Base', 'Control Base', 'RI', 'RR', 'Cumplimiento', 'Con Evidencia']];
    allControls.forEach(c => {
      const hasEv = allEvs.some(e => e.controlId === c.id);
      ctrlRows.push([c.projectName, c.code, c.causaBase, c.controlBase, c.riNiv, c.rrNiv, c.compliance || '', hasEv ? 'Sí' : 'No']);
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(ctrlRows), 'Controles');

    // Hoja evidencias
    const evRows = [['Proyecto', 'Control', 'Tipo', 'Descripción', 'Fecha', 'Estado', 'Revisor']];
    allEvs.forEach(e => {
      const ctrl = allControls.find(c => c.id === e.controlId);
      evRows.push([e.projectName, ctrl?.code || '—', e.type, e.description, e.date || '', e.status, e.reviewer || '']);
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(evRows), 'Evidencias');

    XLSX.writeFile(wb, `Linea15_Reporte_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando reportes...</div>;

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Reportes</h2>
          <div className="subtitle">Análisis y exportación de datos</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select className="form-control" style={{ width: 'auto' }} value={selected} onChange={e => setSelected(e.target.value)}>
            <option value="all">Todos los proyectos</option>
            {data.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button className="btn btn-primary" onClick={exportExcel}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            Exportar Excel
          </button>
        </div>
      </div>

      <div className="page-body">
        <div className="kpi-grid" style={{ marginBottom: 24 }}>
          <div className="kpi-card orange"><div className="kpi-label">Proyectos</div><div className="kpi-value">{projects.length}</div></div>
          <div className="kpi-card"><div className="kpi-label">Controles documentados</div><div className="kpi-value">{completionPct}%</div><div className="progress-bar" style={{ marginTop: 4 }}><div className="progress-fill" style={{ width: completionPct + '%' }} /></div></div>
          <div className="kpi-card green"><div className="kpi-label">Evidencias</div><div className="kpi-value">{allEvs.length}</div><div className="kpi-sub">{allEvs.filter(e => e.status === 'aprobada').length} aprobadas</div></div>
          <div className="kpi-card blue"><div className="kpi-label">Controles alto riesgo</div><div className="kpi-value">{allControls.filter(c => c.riNiv === 'Alto').length}</div></div>
        </div>

        <div className="charts-grid">
          <div className="chart-card" style={{ gridColumn: 'span 2' }}>
            <h3>Avance por proyecto (%)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={projectProgress} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip formatter={v => v + '%'} />
                <Bar dataKey="avance" name="Avance" fill="var(--orange)" radius={[4, 4, 0, 0]}>
                  {projectProgress.map((d, i) => (
                    <Cell key={i} fill={d.avance === 100 ? '#22c55e' : 'var(--orange)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Distribución de Riesgo Inherente</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={riskDist} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {riskDist.map((d, i) => <Cell key={i} fill={RISK_COLORS[d.name] || COLORS_PIE[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Estado de evidencias</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={evStatus} cx="50%" cy="50%" innerRadius={40} outerRadius={75} dataKey="value">
                  {evStatus.map((_, i) => <Cell key={i} fill={COLORS_PIE[i]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card" style={{ gridColumn: 'span 2' }}>
            <h3>Comparativo Riesgo Inherente vs Residual</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={rirrData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="nivel" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="RI" name="Riesgo Inherente" fill="var(--orange)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="RR" name="Riesgo Residual" fill="var(--info)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabla de controles sin documentar */}
        {allControls.filter(c => !c.compliance?.trim()).length > 0 && (
          <div className="card" style={{ marginTop: 0 }}>
            <div className="card-header">
              <span className="card-title">Controles pendientes de documentar</span>
              <span className="badge badge-red">{allControls.filter(c => !c.compliance?.trim()).length}</span>
            </div>
            <div className="table-wrap" style={{ borderRadius: 0, border: 'none' }}>
              <table>
                <thead><tr><th>Proyecto</th><th>Código</th><th>Causa base</th><th>RI</th></tr></thead>
                <tbody>
                  {allControls.filter(c => !c.compliance?.trim()).slice(0, 15).map(c => (
                    <tr key={c.id}>
                      <td style={{ fontSize: '.8rem' }}>{c.projectName}</td>
                      <td><span className="chip" style={{ fontFamily: 'var(--mono)', color: 'var(--orange)' }}>{c.code}</span></td>
                      <td style={{ fontSize: '.8rem' }}>{c.causaBase}</td>
                      <td><span className={`badge ${c.riNiv === 'Alto' ? 'badge-red' : c.riNiv === 'Medio' ? 'badge-yellow' : 'badge-green'}`}>{c.riNiv}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
