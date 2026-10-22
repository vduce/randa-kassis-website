import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
const api = (process.env.REACT_APP_PROXY_URL || '').replace(/\/$/, '');
const headers = { 'Content-Type': 'application/json', 'X-Requested-With': 'RandaAdmin' };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    // Discard the legacy, browser-created session; only the server cookie grants access.
    localStorage.removeItem('adminSession');
    try {
      const response = await fetch(`${api}/api/admin/session`, { credentials: 'same-origin' });
      const result = await response.json();
      setUser(response.ok ? result.user : null);
    } catch { setUser(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { checkAuth(); }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${api}/api/admin/login`, {
        method: 'POST', headers, credentials: 'same-origin', body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok) return { success: false, error: result.error || 'Login failed' };
      setUser(result.user);
      return { success: true };
    } catch { return { success: false, error: 'Unable to reach the server. Please try again.' }; }
  };

  const logout = async () => {
    try {
      const response = await fetch(`${api}/api/admin/logout`, { method: 'POST', headers });
      if (!response.ok) return;
      setUser(null);
    } catch { /* Keep the current session visible if the server could not log out. */ }
  };

  return <AuthContext.Provider value={{ isAuthenticated: Boolean(user), readOnly: Boolean(user?.readOnly), user, loading, login, logout, checkAuth }}>
    {children}
  </AuthContext.Provider>;
};
