import { createContext, useContext, useEffect, useState } from 'react';
import apiClient, { TOKEN_KEY } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadMe() {
    try {
      const { data } = await apiClient.get('/auth/me');
      setProfile(data.user);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setProfile(null);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    loadMe().finally(() => setLoading(false));
  }, []);

  async function signIn(email, password) {
    const { data } = await apiClient.post('/auth/login', { email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    setProfile(data.user);
    return data.user;
  }

  async function signOut() {
    localStorage.removeItem(TOKEN_KEY);
    setProfile(null);
  }

  // "Olvide mi contraseña": pide un enlace de restablecimiento por correo.
  async function requestPasswordReset(email) {
    await apiClient.post('/auth/forgot-password', { email });
  }

  // Completa el restablecimiento usando el token que llego por correo.
  async function resetPassword(token, password) {
    await apiClient.post('/auth/reset-password', { token, password });
  }

  // Usado en el flujo de "debe cambiar su contraseña" tras el primer login
  // con una contraseña temporal creada por un admin.
  async function changePassword(password) {
    const { data } = await apiClient.post('/auth/change-password', { password });
    setProfile(data.user);
  }

  const value = {
    profile,
    role: profile?.role || null,
    isAuthenticated: !!profile,
    loading,
    signIn,
    signOut,
    requestPasswordReset,
    resetPassword,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}