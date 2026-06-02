import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

const STORAGE_KEY = "ecotrack_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY);

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = (userData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("ecotrack_pending_login_verification");
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth doit être utilisé dans AuthProvider");
  }

  return context;
}