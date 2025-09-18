# 📋 Documentación Completa: Implementación CRUD Dashboard Admin

## 🔗 **1. FLUJO DE NAVEGACIÓN: SIDEBAR → DASHBOARD**

### **1.1 Sidebar Configuration (app-sidebar.tsx)**
```tsx
"use client"

import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"
import Link from "next/link"

const data = {
  user: {
    name: "Usuario",
    email: "usuario@example.com",
    avatar: "/avatars/user.jpg",
  },
  navMain: [
    { title: "Dashboard", url: "/panel", icon: IconDashboard },
    { title: "Gestión de usuarios", url: "/panel?tab=usuarios", icon: IconUsers },
    { title: "Gestión de reservas", url: "/panel?tab=reservas", icon: IconListDetails }, // ← PUNTO DE ENTRADA
    { title: "Cupones y descuentos", url: "/panel?tab=cupones", icon: IconListDetails },
    { title: "Gestión de informes", url: "/panel?tab=informes", icon: IconChartBar },
    // AGREGAR NUEVOS CASOS DE USO AQUÍ
    // { title: "Gestión de [Entidad]", url: "/panel?tab=[entidad]", icon: IconExample },
  ],
  navSecondary: [
    { title: "Configuración", url: "#", icon: IconSettings },
    { title: "Obtén ayuda", url: "#", icon: IconHelp },
    { title: "Buscar", url: "#", icon: IconSearch },
  ],
  documents: [
    { name: "Biblioteca de Datos", url: "#", icon: IconDatabase },
    { name: "Informes", url: "#", icon: IconReport },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Volver al inicio</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        {/* NavUser component aquí */}
      </SidebarFooter>
    </Sidebar>
  )
}
```

### **1.2 Router Configuration (panel/page.tsx)**
```tsx
"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useSearchParams } from "next/navigation"
import AdminDashboard from "@/components/admin-dashboard"
import AdminReservasDashboard from "@/components/admin-reservas-dashboard-fixed"
// IMPORTAR NUEVOS COMPONENTES AQUÍ
// import AdminPaquetesDashboard from "@/components/admin-paquetes-dashboard"
// import AdminCuponesDashboard from "@/components/admin-cupones-dashboard"
import ProtectedRoute from "@/components/ProtectedRoute"

import data from "./data.json"

export default function Page() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "panel"; // ← CAPTURA EL PARÁMETRO

  return (
    <ProtectedRoute 
      allowedRoles={[1, 4]} // Admin (rol ID 1) y Soporte (rol ID 4)
      requireAuth={true}
      redirectTo="/"
    >
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                {tab === "usuarios" ? (
                  <AdminDashboard />
                ) : tab === "reservas" ? (
                  <AdminReservasDashboard /> // ← RENDERIZA EL COMPONENTE
                ) : /* AGREGAR NUEVOS CASOS DE USO AQUÍ
                tab === "paquetes" ? (
                  <AdminPaquetesDashboard />
                ) : tab === "cupones" ? (
                  <AdminCuponesDashboard />
                ) : */ (
                  <>
                    {/* Panel General por defecto */}
                    <SectionCards />
                    <div className="px-4 lg:px-6">
                      <ChartAreaInteractive />
                    </div>
                    <DataTable data={data} />
                  </>
                )}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
```

## 🔌 **2. CAPA API (api/[entidad].ts)**

