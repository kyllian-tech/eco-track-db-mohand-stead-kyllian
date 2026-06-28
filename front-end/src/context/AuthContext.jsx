import { createContext, useContext, useEffect, useState } from 'react';
import { loginApi } from '../api/auth';
import { setTokens, clearTokens } from '../api/client';

const AuthContext = createContext(null);

const USER_KEY = 'ecotrack_user';

// Mapping rôles backend → rôles front-end
const ROLE_MAP = {
  gestionnaire: 'manager',
  citoyen: 'citizen',
  agent: 'agent',
  admin: 'admin',
  analyste: 'analyst',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  // Connexion réelle via le backend — stocke les JWT et l'utilisateur
  const login = async (email, password) => {
    const data = await loginApi(email, password);
    setTokens(data.access_token, data.refresh_token);
    const userData = {
      ...data.user,
      role: ROLE_MAP[data.user.role] ?? data.user.role,
    };
    setUser(userData);
    return userData;
  };

  // Mode démo local (bypass backend) — pour les démonstrations sans backend
  const loginDemo = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    clearTokens();
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('ecotrack_pending_login_verification');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), login, loginDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return context;
}
