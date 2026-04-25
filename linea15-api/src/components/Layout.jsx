import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 99 }} onClick={() => setSidebarOpen(false)} />
      )}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
