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
import api from "../api/axios";

export const login = async (email: string, password: string) => {
  return api.post("/auth/login/", { email, password });
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
}) => {
  return api.post("/auth/register/", data);
};


export const refresh = async (refresh: string) => {
  return api.post("/auth/refresh/", { refresh });
};

export const getUser = async () => {
  return api.get("/usuarios/me/");
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

export const listUsers = async () => {
  return api.get("/usuarios/");
};

export const assignRole = async (id: string, rol: string) => {
  return api.post(`/usuarios/${id}/asignar-rol/`, { rol });
};

export const updateProfile = async (data: any) => {
  return api.put("/usuarios/me/", data);
};

export const requestPasswordRecovery = async (email: string) => {
  return api.post("/auth/solicitar-recuperacion/", { email });
};

export const resetPassword = async (token: string, password: string, password_confirm: string) => {
  return api.post("/auth/resetear-password/", { token, password, password_confirm });
};

export const logout = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
};
