"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api, getToken, setToken, removeToken } from "./api";

interface User {
  id: number;
  email: string;
  full_name?: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  loginDemoUser: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const u = await api.getMe();
      setUser(u);
    } catch {
      removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    setToken(res.access_token);
    setUser(res.user);
  };

  const register = async (email: string, password: string, fullName?: string) => {
    const res = await api.register({ email, password, full_name: fullName });
    setToken(res.access_token);
    setUser(res.user);
  };

  const loginDemoUser = async () => {
    const demoEmail = "demo.student@ctrlfreaks.ai";
    const demoPass = "DemoStudentPass2026!";
    try {
      // Try login first
      const res = await api.login({ email: demoEmail, password: demoPass });
      setToken(res.access_token);
      setUser(res.user);
    } catch {
      // If doesn't exist, register
      const res = await api.register({
        email: demoEmail,
        password: demoPass,
        full_name: "Alex Morgan (Demo Student)",
      });
      setToken(res.access_token);
      setUser(res.user);
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginDemoUser,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
