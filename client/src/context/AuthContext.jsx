import { createContext, useContext, useState, useCallback } from "react";
import * as authAPI from "../api/auth";

const AuthContext = createContext(null);

const TOKEN_KEY = "rrs_token";
const USER_KEY = "rrs_user";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);

  const _persist = (data) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const login = useCallback(async (credentials) => {
    const { data } = await authAPI.login(credentials);
    return _persist(data);
  }, []);

  const register = useCallback(async (userData) => {
    const { data } = await authAPI.register(userData);
    return _persist(data);
  }, []);

  const registerAdmin = useCallback(async (userData) => {
    const { data } = await authAPI.registerAdmin(userData);
    return _persist(data);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch {
      
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = Boolean(token && user);
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, registerAdmin, logout, isAuthenticated, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
