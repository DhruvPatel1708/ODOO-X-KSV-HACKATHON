import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { mockUser } from '../data/mockData';

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
      const res = await api.post('/api/auth/login', { email, password });
      const { token, user: userData } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('vb_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (err) {
      // Mock fallback — keeps frontend usable without backend
      if (email === 'admin@vendorbridge.com' && password === 'admin123') {
        const mockToken = 'mock-jwt-token-' + Date.now();
        localStorage.setItem('token', mockToken);
        localStorage.setItem('vb_user', JSON.stringify(mockUser));
        setUser(mockUser);
        return { success: true };
      }
      return { success: false, error: 'Invalid email or password' };
    }
  };

  const signup = async (name, email, password, role) => {
    try {
      const res = await api.post('/api/auth/signup', { name, email, password, role });
      const { token, user: userData } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('vb_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch {
      // Mock fallback
      const mockNewUser = { id: Date.now(), name, email, role };
      const mockToken = 'mock-jwt-token-' + Date.now();
      localStorage.setItem('token', mockToken);
      localStorage.setItem('vb_user', JSON.stringify(mockNewUser));
      setUser(mockNewUser);
      return { success: true };
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
