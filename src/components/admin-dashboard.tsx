import React from "react";
// ... (puedes pegar aquí el HTML/JSX que enviaste antes, adaptado a TSX si es necesario)


import { Users, Edit, Trash2, UserPlus, Eye, EyeOff, Shield, MapPin, Calendar, Star, LogOut } from 'lucide-react';
import { useState } from 'react';
import { ChartAreaInteractive } from "./chart-area-interactive";


import { useEffect } from 'react';
import { listUsers, assignRole, editUser as editUserApi, disableUser, reactivateUser } from "@/api/auth";
import { useToast } from "@/hooks/use-toast";
import useAuth from "@/hooks/useAuth";

// Mapeo de IDs de roles a nombres
const ROLE_MAP: Record<number, string> = {
  1: "ADMIN",
  2: "OPERADOR", 
  3: "CLIENTE",
  4: "USUARIO",
  5: "SOPORTE"
};

interface User {
  id: string;
  name: string;
  nombres?: string;
  apellidos?: string;
  email: string;
  role?: string; // principal (opcional)
  roles?: number[]; // array de ids de roles
  estado: string;
  location?: string;
  registrationDate?: string;
  lastLogin?: string;
  totalPurchases?: number;
  rating?: number;
}

const roles = ["ADMIN", "OPERADOR", "CLIENTE", "SOPORTE"];


