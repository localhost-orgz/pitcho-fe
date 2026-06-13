"use client";

import api from "@/lib/api";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const existingToken = localStorage.getItem("auth-token");
      const savedUser = localStorage.getItem("auth-user");

      

      if (!existingToken) {
        setIsLoading(false);
        return;
      }

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }

      try {
        const res = await api.get("/auth/me");
        localStorage.setItem("auth-user", JSON.stringify(res.data));
        setUser(res.data.data);
      } catch (error) {
        console.error("Gagal sinkronisasi sesi:", error);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = useCallback((data, token) => {
    localStorage.setItem("auth-token", token);
    localStorage.setItem("auth-user", JSON.stringify(data));
    document.cookie = `auth-token-fallback=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    setUser(data);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("auth-token");
    localStorage.removeItem("auth-user");
    document.cookie =
      "auth-token-fallback=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
    }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