### **2.1 Template Base para API Layer**
```typescript
// Ejemplo: api/reservas.ts
import axios from './axios';

// ============================================
// CRUD OPERATIONS BÁSICAS
// ============================================

// Obtener todas las entidades
export const listarReservas = () => axios.get('/reservas/');

// Crear una nueva entidad
export const crearReserva = (data: any) => axios.post('/reservas/', data);

// Editar una entidad existente
export const editarReserva = async (id: string, data: any) => {
  try {
    console.log('🔄 API: Editando reserva con ID:', id);
    console.log('🔄 API: Datos a enviar:', data);
    console.log('🔄 API: URL completa:', `/reservas/${id}/`);
    
    const response = await axios.put(`/reservas/${id}/`, data);
    console.log('✅ API: Respuesta exitosa:', response.data);
    
    return response;
  } catch (error: any) {
    console.error('❌ API: Error al editar reserva:', error);
    console.error('❌ API: Respuesta del servidor:', error.response?.data);
    throw error;
  }
};

// Eliminar una entidad
export const eliminarReserva = (id: string) => axios.delete(`/reservas/${id}/`);

// ============================================
// TEMPLATE PARA NUEVAS ENTIDADES
// ============================================

/*
// Ejemplo para Paquetes: api/paquetes.ts
import axios from './axios';

export const listarPaquetes = () => axios.get('/paquetes/');
export const crearPaquete = (data: any) => axios.post('/paquetes/', data);
export const editarPaquete = async (id: string, data: any) => {
  try {
    console.log('🔄 API: Editando paquete con ID:', id);
    const response = await axios.put(`/paquetes/${id}/`, data);
    console.log('✅ API: Respuesta exitosa:', response.data);
    return response;
  } catch (error: any) {
    console.error('❌ API: Error al editar paquete:', error);
    throw error;
  }
};
export const eliminarPaquete = (id: string) => axios.delete(`/paquetes/${id}/`);
*/
```

### **2.2 Configuración de axios.ts**
```typescript
// api/axios.ts
import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autorización
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;
```

## 🏗️ **3. ARQUITECTURA DEL DASHBOARD COMPONENT**

