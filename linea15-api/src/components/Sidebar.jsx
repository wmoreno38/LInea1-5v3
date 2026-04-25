import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
  { to: '/projects', label: 'Proyectos', icon: 'M3 7h18M3 12h18M3 17h18' },
  { to: '/reports', label: 'Reportes', icon: 'M18 20V10M12 20V4M6 20v-6' },
  { to: '/archive', label: 'Archivo', icon: 'M21 8v13H3V8M1 3h22v5H1zM10 12h4' },
];

const adminItems = [
  { to: '/logs', label: 'Auditoría', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8M16 17H8M10 9H8' },
  { to: '/users', label: 'Usuarios', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75' },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = (user?.name || user?.username || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <h1>⬡ Línea 1.5</h1>
        <span>Gestión de Riesgos TI</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-label">Menú principal</div>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon d={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </div>

        {isAdmin && (
          <div className="nav-section">
            <div className="nav-label">Administración</div>
            {adminItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <Icon d={item.icon} />
                {item.label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-badge">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.name || user?.username}</div>
            <div className="user-role">{user?.role === 'admin' ? 'Administrador' : 'Líder'}</div>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm btn-logout w-full" onClick={handleLogout}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
