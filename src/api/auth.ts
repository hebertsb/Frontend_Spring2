import api, { setAuthToken } from "./axios";

// Reactivar usuario (eliminación lógica inversa)
export const reactivateUser = async (id: string) => {
  return api.post(`/usuarios/${id}/reactivar/`);
};
// Deshabilitar usuario (eliminación lógica)
export const disableUser = async (id: string) => {
  return api.post(`/usuarios/${id}/inhabilitar/`);
};
// Editar datos de usuario por ID (admin)
export interface EditUserData {
  nombres: string;
  apellidos: string;
  telefono?: string;
  fecha_nacimiento?: string | null;
  genero?: string;
  documento_identidad?: string | null;
  pais?: string;
  email: string;
}
export const editUser = async (id: string, data: EditUserData) => {
  return api.put(`/usuarios/${id}/editar-datos/`, data);
};
export const login = async (email: string, password: string) => {
  try {
    const response = await api.post("/login/", { email, password });
    const token = response.data?.token || null;
    const user = response.data?.user || null;
    if (token) setAuthToken(token);
    if (typeof window !== "undefined" && user) localStorage.setItem("user", JSON.stringify(user));
    return response.data;
  } catch (error: any) {
    // Re-throw normalized error for caller
    throw error;
  }
};

export const register = async (data: {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  password_confirm: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: string;
  documento_identidad?: string;
  pais?: string;
  rol: number | string; // backend expects an integer id; form may send string
  rubro?: string;
}) => {
  // Ensure required fields for this backend (nombre, rubro, rol) are present at call site
  const res = await api.post("/register/", data);
  const token = res.data?.token || null;
  const user = res.data?.user || null;
  if (token) setAuthToken(token);
  if (typeof window !== "undefined" && user) localStorage.setItem("user", JSON.stringify(user));
  return res.data;
};


export const refresh = async (refresh: string) => {
  return api.post("/auth/refresh/", { refresh });
};

// Try multiple possible endpoints for obtaining the current authenticated user.
export const getUser = async () => {
  // Allow overriding the user endpoint via env var to avoid guessing
  const override = process.env.NEXT_PUBLIC_USER_ENDPOINT;
  if (override) {
    return api.get(override);
  }

  const candidates = ["usuarios/me/", "users/me/", "auth/user/"];
  let lastError: any = null;

  // Try common 'me' endpoints first
  for (const ep of candidates) {
    try {
      const res = await api.get(ep);
      return res;
    } catch (err: any) {
      lastError = err;
    }
  }

  // If we have a cached user with an id, try the per-id endpoint as a fallback
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id) {
          try {
            return await api.get(`/usuarios/${parsed.id}/`);
          } catch (err: any) {
            lastError = err;
          }
        }
      }
    } catch {
      // ignore parse errors
    }
  }

  // If the last error was a 403, return the cached user so the client can continue
  // using the stored session (some admin endpoints may restrict /usuarios/me/).
  try {
    if (lastError?.response?.status === 403 && typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        return { data: parsed } as any;
      }
    }
  } catch {
    // ignore parse errors
  }

  throw lastError || new Error("No user endpoint matched");
};

// Editar datos del usuario autenticado
export interface UpdateUserData {
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: string;
  documento_identidad?: string;
  pais?: string;
  email?: string;
}

export const updateUserProfile = async (data: UpdateUserData) => {
  return api.patch("/usuarios/me/", data);
};

// Solicitar código de seguridad para cambio de contraseña
export const requestPasswordResetCode = async (email: string) => {
  return api.post("/auth/solicitar-recuperacion-password/", { email });
};

// Backwards-compatible Spanish-named alias
export const solicitarRecuperacionPassword = async (email: string) => {
  return requestPasswordResetCode(email);
};

// Cambiar contraseña con código de seguridad
export interface ChangePasswordData {
  token: string;
  password_actual: string;
  password_nueva: string;	
  password_nueva_confirm: string;
}

export const changePassword = async (data: ChangePasswordData) => {
  return api.post("/auth/reset-password/", data);
};

// Backwards-compatible wrapper used by some pages/components
export const restablecerPassword = async (token: string, password: string, email: string) => {
  return api.post("/auth/reset-password/", { email, token, password });
};

export const listUsers = async () => {
  return api.get("/usuarios/");
};

export const assignRole = async (id: string, rol: string) => {
  return api.post(`/usuarios/${id}/asignar-rol/`, { rol });
};

export const updateProfile = async (data: UpdateUserData) => {
  return api.put("/usuarios/me/", data);
};

export const requestPasswordRecovery = async (email: string) => {
  return api.post("/auth/solicitar-recuperacion/", { email });
};

export const resetPassword = async (token: string, password: string, password_confirm: string) => {
  return api.post("/auth/resetear-password/", { token, password, password_confirm });
};

export const logout = async () => {
  // Try to call the backend logout endpoint so the server can register the
  // "Salida" action in the bitácora. We keep a tolerant fallback strategy:
  //  - If /logout/ exists and responds (204 or 200), we clear client-side token.
  //  - If the endpoint returns 404 (not implemented) we still clear client token.
  //  - If the request fails for other reasons, attempt a fallback that sends
  //    the token in the body. In any case, we avoid leaving the token in
  //    client storage permanently.
  try {
    // axios interceptor will add Authorization header from localStorage if present
    await api.post("/logout/");
  } catch (err: any) {
    const status = err?.response?.status;
    // If endpoint not found (404) or unauthorized, proceed to clear token locally
    if (status === 404 || status === 401 || status === 400) {
      // nothing else to do; server doesn't support logout or token already invalid
    } else {
      // Try fallback: send token explicitly in the body (some backends accept this)
      try {
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("authToken");
          if (token) {
            await api.post("/logout/", { token });
          }
        }
      } catch (e) {
        // swallow fallback errors; we'll still clear client state below
      }
    }
  } finally {
    // Always clear client-side token and cached user after attempting logout.
    setAuthToken(null);
    if (typeof window !== "undefined") localStorage.removeItem("user");
  }
};