### **3.1 Template Completo para Dashboard**
```tsx
// components/admin-[entidad]-dashboard.tsx
import React from "react";
import { Calendar, Edit, Trash2, Eye, EyeOff, MapPin, Users, Star, CheckCircle, X, User, Phone, Mail, Clock, DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';
import { listar[Entidad], crear[Entidad], editar[Entidad], eliminar[Entidad] } from "@/api/[entidad]";
import { useToast } from "@/hooks/use-toast";
import useAuth from "@/hooks/useAuth";

// ============================================
// INTERFACES Y TIPOS
// ============================================

// Estados específicos de la entidad (personalizar según backend)
const ESTADO_MAP: Record<string, string> = {
  "activo": "ACTIVO",
  "inactivo": "INACTIVO",
  "pendiente": "PENDIENTE",
  "cancelado": "CANCELADO"
};

interface [Entidad] {
  id: string;
  // CAMPOS ESPECÍFICOS DE LA ENTIDAD - PERSONALIZAR AQUÍ
  nombre?: string;
  descripcion?: string;
  estado: string;
  fechaCreacion?: string;
  precio?: number;
  // ... más campos específicos
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const Admin[Entidad]Dashboard = () => {
  // ============================================
  // ESTADOS PRINCIPALES
  // ============================================
  const [[entidades], set[Entidades]] = useState<[Entidad][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  
  // Estados de filtros y búsqueda
  const [filterEstado, setFilterEstado] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estados de navegación
  const [activeTab, setActiveTab] = useState("panel");
  
  // Estados de modales
  const [selected[Entidad], setSelected[Entidad]] = useState<[Entidad] | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editing[Entidad], setEditing[Entidad]] = useState<[Entidad] | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting[Entidad], setDeleting[Entidad]] = useState<[Entidad] | null>(null);

  // ============================================
  // FUNCIONES UTILITARIAS
  // ============================================

  // Función para recargar datos (reutilizable)
  const recargar[Entidades] = async () => {
    try {
      setLoading(true);
      const res = await listar[Entidades]();
      console.log("🔄 Recargando [entidades]...", res.data);
      
      // Mapear datos del backend al formato del frontend
      const [entidades]Mapeadas = res.data.map((item: any) => mapear[Entidad](item));
      set[Entidades]([entidades]Mapeadas);
      
    } catch (error: any) {
      console.error("❌ Error al cargar [entidades]:", error);
      setError("Error al cargar los datos");
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para mapear datos del backend
  const mapear[Entidad] = (item: any): [Entidad] => {
    return {
      id: item.id?.toString() || '',
      // MAPEAR CAMPOS ESPECÍFICOS AQUÍ
      nombre: item.nombre || '',
      descripcion: item.descripcion || '',
      estado: item.estado?.toLowerCase() || 'activo',
      fechaCreacion: item.fecha_creacion ? new Date(item.fecha_creacion).toLocaleDateString() : '',
      precio: parseFloat(item.precio || '0'),
      // ... más campos
    };
  };

  // ============================================
  // OPERACIONES CRUD
  // ============================================

  // CREATE - Crear nueva entidad
  const handleCrear[Entidad] = async (datos[Entidad]: any) => {
    try {
      setLoading(true);
      
      // Preparar datos para el backend
      const datosParaBackend = {
        // PERSONALIZAR CAMPOS SEGÚN BACKEND
        nombre: datos[Entidad].nombre,
        descripcion: datos[Entidad].descripcion,
        estado: ESTADO_MAP[datos[Entidad].estado] || 'ACTIVO',
        precio: datos[Entidad].precio?.toString(),
        // ... más campos requeridos por el backend
      };

      console.log("📝 Creando [entidad]:", datosParaBackend);
      
      const response = await crear[Entidad](datosParaBackend);
      console.log("✅ [Entidad] creada:", response.data);
      
      await recargar[Entidades](); // Recargar lista
      setShowModal(false);
      
      toast({
        title: "Éxito",
        description: "[Entidad] creada correctamente",
      });
      
    } catch (error: any) {
      console.error("❌ Error al crear [entidad]:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al crear la [entidad]",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // UPDATE - Editar entidad existente
  const guardarCambios = async () => {
    if (!editing[Entidad]) return;

    try {
      setLoading(true);
      
      // Preparar datos para el backend
      const datosParaBackend = {
        // PERSONALIZAR CAMPOS SEGÚN BACKEND
        nombre: editing[Entidad].nombre,
        descripcion: editing[Entidad].descripcion,
        estado: ESTADO_MAP[editing[Entidad].estado],
        precio: editing[Entidad].precio?.toString(),
        // ... más campos requeridos por el backend
      };

      console.log("📝 Editando [entidad]:", editing[Entidad].id, datosParaBackend);
      
      const response = await editar[Entidad](editing[Entidad].id, datosParaBackend);
      console.log("✅ [Entidad] editada:", response.data);
      
      await recargar[Entidades](); // Recargar lista
      setShowEditModal(false);
      setEditing[Entidad](null);
      
      toast({
        title: "Éxito",
        description: "[Entidad] actualizada correctamente",
      });
      
    } catch (error: any) {
      console.error("❌ Error al editar [entidad]:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al actualizar la [entidad]",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // DELETE - Eliminar entidad
  const confirmarEliminacion = async () => {
    if (!deleting[Entidad]) return;

    try {
      setLoading(true);
      
      console.log("🗑️ Eliminando [entidad]:", deleting[Entidad].id);
      
      await eliminar[Entidad](deleting[Entidad].id);
      console.log("✅ [Entidad] eliminada");
      
      await recargar[Entidades](); // Recargar lista
      setShowDeleteModal(false);
      setDeleting[Entidad](null);
      
      toast({
        title: "Éxito",
        description: "[Entidad] eliminada correctamente",
      });
      
    } catch (error: any) {
      console.error("❌ Error al eliminar [entidad]:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al eliminar la [entidad]",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // EFECTOS Y CARGA INICIAL
  // ============================================

  useEffect(() => {
    recargar[Entidades]();
  }, []);

  // ============================================
  // FUNCIONES DE FILTRADO
  // ============================================

  const [entidades]Filtradas = [entidades].filter(item => {
    const matchesEstado = filterEstado === "todos" || item.estado === filterEstado;
    const matchesSearch = item.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesEstado && matchesSearch;
  });

  // ============================================
  // CÁLCULO DE ESTADÍSTICAS
  // ============================================

  const estadisticas = {
    total: [entidades].length,
    activos: [entidades].filter(item => item.estado === 'activo').length,
    inactivos: [entidades].filter(item => item.estado === 'inactivo').length,
    pendientes: [entidades].filter(item => item.estado === 'pendiente').length,
  };

  // ============================================
  // RENDER DEL COMPONENTE
  // ============================================

  if (loading && [entidades].length === 0) {
    return (
      <div className="container mx-auto p-3 sm:p-4 md:p-6">
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando [entidades]...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6">
      {/* ============================================ */}
      {/* HEADER CON TÍTULO E ICONO */}
      {/* ============================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            {/* PERSONALIZAR ICONO AQUÍ */}
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              Gestión de [Entidades]
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Administra y controla todas las [entidades] del sistema
            </p>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* NAVEGACIÓN POR TABS */}
      {/* ============================================ */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-1 mb-6">
        <button
          onClick={() => setActiveTab("panel")}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
            activeTab === "panel"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          📊 Panel General
        </button>
        <button
          onClick={() => setActiveTab("gestion")}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
            activeTab === "gestion"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          📋 Gestión de [entidades]
        </button>
      </div>

      {/* ============================================ */}
      {/* PANEL DE ESTADÍSTICAS */}
      {/* ============================================ */}
      {activeTab === "panel" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total [Entidades]</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{estadisticas.total}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Activos */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Activos</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">{estadisticas.activos}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Inactivos */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inactivos</p>
                  <p className="text-2xl sm:text-3xl font-bold text-red-600">{estadisticas.inactivos}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <X className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>

            {/* Pendientes */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendientes</p>
                  <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{estadisticas.pendientes}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* AGREGAR MÁS ESTADÍSTICAS O GRÁFICOS AQUÍ */}
        </div>
      )}

      {/* ============================================ */}
      {/* TABLA DE GESTIÓN */}
      {/* ============================================ */}
      {activeTab === "gestion" && (
        <div className="space-y-4 sm:space-y-6">
          {/* Controles de filtros y búsqueda */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar [entidades]..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base min-w-0"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <select
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activo">Activos</option>
                  <option value="inactivo">Inactivos</option>
                  <option value="pendiente">Pendientes</option>
                </select>
                <button
                  onClick={() => setShowModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm sm:text-base whitespace-nowrap"
                >
                  + Nueva [Entidad]
                </button>
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {/* PERSONALIZAR COLUMNAS AQUÍ */}
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[entidades]Filtradas.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      {/* PERSONALIZAR CELDAS AQUÍ */}
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.nombre}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">{item.descripcion}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.estado === 'activo' ? 'bg-green-100 text-green-800' :
                          item.estado === 'inactivo' ? 'bg-red-100 text-red-800' :
                          item.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.estado.charAt(0).toUpperCase() + item.estado.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${item.precio?.toFixed(2)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.fechaCreacion}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelected[Entidad](item);
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditing[Entidad](item);
                              setShowEditModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 p-1"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleting[Entidad](item);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {[entidades]Filtradas.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-gray-500">No se encontraron [entidades]</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* MODALES */}
      {/* ============================================ */}

      {/* Modal de Creación/Vista */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {selected[Entidad] ? 'Detalles de [Entidad]' : 'Nueva [Entidad]'}
              </h3>
              
              {/* PERSONALIZAR FORMULARIO AQUÍ */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingrese el nombre"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Ingrese la descripción"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="pendiente">Pendiente</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                {!selected[Entidad] && (
                  <button
                    onClick={() => {/* handleCrear[Entidad] */}}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Crear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición */}
      {showEditModal && editing[Entidad] && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Editar [Entidad]</h3>
              
              {/* PERSONALIZAR FORMULARIO DE EDICIÓN AQUÍ */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={editing[Entidad].nombre || ''}
                    onChange={(e) => setEditing[Entidad]({...editing[Entidad], nombre: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={editing[Entidad].descripcion || ''}
                    onChange={(e) => setEditing[Entidad]({...editing[Entidad], descripcion: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select 
                    value={editing[Entidad].estado}
                    onChange={(e) => setEditing[Entidad]({...editing[Entidad], estado: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="pendiente">Pendiente</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editing[Entidad].precio || ''}
                    onChange={(e) => setEditing[Entidad]({...editing[Entidad], precio: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditing[Entidad](null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarCambios}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Eliminación */}
      {showDeleteModal && deleting[Entidad] && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Confirmar Eliminación</h3>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que deseas eliminar "{deleting[Entidad].nombre}"? 
                Esta acción no se puede deshacer.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleting[Entidad](null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarEliminacion}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin[Entidad]Dashboard;
```

