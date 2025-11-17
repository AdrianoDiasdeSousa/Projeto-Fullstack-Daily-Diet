// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

type User = { id: string; name: string; email: string } | null;

const AuthCtx = createContext<{
  user: User;
  loading: boolean;
  ready: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}>({} as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  // Checa sessão ao iniciar o app
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/auth/me");
        setUser(data); // <<< IMPORTANTE
      } catch {
        setUser(null);
      } finally {
        setReady(true); // <<< IMPORTANTE
      }
    })();
  }, []);

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setUser(data); // <<< IMPORTANTE
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function register(name: string, email: string, password: string) {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", {
        name,
        email,
        password,
      });
      setUser(data);
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await api.post("/auth/logout");
    setUser(null);
  }

  return (
    <AuthCtx.Provider value={{ user, loading, ready, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
