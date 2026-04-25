import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('l15_token');
    if (token) {
      auth.me()
        .then((data) => setUser(data))
        .catch(() => { localStorage.removeItem('l15_token'); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await auth.login(email, password);
    localStorage.setItem('l15_token', data.token);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await auth.logout().catch(() => {});
    localStorage.removeItem('l15_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
