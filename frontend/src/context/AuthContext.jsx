/* eslint-disable react-refresh/only-export-components, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('vb_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      try {
        const stored = localStorage.getItem('vb_user');
        if (stored) setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('vb_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { token, user: userData } = await authService.login(email, password);
      localStorage.setItem('token', token);
      localStorage.setItem('vb_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (err) {
      // Mock fallback — keeps frontend usable without backend
      return { success: false, error: err?.response?.data?.detail || err?.message || 'Invalid email or password' };
    }
  };

  const signup = async (name, email, password, role) => {
    try {
      const { token, user: userData } = await authService.signup(name, email, password, role);
      localStorage.setItem('token', token);
      localStorage.setItem('vb_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (err) {
      return { success: false, error: err?.response?.data?.detail || err?.message || 'Signup failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('vb_user');
    setUser(null);
    window.location.href = '/login';
  };

  const isAuthenticated = !!user && !!localStorage.getItem('token');

  const hasRole = (...roles) => {
    return user && roles.includes(user.role);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function RoleGuard({ roles, children }) {
  const { hasRole } = useAuth();
  if (!hasRole(...roles)) return null;
  return children;
}