## 📋 **4. CHECKLIST PARA NUEVO CASO DE USO**

### **✅ Pasos a seguir (en orden):**

1. **Definir la entidad y sus campos**
   - [ ] Nombre de la entidad (ej: Paquetes, Cupones, Informes)
   - [ ] Campos específicos que tendrá
   - [ ] Estados posibles de la entidad
   - [ ] Relaciones con otras entidades

2. **Crear API Layer**
   - [ ] Crear archivo `api/[entidad].ts`
   - [ ] Implementar funciones CRUD básicas
   - [ ] Configurar manejo de errores
   - [ ] Probar endpoints en el backend

3. **Agregar al Sidebar**
   - [ ] Importar icono apropiado
   - [ ] Agregar entrada en `data.navMain`
   - [ ] Definir URL con parámetro tab

4. **Configurar Routing**
   - [ ] Importar nuevo componente dashboard
   - [ ] Agregar condición en el router
   - [ ] Verificar roles de acceso

5. **Crear Componente Dashboard**
   - [ ] Copiar template y personalizar
   - [ ] Definir interface de la entidad
   - [ ] Configurar mapeo de estados
   - [ ] Personalizar función de mapeo
   - [ ] Adaptar estadísticas del panel
   - [ ] Personalizar columnas de la tabla
   - [ ] Crear formularios de creación/edición
   - [ ] Configurar validaciones