const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { logout } = useAuth();
  const [filterRole, setFilterRole] = useState("todos");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("usuarios"); // Por defecto mostrar gestión de usuarios
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  // Estado para modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    nombres: "",
    apellidos: "",
    telefono: "",
    fecha_nacimiento: "",
    genero: "",
    documento_identidad: "",
    pais: "",
    email: ""
  });

  useEffect(() => {
    setLoading(true);
    listUsers()
      .then(res => setUsers(res.data))
      .catch(() => setError("No se pudieron cargar los usuarios"))
      .finally(() => setLoading(false));
  }, []);

  const filteredUsers = users.filter(user => {
    const nombres = user.nombres || "";
    const apellidos = user.apellidos || "";
    const nombreCompleto = `${nombres} ${apellidos}`.trim();
        return ( 
          (nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase())) && 
          (filterRole === "todos" || user.roles?.includes(Number(filterRole))) && 
          (filterStatus === "todos" || (user.estado?.toLowerCase() === filterStatus)) 
        ); 
  });

  // Deshabilitar usuario
  const handleDisableUser = async (userId: string) => {
    try {
      await disableUser(userId);
      const res = await listUsers();
      setUsers(res.data);
      toast({
        title: "Usuario deshabilitado",
        description: "El usuario ha sido deshabilitado correctamente.",
        duration: 3500,
      });
    } catch {
      toast({
        title: "Error al deshabilitar usuario",
        description: "No se pudo deshabilitar el usuario. Intenta nuevamente.",
        variant: "destructive",
        duration: 3500,
      });
    }
  };

  // Reactivar usuario
  const handleReactivateUser = async (userId: string) => {
    try {
      await reactivateUser(userId);
      const res = await listUsers();
      setUsers(res.data);
      toast({
        title: "Usuario reactivado",
        description: "El usuario ha sido reactivado correctamente.",
        duration: 3500,
      });
    } catch {
      toast({
        title: "Error al reactivar usuario",
        description: "No se pudo reactivar el usuario. Intenta nuevamente.",
        variant: "destructive",
        duration: 3500,
      });
    }
  };

  // Asignar rol a usuario
  const handleAssignRole = async (roleId: number) => {
    if (!selectedUser) return;
    try {
      // Convertir el ID del rol a nombre del rol
      const roleName = ROLE_MAP[roleId];
      if (!roleName) {
        throw new Error("Rol no válido");
      }
      await assignRole(selectedUser.id, roleName);
      setSelectedUser(null);
      setShowRoleModal(false);
      // Actualizar lista de usuarios
      const res = await listUsers();
      setUsers(res.data);
      toast({
        title: "Rol asignado",
        description: `El rol ${roleName} ha sido asignado a ${selectedUser.nombres || selectedUser.name || 'el usuario'}.`,
        duration: 3500,
      });
    } catch {
      setError("No se pudo asignar el rol");
      toast({
        title: "❌ Error al asignar rol",
        description: "Ocurrió un problema al asignar el rol. Intenta nuevamente.",
        variant: "destructive",
        duration: 3500,
      });
    }
  };

  // Abrir modal de asignación de rol
  const handleOpenRoleModal = (user: User) => {
    setSelectedUser(user);
    setShowRoleModal(true);
  };

  // Cerrar modal de asignación de rol
  const handleCloseRoleModal = () => {
    setSelectedUser(null);
    setShowRoleModal(false);
  };

  // Abrir modal de edición y setear datos
  const handleOpenEditModal = (user: any) => {
    setEditUser(user);
    setEditForm({
      nombres: user.nombres || user.name || "",
      apellidos: user.apellidos || "",
      telefono: user.telefono || "",
      fecha_nacimiento: user.fecha_nacimiento ? user.fecha_nacimiento.substring(0, 10) : "",
      genero: user.genero || "",
      documento_identidad: user.documento_identidad || "",
      pais: user.pais || "",
      email: user.email || ""
    });
    setShowEditModal(true);
  };
  // Cerrar modal de edición
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditUser(null);
    setEditForm({
      nombres: "",
      apellidos: "",
      telefono: "",
      fecha_nacimiento: "",
      genero: "",
      documento_identidad: "",
      pais: "",
      email: ""
    });
  };
  // Manejar cambios en el formulario de edición
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.target.name === "email") return; // No permitir editar email
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };
  // Guardar cambios de edición
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    try {
      const response = await editUserApi(editUser.id, {
        nombres: editForm.nombres,
        apellidos: editForm.apellidos,
        telefono: editForm.telefono,
        fecha_nacimiento: editForm.fecha_nacimiento || null,
        genero: editForm.genero,
        documento_identidad: editForm.documento_identidad || null,
        pais: editForm.pais,
        email: editForm.email,
      });
      // Solo mostrar error si el status es >= 400
      if (response && response.status && response.status >= 400) {
        setError("Error al editar usuario");
        return;
      }
      setShowEditModal(false);
      setEditUser(null);
      setEditForm({
        nombres: "",
        apellidos: "",
        telefono: "",
        fecha_nacimiento: "",
        genero: "",
        documento_identidad: "",
        pais: "",
        email: ""
      });
      // Refrescar usuarios
      setLoading(true);
      const res = await listUsers();
      setUsers(res.data);
      setLoading(false);
      setError(null);
      toast({
        title: "✅ ¡Usuario modificado con éxito!",
        description: "Los datos del usuario han sido actualizados correctamente.",
        duration: 3500,
      });
    } catch (err) {
      toast({
        title: "❌ Error al modificar usuario",
        description: "Ocurrió un problema al guardar los cambios. Intenta nuevamente.",
        variant: "destructive",
        duration: 3500,
      });
      setError("Error al editar usuario");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Panel Administrativo - Turismo Bolivia
          </h1>
        </div>
        <p className="text-gray-600">
          Gestiona usuarios, roles y permisos de tu plataforma turística
        </p>
      </div>

      {/* Tabs para alternar vistas */}
      <div className="mb-6 flex gap-4">
        <button
          className={`px-4 py-2 rounded-lg font-semibold ${activeTab === "panel" ? "bg-blue-600 text-white" : "bg-white text-blue-600 border border-blue-600"}`}
          onClick={() => setActiveTab("panel")}
        >
          Panel General
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-semibold ${activeTab === "usuarios" ? "bg-blue-600 text-white" : "bg-white text-blue-600 border border-blue-600"}`}
          onClick={() => setActiveTab("usuarios")}
        >
          Gestión de usuario
        </button>
      </div>

      {/* Vista Panel General */}
      {activeTab === "panel" && (
        <>
          {/* ...stats cards y gráfico... */}
          {/* Estadísticas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Usuarios</p>
                  <p className="text-3xl font-bold">{users.length}</p>
                </div>
                <Users className="w-10 h-10 text-blue-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Usuarios Activos</p>
                  <p className="text-3xl font-bold">{users.filter(u => (u.estado || '').toLowerCase() === 'activo').length}</p>
                </div>
                <Shield className="w-10 h-10 text-green-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Operadores</p>
                  <p className="text-3xl font-bold">{users.filter(u => u.roles?.includes(2)).length}</p>
                </div>
                <UserPlus className="w-10 h-10 text-purple-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Clientes</p>
                  <p className="text-3xl font-bold">{users.filter(u => u.roles?.includes(3)).length}</p>
                </div>
                <Star className="w-10 h-10 text-yellow-200" />
              </div>
            </div>
          </div>

          {/* Estadísticas adicionales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Administradores</p>
                  <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.roles?.includes(1)).length}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Soporte</p>
                  <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.roles?.includes(5)).length}</p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-full">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gray-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Usuarios Inactivos</p>
                  <p className="text-2xl font-bold text-gray-900">{users.filter(u => (u.estado || '').toLowerCase() !== 'activo').length}</p>
                </div>
                <div className="bg-gray-100 p-3 rounded-full">
                  <EyeOff className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Gráfico de actividad */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Actividad de Usuarios</h3>
              <div className="text-sm text-gray-500">Últimos 3 meses</div>
            </div>
            <ChartAreaInteractive />
          </div>

          {/* Actividad reciente */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Distribución de Roles</h4>
                <div className="space-y-3">
                  {Object.entries(ROLE_MAP).map(([id, name]) => {
                    const count = users.filter(u => u.roles?.includes(Number(id))).length;
                    const percentage = users.length > 0 ? (count / users.length * 100).toFixed(1) : 0;
                    return (
                      <div key={id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${
                            name === 'ADMIN' ? 'bg-red-500' :
                            name === 'OPERADOR' ? 'bg-purple-500' :
                            name === 'CLIENTE' ? 'bg-yellow-500' :
                            name === 'SOPORTE' ? 'bg-indigo-500' : 'bg-gray-500'
                          }`}></div>
                          <span className="text-sm text-gray-700">{name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-gray-900">{count}</span>
                          <span className="text-xs text-gray-500 ml-1">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Estado del Sistema</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">Sistema Operativo</span>
                    </div>
                    <span className="text-sm font-medium text-green-700">En línea</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">Base de Datos</span>
                    </div>
                    <span className="text-sm font-medium text-blue-700">Conectada</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">Última actualización</span>
                    </div>
                    <span className="text-sm font-medium text-yellow-700">Hace 2 min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Vista Gestión de usuario */}
      {activeTab === "usuarios" && (
        <>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={filterRole}
                  onChange={e => setFilterRole(e.target.value)}
                >
                  <option value="todos">Todos los roles</option>
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activo">Activos</option>
                  <option value="inactivo">Inactivos</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-x-auto max-h-[60vh] md:max-h-[70vh]">
            <div className="overflow-x-auto overflow-y-auto max-h-[60vh] md:max-h-[70vh] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <table className="min-w-[600px] md:min-w-full divide-y divide-gray-200 text-xs md:text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 md:px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[120px]">Usuario</th>
                    <th className="px-2 md:px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[90px]">Nombre</th>
                    <th className="px-2 md:px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[70px]">Rol</th>
                    <th className="px-2 md:px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[70px]">Estado</th>
                    <th className="px-2 md:px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[90px]">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-1 md:px-4 py-1 md:py-2 whitespace-normal break-all text-[11px] md:text-sm">
                      <div className="text-gray-500 break-all whitespace-normal leading-tight">{user.email}</div>
                    </td>
                    <td className="px-1 md:px-4 py-1 md:py-2 whitespace-normal break-words text-[11px] md:text-sm">
                      <div className="font-medium text-gray-900 break-words whitespace-normal leading-tight">{`${user.nombres || ''} ${user.apellidos || ''}`.trim()}</div>
                    </td>
                    <td className="px-1 md:px-4 py-1 md:py-2 whitespace-normal text-[11px] md:text-sm">
                      <div className="flex flex-wrap gap-1">
                        {(user.roles || []).map((roleId) => (
                          <span
                            key={roleId}
                            className="px-2 py-0.5 bg-gray-200 rounded text-[10px] md:text-xs font-semibold break-words whitespace-normal cursor-help leading-tight"
                            title={ROLE_MAP[roleId] || String(roleId)}
                          >
                            {ROLE_MAP[roleId] || roleId}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-2 md:px-4 py-2 whitespace-normal">
                      {(() => {
                        const estado = (user.estado || "").toLowerCase();
                        let color = "bg-gray-100 text-gray-800";
                        if (estado === "activo") color = "bg-green-100 text-green-800";
                        else if (estado === "inactivo") color = "bg-yellow-100 text-yellow-800";
                        else if (estado === "bloqueado") color = "bg-red-100 text-red-800";
                        return (
                          <span className={`inline-flex px-2 py-1 text-[10px] md:text-xs font-semibold rounded-full ${color}`}>
                            {estado ? estado.charAt(0).toUpperCase() + estado.slice(1) : ""}
                            </span>
                          );
            })()}
          </td>
          <td className="px-2 md:px-4 py-2 whitespace-nowrap text-xs md:text-sm font-medium">
                      <div className="flex gap-2 items-center flex-wrap justify-start">
                        <button title="Editar usuario" className="text-blue-600 hover:text-blue-900" onClick={() => handleOpenEditModal(user)}>
                          <Edit className="w-4 h-4" />
                          </button>
          {/* Modal para editar usuario */}
          {showEditModal && editUser && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
              <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-blue-100">
                <h2 className="text-2xl font-extrabold text-blue-700 mb-6 text-center tracking-tight">Editar usuario</h2>
                <form onSubmit={handleEditSubmit} className="space-y-5 flex flex-col">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nombres</label>
                    <input
                      type="text"
                      name="nombres"
                      value={editForm.nombres}
                      onChange={handleEditFormChange}
                      placeholder="Nombres"
                      className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Apellidos</label>
                    <input
                      type="text"
                      name="apellidos"
                      value={editForm.apellidos}
                      onChange={handleEditFormChange}
                      placeholder="Apellidos"
                      className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono</label>
                    <input
                      type="text"
                      name="telefono"
                      value={editForm.telefono}
                      onChange={handleEditFormChange}
                      placeholder="Teléfono"
                      className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de nacimiento</label>
                    <input
                      type="date"
                      name="fecha_nacimiento"
                      value={editForm.fecha_nacimiento}
                      onChange={handleEditFormChange}
                      className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Género</label>
                    <select
                      name="genero"
                      value={editForm.genero}
                      onChange={handleEditFormChange}
                      className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                    >
                      <option value="">Selecciona género</option>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                      <option value="O">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Documento de identidad</label>
                    <input
                      type="text"
                      name="documento_identidad"
                      value={editForm.documento_identidad}
                      onChange={handleEditFormChange}
                      placeholder="Documento de identidad"
                      className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">País</label>
                    <input
                      type="text"
                      name="pais"
                      value={editForm.pais}
                      onChange={handleEditFormChange}
                      placeholder="País"
                      className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={handleCloseEditModal}
                      className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg font-bold shadow hover:from-blue-600 hover:to-blue-800 transition"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
                        {user.estado === "ACTIVO" ? (
                          <button title="Deshabilitar usuario" className="text-red-600 hover:text-red-900" onClick={() => handleDisableUser(user.id)}>
                            <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <button title="Reactivar usuario" className="text-green-600 hover:text-green-900" onClick={() => handleReactivateUser(user.id)}>
                              <UserPlus className="w-4 h-4" />
                            </button>
                          )}
                          <button title="Asignar rol" className="text-green-600 hover:text-green-900" onClick={() => handleOpenRoleModal(user)}>
                            <Shield className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                ))}
              </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron usuarios</h3>
                  <p className="mt-1 text-sm text-gray-500">Intenta cambiar los filtros de búsqueda</p>
                </div>
              )}
            </div>
          </div>
          {error && <div className="text-red-600 mt-4">{error}</div>}
          {loading && <div className="text-gray-600 mt-4">Cargando usuarios...</div>}

          {/* Modal para asignar rol */}
          {showRoleModal && selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-xs mx-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Asignar rol a {selectedUser.name}</h3>
                <div className="flex flex-col gap-2 mb-4">
                  {Object.entries(ROLE_MAP).map(([id, name]) => (
                    <button
                      key={id}
                      className="px-3 py-2 rounded-lg border border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-900 font-bold shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                      onClick={() => handleAssignRole(Number(id))}
                    >
                      <span className="inline-block align-middle mr-2">
                        <Shield className="w-4 h-4 inline text-blue-500" />
                      </span>
                      {name}
                    </button>
                  ))}
                </div>
                <button
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                  onClick={handleCloseRoleModal}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
