"use client";
import React, { createContext, useState, useEffect, ReactNode } from "react";
import { login as apiLogin, refresh as apiRefresh, getUser, logout as apiLogout } from "../api/auth";
import { useRouter } from "next/navigation";

// Agregar la propiedad avatar al tipo User
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string; // Nueva propiedad para la URL del avatar
  role: string; // Rol del usuario (ADMIN, OPERADOR, etc)
  roles?: number[]; // Array de IDs de roles
}

// Mapeo de IDs de roles a nombres
const ROLE_MAP: Record<number, string> = {
  1: "ADMIN",
  2: "OPERADOR",
  3: "CLIENTE",
  4: "SOPORTE"
};

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }> ;
  logout: () => void;
  loading: boolean;
  reloadUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const reloadUser = async () => {
    setLoading(true);
    try {
      const userRes = await getUser();
      const rawUser = userRes.data;
      // Si el backend retorna roles como array de números, mapea a string
      let role = rawUser.role;
      if (!role && Array.isArray(rawUser.roles) && rawUser.roles.length > 0) {
        // Toma el primer rol como principal
        role = ROLE_MAP[rawUser.roles[0]] || "CLIENTE";
      }
      setUser({ ...rawUser, role, roles: rawUser.roles });
    } catch {
      handleLogout();
    }
    setLoading(false);
  };

  useEffect(() => {
    const access = typeof window !== "undefined" ? localStorage.getItem("access") : null;
    if (access) {
      reloadUser();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      const res = await apiLogin(email, password);
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      await reloadUser();
      return { success: true };
    } catch (error: unknown) {
      // Limpiar tokens en caso de error de login
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      setUser(null);
      
      // Capturar diferentes tipos de errores del backend
      let message = "Credenciales inválidas";
      
      if (typeof error === "object" && error !== null) {
        const err = error as { response?: { status?: number; data?: { message?: string; detail?: string } }, message?: string };
        if (err.response?.status === 401) {
          message = "Email o contraseña incorrectos";
        } else if (err.response?.status === 403) {
          message = "Tu cuenta está bloqueada o inactiva";
        } else if (err.response?.status === 404) {
          message = "Usuario no encontrado";
        } else if ((err.response?.status ?? 0) >= 500) {
          message = "Error del servidor. Intenta más tarde";
        } else if (err.response?.data?.message) {
          message = err.response.data.message;
        } else if (err.response?.data?.detail) {
          message = err.response.data.detail;
        } else if (err.message) {
          message = err.message;
        }
      }
      
      return { success: false, message };
    }
  };

  const handleLogout = () => {
    apiLogout();
    setUser(null);
    router.push("/"); // Redirigir al inicio después del logout
  };

  // Refrescar token automáticamente
  useEffect(() => {
    const interval = setInterval(async () => {
      const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refresh") : null;
      if (refreshToken) {
        try {
          const res = await apiRefresh(refreshToken);
          localStorage.setItem("access", res.data.access);
        } catch {
          handleLogout();
        }
      }
    }, 1000 * 60 * 10); // cada 10 minutos
    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login: handleLogin, logout: handleLogout, loading, reloadUser }}>
      {children}
    </AuthContext.Provider>
  );
};