6. **Personalizar UI**
   - [ ] Cambiar iconos y colores
   - [ ] Adaptar textos y labels
   - [ ] Configurar filtros específicos
   - [ ] Agregar campos de búsqueda específicos

7. **Testing y Refinamiento**
   - [ ] Probar todas las operaciones CRUD
   - [ ] Verificar responsividad
   - [ ] Validar manejo de errores
   - [ ] Optimizar UX/UI

## 🎯 **5. EJEMPLOS ESPECÍFICOS**

### **Ejemplo 1: Gestión de Paquetes Turísticos**

```typescript
// api/paquetes.ts
export const listarPaquetes = () => axios.get('/paquetes/');
export const crearPaquete = (data: any) => axios.post('/paquetes/', data);
export const editarPaquete = (id: string, data: any) => axios.put(`/paquetes/${id}/`, data);
export const eliminarPaquete = (id: string) => axios.delete(`/paquetes/${id}/`);

// Interface Paquete
interface Paquete {
  id: string;
  nombre: string;
  descripcion: string;
  destino: string;
  duracion: number;
  precio: number;
  estado: string; // activo, inactivo, agotado
  fechaCreacion: string;
  incluye: string[];
  imagenes: string[];
}

// Estados específicos
const ESTADO_MAP = {
  "activo": "ACTIVO",
  "inactivo": "INACTIVO", 
  "agotado": "AGOTADO"
};
```

### **Ejemplo 2: Gestión de Cupones**

```typescript
// api/cupones.ts
export const listarCupones = () => axios.get('/cupones/');
export const crearCupon = (data: any) => axios.post('/cupones/', data);
export const editarCupon = (id: string, data: any) => axios.put(`/cupones/${id}/`, data);
export const eliminarCupon = (id: string) => axios.delete(`/cupones/${id}/`);

// Interface Cupon
interface Cupon {
  id: string;
  codigo: string;
  descripcion: string;
  descuento: number;
  tipoDescuento: string; // porcentaje, monto_fijo
  fechaInicio: string;
  fechaVencimiento: string;
  usos: number;
  usosMaximos: number;
  estado: string; // activo, vencido, agotado
}

// Estados específicos
const ESTADO_MAP = {
  "activo": "ACTIVO",
  "vencido": "VENCIDO",
  "agotado": "AGOTADO"
};
```

## 🚀 **6. TIPS Y MEJORES PRÁCTICAS**

### **Performance:**
- Usar `useCallback` y `useMemo` para funciones y cálculos costosos
- Implementar paginación para listas grandes
- Debounce en campos de búsqueda

### **UX/UI:**
- Siempre mostrar loading states
- Usar toasts para feedback inmediato
- Confirmar acciones destructivas
- Mantener consistencia visual

### **Manejo de Errores:**
- Logs detallados en desarrollo
- Mensajes amigables para usuarios
- Retry automático para errores de red
- Fallbacks para datos faltantes

### **Seguridad:**
- Validar datos en frontend y backend
- Sanitizar inputs de usuario
- Verificar permisos por rol
- No exponer información sensible

### **Mantenibilidad:**
- Usar TypeScript para type safety
- Componentizar elementos reutilizables
- Documentar funciones complejas
- Mantener separación de responsabilidades

---

**📁 Archivo generado el:** 17 de septiembre de 2025  
**🔄 Versión:** 1.0  
**👥 Para uso en:** Proyectos de dashboard administrativo con Next.js + React + TypeScript