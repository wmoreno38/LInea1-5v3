import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { auth } from '../api/client.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryMsg, setRecoveryMsg] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecovery = async (e) => {
    e.preventDefault();
    setLoading(true); setRecoveryMsg('');
    try {
      await auth.recovery(recoveryEmail);
      setRecoveryMsg('Enlace de recuperación enviado. Revisa tu correo.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-brand">
        <div className="login-brand-logo">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>
        <h1>Línea 1.5</h1>
        <p>Gestión de Riesgos Tecnológicos · Porvenir</p>
        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 280 }}>
          {['Matrices de control V3', '33 controles SARO/SFC', 'Evidencias con archivos', 'Dashboard y reportes'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,.6)', fontSize: '.82rem' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--orange)', flexShrink: 0 }} />
              {f}
            </div>
          ))}
        </div>
      </div>

      <div className="login-form-wrap">
        <div className="login-form">
          {!recovery ? (
            <>
              <h2>Bienvenida</h2>
              <p className="lead">Ingresa tus credenciales para continuar</p>
              {error && <div className="alert alert-error mb-4">{error}</div>}
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label">Correo electrónico</label>
                  <input className="form-control" type="email" placeholder="usuario@porvenir.com.co" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Contraseña</label>
                  <input className="form-control" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <button className="btn btn-primary w-full" type="submit" disabled={loading} style={{ marginTop: 8, padding: '11px 16px', fontSize: '.9rem' }}>
                  {loading ? 'Ingresando...' : 'Ingresar'}
                </button>
              </form>
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 14, width: '100%', justifyContent: 'center' }} onClick={() => { setRecovery(true); setError(''); }}>
                ¿Olvidaste tu contraseña?
              </button>
            </>
          ) : (
            <>
              <h2>Recuperar acceso</h2>
              <p className="lead">Te enviaremos un enlace a tu correo</p>
              {error && <div className="alert alert-error mb-4">{error}</div>}
              {recoveryMsg && <div className="alert alert-success mb-4">{recoveryMsg}</div>}
              <form onSubmit={handleRecovery}>
                <div className="form-group">
                  <label className="form-label">Correo electrónico</label>
                  <input className="form-control" type="email" placeholder="usuario@porvenir.com.co" value={recoveryEmail} onChange={e => setRecoveryEmail(e.target.value)} required />
                </div>
                <button className="btn btn-primary w-full" type="submit" disabled={loading} style={{ marginTop: 8 }}>
                  {loading ? 'Enviando...' : 'Enviar enlace'}
                </button>
              </form>
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 14, width: '100%', justifyContent: 'center' }} onClick={() => { setRecovery(false); setError(''); setRecoveryMsg(''); }}>
                ← Volver al inicio de sesión
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
