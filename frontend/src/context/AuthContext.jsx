import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('admin_token') || '');
  const [username, setUsername] = useState(() => localStorage.getItem('admin_user') || '');

  const login = useCallback((tokenValue, userNameValue) => {
    setToken(tokenValue); setUsername(userNameValue || 'admin');
    localStorage.setItem('admin_token', tokenValue);
    localStorage.setItem('admin_user', userNameValue || 'admin');
  }, []);

  const logout = useCallback(() => {
    setToken(''); setUsername('');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  }, []);

  useEffect(() => {
    // sync if localStorage changed in another tab
    function syncStorage() {
      const t = localStorage.getItem('admin_token') || '';
      if (t !== token) setToken(t);
    }
    window.addEventListener('storage', syncStorage);
    return () => window.removeEventListener('storage', syncStorage);
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, username, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
