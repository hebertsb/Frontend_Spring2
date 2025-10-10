"use client";
import React, { createContext, useState, useEffect, ReactNode } from "react";
import { login as apiLogin, refresh as apiRefresh, getUser, logout as apiLogout } from "../api/auth";
import { setAuthToken } from "@/api/axios";
import { useRouter } from "next/navigation";

// Interfaz completa del usuario alineada con backend
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string; // Nueva propiedad para la URL del avatar
  role: string; // Rol del usuario (ADMIN, OPERADOR, etc)
  roles?: number[]; // Array de IDs de roles
  // Campos adicionales del perfil del usuario
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: string;
  documento_identidad?: string;
  pais?: string;
}

// Mapeo de IDs de roles a nombres (según contrato del backend)
// Backend informó: 1: Administrador, 2: Cliente, 3: Proveedor, 4: Soporte
// Guardamos los nombres en minúsculas para comparaciones consistentes.
const ROLE_MAP: Record<number, string> = {
  1: "administrador",
  2: "cliente",
  3: "proveedor",
  4: "soporte"
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

  // Normaliza el objeto raw que viene del backend a la forma que usa la app
  const normalizeUser = (rawUser: any): User => {
    if (!rawUser) return null as any;
    // Obtener roles como array de números
    let roles: number[] = [];
    if (Array.isArray(rawUser.roles)) {
      // roles puede ser array de ids o array de objetos {id: number}
      roles = rawUser.roles.map((r: any) => (typeof r === "number" ? r : r?.id)).filter(Boolean);
    } else if (rawUser.rol && typeof rawUser.rol === "object" && typeof rawUser.rol.id === "number") {
      // Caso reportado por backend: rol como objeto { id, nombre }
      roles = [rawUser.rol.id];
    } else if (typeof rawUser.rol === "number") {
      roles = [rawUser.rol];
    } else if (typeof rawUser.perfil_id === "number") {
      roles = [rawUser.perfil_id];
    } else if (rawUser.profile_id && typeof rawUser.profile_id === "number") {
      roles = [rawUser.profile_id];
    }

    // Nombre del usuario
    const name = rawUser.nombre || rawUser.name || rawUser.full_name || rawUser.nombre_completo || rawUser.username || "Usuario";
    const email = rawUser.email || "";
    const avatar = rawUser.avatar || rawUser.avatar_url || rawUser.foto || "";

    // Determinar role string (en minúsculas)
    // Preferir rol.nombre cuando backend devuelve el objeto {id,nombre}
    let roleStr: string = "";
    if (rawUser.rol && typeof rawUser.rol === "object" && rawUser.rol.nombre) {
      roleStr = String(rawUser.rol.nombre).toLowerCase();
    } else if (rawUser.role) {
      roleStr = String(rawUser.role).toLowerCase();
    } else if (roles.length > 0) {
      // Intentar mapear id -> nombre usando ROLE_MAP, o usar el id como fallback
      roleStr = String(ROLE_MAP[roles[0]] || roles[0]).toLowerCase();
    }

    return { id: String(rawUser.id || rawUser.pk || rawUser.user_id || ""), name, email, avatar, role: roleStr, roles } as User;
  };

  const reloadUser = async () => {
    setLoading(true);
    try {
      const userRes = await getUser();
      const rawUser = userRes.data;
      const normalized = normalizeUser(rawUser);
      setUser(normalized);
    } catch (err: any) {
      // Only force logout on 401 (invalid/expired token). If backend
      // returns 403 (forbidden), keep the client token and stored user
      // but stop loading — don't automatically log out.
      const status = err?.response?.status;
      if (status === 401) {
        handleLogout();
        return;
      }
      // for 403 or other errors, just stop loading and keep existing user
    }
    setLoading(false);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      const storedUser = localStorage.getItem("user");
      if (token) {
        setAuthToken(token);
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            setUser(normalizeUser(parsed));
          } catch {
            // ignore
          }
        } else {
          // If no stored user, attempt to refresh authoritative user data
          reloadUser();
        }
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      const res = await apiLogin(email, password);
      // apiLogin returns { token, user }
      const token = res.token || null;
      const userFromRes = res.user || null;
      if (token) setAuthToken(token);
      if (userFromRes && typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(userFromRes));
        try {
          setUser(normalizeUser(userFromRes));
        } catch {
          // ignore
        }
      }
      // Do not force reloadUser immediately; leave it for mount or manual refresh
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
    setAuthToken(null);
    setUser(null);
    router.push("/"); // Redirigir al inicio después del logout
  };

  // TokenAuth does not provide refresh by default. If refresh is implemented, keep logic here.

  return (
    <AuthContext.Provider value={{ user, login: handleLogin, logout: handleLogout, loading, reloadUser }}>
      {children}
    </AuthContext.Provider>
  );
};
