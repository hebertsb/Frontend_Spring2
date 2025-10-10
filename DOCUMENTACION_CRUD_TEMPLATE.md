# 📋 PLANTILLA COMPLETA: Implementación CRUD Dashboard Admin

## 🎯 **OBJETIVO DE ESTE DOCUMENTO**
Esta documentación sirve como **plantilla completa** basada en la implementación exitosa del **Sistema de Reservas**. Úsala como guía para implementar otros casos de uso siguiendo el mismo patrón probado.

---

## 🗂 **CASOS DE USO IMPLEMENTADOS Y PENDIENTES**

### ✅ **COMPLETAMENTE IMPLEMENTADOS**
1. **Sistema de Reservas** - CRUD completo con panel cliente
   - ✅ Visualización (READ)
   - ✅ Creación (CREATE) 
   - ✅ Edición/Cancelación (UPDATE)
   - ✅ Filtros y búsqueda avanzada
   - ✅ Modales interactivos
   - ✅ Manejo de errores robusto

### 🔄 **PENDIENTES DE IMPLEMENTAR**
2. **Gestión de Usuarios**
3. **Cupones y Descuentos** 
4. **Gestión de Informes**
5. **Paquetes/Servicios**
6. **Destinos**

---

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
    { title: "Gestión de reservas", url: "/panel?tab=reservas", icon: IconListDetails }, // ← IMPLEMENTADO COMPLETO
    { title: "Cupones y descuentos", url: "/panel?tab=cupones", icon: IconListDetails },
    { title: "Gestión de informes", url: "/panel?tab=informes", icon: IconChartBar },
    // AGREGAR NUEVOS CASOS DE USO AQUÍ SIGUIENDO EL PATRÓN:
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
import AdminReservasDashboard from "@/components/admin-reservas-dashboard-fixed" // ← IMPLEMENTADO COMPLETO
// IMPORTAR NUEVOS COMPONENTES AQUÍ SIGUIENDO EL PATRÓN:
// import AdminUsuariosDashboard from "@/components/admin-usuarios-dashboard"
// import AdminPaquetesDashboard from "@/components/admin-paquetes-dashboard"
// import AdminCuponesDashboard from "@/components/admin-cupones-dashboard"
import ProtectedRoute from "@/components/ProtectedRoute"

import data from "./data.json"

export default function Page() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "panel"; // ← CAPTURA EL PARÁMETRO DE NAVEGACIÓN

  // FUNCIÓN DE RENDERIZADO CONDICIONAL - AGREGAR NUEVOS CASOS AQUÍ
  const renderContent = () => {
    switch (tab) {
      case "reservas":
        return <AdminReservasDashboard />; // ← IMPLEMENTADO COMPLETO
      
      // CASOS PENDIENTES - SEGUIR ESTE PATRÓN:
      case "usuarios":
        return <div>Dashboard de Usuarios - Por implementar</div>;
        // return <AdminUsuariosDashboard />;
      
      case "cupones":
        return <div>Dashboard de Cupones - Por implementar</div>;
        // return <AdminCuponesDashboard />;
      
      case "informes":
        return <div>Dashboard de Informes - Por implementar</div>;
        // return <AdminInformesDashboard />;
      
      default:
        return <AdminDashboard />;
    }
  };

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
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {renderContent()} {/* ← RENDERIZADO CONDICIONAL */}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
```

---

## 🎯 **2. ESTRUCTURA COMPLETA DEL COMPONENTE CRUD**

### **2.1 Estructura Base del Archivo**
**Ubicación**: `src/components/admin-[entidad]-dashboard.tsx`

```tsx
'use client'

// ========================================
// IMPORTS ESTÁNDAR
// ========================================
import React, { useState, useEffect } from "react";
import { Edit, Trash2, Plus, Search, Filter, RefreshCw, Eye, Calendar, User, MapPin, DollarSign, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// ========================================
// IMPORTS DE API - PERSONALIZAR SEGÚN ENTIDAD
// ========================================
import { listarReservas, crearReserva, editarReserva, eliminarReserva } from "@/api/reservas";
// PARA OTRAS ENTIDADES:
// import { listarUsuarios, crearUsuario, editarUsuario, eliminarUsuario } from "@/api/usuarios";
// import { listarPaquetes, crearPaquete, editarPaquete, eliminarPaquete } from "@/api/paquetes";

// ========================================
// INTERFACES TYPESCRIPT
// ========================================
interface Reserva { // ← CAMBIAR POR LA ENTIDAD CORRESPONDIENTE
  id: number;
  fecha_inicio: string;
  estado: string;
  total: string;
  detalles: Array<{
    titulo: string;
    tipo: string;
    precio_unitario: string;
    cantidad: number;
  }>;
  usuario?: {
    id: number;
    username: string;
  };
  notas?: string;
  created_at: string;
}

// AGREGAR INTERFACES PARA OTRAS ENTIDADES:
/*
interface Usuario {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  date_joined: string;
  role: string;
}

interface Paquete {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string;
  duracion: number;
  destinos: string[];
  estado: string;
  created_at: string;
}
*/

// ========================================
// COMPONENTE PRINCIPAL
// ========================================
export default function AdminReservasDashboard() {
  // ========================================
  // ESTADOS PRINCIPALES
  // ========================================
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para filtros y búsqueda
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  
  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  
  // Estados para la entidad seleccionada
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [editingReserva, setEditingReserva] = useState<Reserva | null>(null);
  const [reservaToDelete, setReservaToDelete] = useState<Reserva | null>(null);
  
  const { toast } = useToast();

  // ========================================
  // FUNCIONES DE CARGA DE DATOS
  // ========================================
  const cargarReservas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Cargando reservas...');
      const response = await listarReservas();
      
      if (response.data && Array.isArray(response.data)) {
        setReservas(response.data);
        console.log('✅ Reservas cargadas:', response.data.length);
      } else {
        console.warn('⚠️ Respuesta inesperada:', response);
        setReservas([]);
      }
    } catch (error: any) {
      console.error('❌ Error al cargar reservas:', error);
      setError('Error al cargar las reservas');
      
      toast({
        title: "Error",
        description: "No se pudieron cargar las reservas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // FUNCIONES CRUD
  // ========================================
  
  // CREAR NUEVA ENTIDAD
  const handleCreate = async (datosNuevaReserva: Partial<Reserva>) => {
    try {
      console.log('🔄 Creando reserva:', datosNuevaReserva);
      
      const response = await crearReserva(datosNuevaReserva);
      
      if (response.status === 201) {
        await cargarReservas(); // Recargar lista
        setShowCreateModal(false);
        
        toast({
          title: "Reserva Creada",
          description: "La reserva se ha creado exitosamente.",
        });
      }
    } catch (error: any) {
      console.error('❌ Error al crear reserva:', error);
      
      toast({
        title: "Error",
        description: "No se pudo crear la reserva",
        variant: "destructive",
      });
    }
  };

  // EDITAR ENTIDAD EXISTENTE
  const handleEdit = async (datosActualizados: Partial<Reserva>) => {
    if (!editingReserva) return;
    
    try {
      console.log('🔄 Editando reserva:', editingReserva.id, datosActualizados);
      
      const response = await editarReserva(editingReserva.id.toString(), datosActualizados);
      
      if (response.status === 200) {
        await cargarReservas(); // Recargar lista
        setShowEditModal(false);
        setEditingReserva(null);
        
        toast({
          title: "Reserva Actualizada",
          description: "La reserva se ha actualizado exitosamente.",
        });
      }
    } catch (error: any) {
      console.error('❌ Error al editar reserva:', error);
      
      toast({
        title: "Error",
        description: "No se pudo actualizar la reserva",
        variant: "destructive",
      });
    }
  };

  // ELIMINAR ENTIDAD
  const handleDelete = async () => {
    if (!reservaToDelete) return;
    
    try {
      console.log('🔄 Eliminando reserva:', reservaToDelete.id);
      
      const response = await eliminarReserva(reservaToDelete.id.toString());
      
      if (response.status === 204) {
        await cargarReservas(); // Recargar lista
        setShowDeleteConfirm(false);
        setReservaToDelete(null);
        
        toast({
          title: "Reserva Eliminada",
          description: "La reserva se ha eliminado exitosamente.",
        });
      }
    } catch (error: any) {
      console.error('❌ Error al eliminar reserva:', error);
      
      toast({
        title: "Error",
        description: "No se pudo eliminar la reserva",
        variant: "destructive",
      });
    }
  };

  // ========================================
  // FUNCIONES DE FILTRADO Y BÚSQUEDA
  // ========================================
  const reservasFiltradas = reservas.filter(reserva => {
    // Filtro por estado
    const coincideEstado = filtroEstado === "todos" || reserva.estado === filtroEstado;
    
    // Filtro por búsqueda
    const terminoBusqueda = busqueda.toLowerCase();
    const coincideBusqueda = !terminoBusqueda || 
      reserva.id.toString().includes(terminoBusqueda) ||
      reserva.usuario?.username?.toLowerCase().includes(terminoBusqueda) ||
      reserva.detalles.some(detalle => 
        detalle.titulo?.toLowerCase().includes(terminoBusqueda)
      );
    
    return coincideEstado && coincideBusqueda;
  });

  // ========================================
  // FUNCIONES DE UTILIDAD
  // ========================================
  const obtenerBadgeEstado = (estado: string) => {
    const estados = {
      'pendiente': { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      'confirmada': { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      'cancelada': { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
      'completada': { variant: 'outline' as const, icon: CheckCircle, color: 'text-blue-600' }
    };
    
    return estados[estado as keyof typeof estados] || estados.pendiente;
  };

  // ========================================
  // EFECTOS
  // ========================================
  useEffect(() => {
    cargarReservas();
  }, []);

  // ========================================
  // RENDER CONDICIONAL DE ESTADOS
  // ========================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando reservas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center space-y-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-destructive">{error}</p>
          <Button onClick={cargarReservas} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

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
  // ========================================
  // RENDER PRINCIPAL JSX
  // ========================================
  return (
    <div className="p-6 space-y-6">
      {/* ========================================
          HEADER CON TÍTULO Y BOTÓN CREAR
          ======================================== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Reservas</h1>
          <p className="text-muted-foreground">
            Administra todas las reservas del sistema
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Reserva
        </Button>
      </div>

      {/* ========================================
          SECCIÓN DE ESTADÍSTICAS
          ======================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reservas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reservas.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reservas.filter(r => r.estado === 'pendiente').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reservas.filter(r => r.estado === 'confirmada').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Canceladas</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reservas.filter(r => r.estado === 'cancelada').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================
          FILTROS Y BÚSQUEDA
          ======================================== */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por ID, usuario o paquete..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Filtro de estado */}
            <div className="w-full md:w-48">
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="pendiente">Pendientes</SelectItem>
                  <SelectItem value="confirmada">Confirmadas</SelectItem>
                  <SelectItem value="cancelada">Canceladas</SelectItem>
                  <SelectItem value="completada">Completadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Botón refrescar */}
            <Button variant="outline" onClick={cargarReservas}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ========================================
          TABLA DE DATOS
          ======================================== */}
      <Card>
        <CardHeader>
          <CardTitle>Reservas ({reservasFiltradas.length})</CardTitle>
          <CardDescription>
            Listado completo de reservas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reservasFiltradas.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No se encontraron reservas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">ID</th>
                    <th className="text-left p-4 font-medium">Usuario</th>
                    <th className="text-left p-4 font-medium">Paquete</th>
                    <th className="text-left p-4 font-medium">Fecha</th>
                    <th className="text-left p-4 font-medium">Estado</th>
                    <th className="text-left p-4 font-medium">Total</th>
                    <th className="text-left p-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reservasFiltradas.map((reserva) => {
                    const estadoInfo = obtenerBadgeEstado(reserva.estado);
                    const IconoEstado = estadoInfo.icon;
                    
                    return (
                      <tr key={reserva.id} className="border-b hover:bg-muted/50">
                        <td className="p-4 font-mono">#{reserva.id}</td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{reserva.usuario?.username || 'Usuario no disponible'}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {reserva.detalles.length > 0 
                                ? reserva.detalles[0].titulo 
                                : 'Paquete no disponible'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(reserva.fecha_inicio).toLocaleDateString('es-ES')}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant={estadoInfo.variant} className="flex items-center space-x-1">
                            <IconoEstado className="h-3 w-3" />
                            <span className="capitalize">{reserva.estado}</span>
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">${reserva.total}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            {/* Botón Ver */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedReserva(reserva);
                                setShowViewModal(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            {/* Botón Editar */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingReserva(reserva);
                                setShowEditModal(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            {/* Botón Eliminar */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setReservaToDelete(reserva);
                                setShowDeleteConfirm(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========================================
          MODALES - IMPLEMENTACIÓN COMPLETA
          ======================================== */}
      
      {/* Modal Ver Detalles */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Reserva #{selectedReserva?.id}</DialogTitle>
            <DialogDescription>
              Información completa de la reserva
            </DialogDescription>
          </DialogHeader>
          
          {selectedReserva && (
            <div className="space-y-4">
              {/* Información básica */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Usuario</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedReserva.usuario?.username || 'No disponible'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Estado</Label>
                  <div className="mt-1">
                    <Badge variant={obtenerBadgeEstado(selectedReserva.estado).variant}>
                      {selectedReserva.estado}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Fecha de inicio</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedReserva.fecha_inicio).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Total</Label>
                  <p className="text-sm text-muted-foreground font-semibold">
                    ${selectedReserva.total}
                  </p>
                </div>
              </div>
              
              {/* Detalles del paquete */}
              <div>
                <Label className="text-sm font-medium">Detalles del paquete</Label>
                <div className="mt-2 space-y-2">
                  {selectedReserva.detalles.map((detalle, index) => (
                    <div key={index} className="bg-muted p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{detalle.titulo}</p>
                          <p className="text-sm text-muted-foreground">
                            Tipo: {detalle.tipo}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${detalle.precio_unitario}</p>
                          <p className="text-sm text-muted-foreground">
                            Cantidad: {detalle.cantidad}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Notas */}
              {selectedReserva.notas && (
                <div>
                  <Label className="text-sm font-medium">Notas</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedReserva.notas}
                  </p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewModal(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Confirmar Eliminación */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar la reserva #{reservaToDelete?.id}?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

---

## 🔧 **3. CONFIGURACIÓN DE API**

### **3.1 Configuración de axios.ts**
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

### **3.2 Template para API de Entidades**
```typescript
// api/reservas.ts (PLANTILLA PARA OTRAS ENTIDADES)
import axios from './axios';

// ========================================
// FUNCIONES CRUD BÁSICAS
// ========================================

// OBTENER TODAS LAS ENTIDADES
export const listarReservas = () => axios.get('/reservas/');

// CREAR NUEVA ENTIDAD
export const crearReserva = (data: any) => axios.post('/reservas/', data);

// EDITAR ENTIDAD EXISTENTE
export const editarReserva = async (id: string, data: any) => {
  try {
    console.log('🔄 API: Editando reserva con ID:', id);
    console.log('🔄 API: Datos a enviar:', data);
    
    const response = await axios.put(`/reservas/${id}/`, data);
    
    console.log('✅ API: Respuesta exitosa:', response.status);
    console.log('✅ API: Data devuelto:', response.data);
    
    return response;
  } catch (error: any) {
    console.error('❌ API: Error al editar:', error);
    console.error('❌ API: Respuesta del servidor:', error.response?.data);
    throw error;
  }
};

// ELIMINAR ENTIDAD
export const eliminarReserva = (id: string) => axios.delete(`/reservas/${id}/`);

// ========================================
// FUNCIONES ESPECÍFICAS (OPCIONAL)
// ========================================

// Obtener entidad por ID
export const obtenerReserva = (id: string) => axios.get(`/reservas/${id}/`);

// Búsqueda avanzada
export const buscarReservas = (filtros: any) => axios.get('/reservas/', { params: filtros });

// ========================================
// PLANTILLA PARA OTRAS ENTIDADES
// ========================================

/* 
// api/usuarios.ts
export const listarUsuarios = () => axios.get('/usuarios/');
export const crearUsuario = (data: any) => axios.post('/usuarios/', data);
export const editarUsuario = (id: string, data: any) => axios.put(`/usuarios/${id}/`, data);
export const eliminarUsuario = (id: string) => axios.delete(`/usuarios/${id}/`);

// api/paquetes.ts
export const listarPaquetes = () => axios.get('/paquetes/');
export const crearPaquete = (data: any) => axios.post('/paquetes/', data);
export const editarPaquete = (id: string, data: any) => axios.put(`/paquetes/${id}/`, data);
export const eliminarPaquete = (id: string) => axios.delete(`/paquetes/${id}/`);

// api/cupones.ts
export const listarCupones = () => axios.get('/cupones/');
export const crearCupon = (data: any) => axios.post('/cupones/', data);
export const editarCupon = (id: string, data: any) => axios.put(`/cupones/${id}/`, data);
export const eliminarCupon = (id: string) => axios.delete(`/cupones/${id}/`);
*/
```

---

## 🎯 **4. CASOS DE USO ESPECÍFICOS - GUÍAS DE IMPLEMENTACIÓN**

### **4.1 GESTIÓN DE USUARIOS**
```typescript
// Estructura de datos específica
interface Usuario {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  date_joined: string;
  role: string;
  phone?: string;
  avatar?: string;
}

// Campos específicos del formulario
const camposFormularioUsuario = [
  'username', 'email', 'first_name', 'last_name', 
  'password', 'phone', 'role', 'is_active'
];

// Estados específicos
const estadosUsuario = ['activo', 'inactivo', 'suspendido'];

// Funciones de validación específicas
const validarUsuario = (datos: Partial<Usuario>) => {
  if (!datos.email?.includes('@')) return 'Email inválido';
  if (!datos.username || datos.username.length < 3) return 'Username muy corto';
  return null;
};
```

### **4.2 GESTIÓN DE PAQUETES/SERVICIOS**
```typescript
// Estructura de datos específica
interface Paquete {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string;
  duracion: number;
  destinos: string[];
  incluye: string[];
  no_incluye: string[];
  dificultad: 'facil' | 'moderado' | 'dificil';
  estado: 'activo' | 'inactivo' | 'agotado';
  imagenes: string[];
  created_at: string;
  updated_at: string;
}

// Campos específicos del formulario
const camposFormularioPaquete = [
  'nombre', 'descripcion', 'precio', 'duracion',
  'destinos', 'incluye', 'no_incluye', 'dificultad'
];

// Validaciones específicas
const validarPaquete = (datos: Partial<Paquete>) => {
  if (!datos.nombre) return 'Nombre requerido';
  if (!datos.precio || parseFloat(datos.precio) <= 0) return 'Precio inválido';
  if (!datos.duracion || datos.duracion < 1) return 'Duración inválida';
  return null;
};
```

### **4.3 GESTIÓN DE CUPONES Y DESCUENTOS**
```typescript
// Estructura de datos específica
interface Cupon {
  id: number;
  codigo: string;
  descripcion: string;
  tipo: 'porcentaje' | 'monto_fijo';
  valor: number;
  fecha_inicio: string;
  fecha_fin: string;
  usos_maximos: number;
  usos_actuales: number;
  estado: 'activo' | 'inactivo' | 'expirado';
  created_at: string;
}

// Campos específicos del formulario
const camposFormularioCupon = [
  'codigo', 'descripcion', 'tipo', 'valor',
  'fecha_inicio', 'fecha_fin', 'usos_maximos'
];

// Validaciones específicas
const validarCupon = (datos: Partial<Cupon>) => {
  if (!datos.codigo) return 'Código requerido';
  if (datos.tipo === 'porcentaje' && (datos.valor! < 0 || datos.valor! > 100)) {
    return 'Porcentaje debe estar entre 0-100';
  }
  if (new Date(datos.fecha_fin!) <= new Date(datos.fecha_inicio!)) {
    return 'Fecha fin debe ser posterior a fecha inicio';
  }
  return null;
};
```

---

## 🚀 **5. FLUJO COMPLETO DE IMPLEMENTACIÓN**

### **5.1 Checklist para Nuevo Caso de Uso**
- [ ] **1. Definir estructura de datos (Interface TypeScript)**
- [ ] **2. Crear archivo API (`api/[entidad].ts`)**
- [ ] **3. Agregar entrada en sidebar (`app-sidebar.tsx`)**
- [ ] **4. Agregar caso en router (`panel/page.tsx`)**
- [ ] **5. Crear componente dashboard (`admin-[entidad]-dashboard.tsx`)**
- [ ] **6. Implementar CRUD básico (Create, Read, Update, Delete)**
- [ ] **7. Agregar filtros y búsqueda**
- [ ] **8. Implementar modales (Ver, Editar, Crear, Eliminar)**
- [ ] **9. Agregar validaciones específicas**
- [ ] **10. Testear funcionalidad completa**

### **5.2 Pasos Detallados**

#### **Paso 1: Definir Interface**
```typescript
// En el componente dashboard
interface NuevaEntidad {
  id: number;
  // ... campos específicos
  created_at: string;
  updated_at?: string;
}
```

#### **Paso 2: Crear API**
```typescript
// api/nueva-entidad.ts
import axios from './axios';

export const listarEntidades = () => axios.get('/entidades/');
export const crearEntidad = (data: any) => axios.post('/entidades/', data);
export const editarEntidad = (id: string, data: any) => axios.put(`/entidades/${id}/`, data);
export const eliminarEntidad = (id: string) => axios.delete(`/entidades/${id}/`);
```

#### **Paso 3: Agregar al Sidebar**
```typescript
// app-sidebar.tsx
const data = {
  navMain: [
    // ... entradas existentes
    { title: "Gestión de Nueva Entidad", url: "/panel?tab=nueva-entidad", icon: IconExample },
  ],
}
```

#### **Paso 4: Agregar al Router**
```typescript
// panel/page.tsx
import AdminNuevaEntidadDashboard from "@/components/admin-nueva-entidad-dashboard";

const renderContent = () => {
  switch (tab) {
    // ... casos existentes
    case "nueva-entidad":
      return <AdminNuevaEntidadDashboard />;
    default:
      return <AdminDashboard />;
  }
};
```

#### **Paso 5: Crear Componente**
```typescript
// components/admin-nueva-entidad-dashboard.tsx
// Usar la plantilla completa de este documento
```

---

## 🛠 **6. FUNCIONALIDADES AVANZADAS IMPLEMENTADAS**

### **6.1 Sistema de Cliente Reservas**
**Archivo**: `components/client-reservations.tsx`

#### **Características Implementadas:**
- ✅ **Panel cliente completo** con reservas del usuario autenticado
- ✅ **Filtros avanzados** por estado y búsqueda en tiempo real  
- ✅ **Modal de detalles** con información completa de reserva
- ✅ **Cancelación de reservas** con confirmación modal
- ✅ **Estados dinámicos** con badges y colores apropiados
- ✅ **Manejo robusto de errores** para producción
- ✅ **Responsive design** para móviles y desktop

#### **Estructura del Componente Cliente:**
```typescript
// client-reservations.tsx
interface Reserva {
  id: number;
  fecha_inicio: string;
  estado: string;
  total: string;
  detalles: Array<{
    titulo: string;
    tipo: string;
    precio_unitario: string;
    cantidad: number;
  }>;
  usuario?: {
    id: number;
    username: string;
  };
  notas?: string;
  created_at: string;
}

export default function ClientReservations() {
  // Estados para la gestión
  const [reservations, setReservations] = useState<Reserva[]>([]);
  const [filtro, setFiltro] = useState("todas");
  const [busqueda, setBusqueda] = useState("");
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  // Funciones principales
  const cargarReservas = async () => { /* ... */ };
  const confirmarCancelacion = async () => { /* ... */ };
  
  // Filtrado avanzado
  const reservasFiltradas = reservations.filter(reserva => {
    const coincideEstado = filtro === "todas" || reserva.estado === filtro;
    const terminoBusqueda = busqueda.toLowerCase();
    const coincideBusqueda = !terminoBusqueda || 
      reserva.id.toString().includes(terminoBusqueda) ||
      reserva.detalles.some(detalle => 
        detalle.titulo?.toLowerCase().includes(terminoBusqueda)
      );
    return coincideEstado && coincideBusqueda;
  });
  
  // JSX con grid responsivo y modales
  return (
    <div className="p-6 space-y-6">
      {/* Filtros y búsqueda */}
      {/* Grid de reservas */}
      {/* Modales de detalles y cancelación */}
    </div>
  );
}
```

### **6.2 Manejo de Errores de Producción**
#### **Problemas Resueltos:**
- ✅ **API returning HTML instead of JSON**: Validación de content-type
- ✅ **TypeScript property errors**: Corrección de interfaces User
- ✅ **Network validation errors**: Payload completo para APIs
- ✅ **Environment configuration**: Setup para múltiples entornos

#### **Implementación de Error Handling:**
```typescript
// Ejemplo de manejo robusto de errores
const cargarDatos = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/entidad`);
    
    // Validar que la respuesta sea JSON válido
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("La respuesta no es JSON válido");
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    setDatos(data);
  } catch (error: any) {
    console.error('Error al cargar datos:', error);
    
    // Manejo específico de errores
    let mensajeError = "Error al cargar datos";
    if (error.response?.data?.detail) {
      mensajeError = error.response.data.detail;
    } else if (error.message) {
      mensajeError = error.message;
    }
    
    toast({
      title: "Error",
      description: mensajeError,
      variant: "destructive",
    });
  }
};
```

---

## 📚 **7. ARCHIVOS CLAVE MODIFICADOS**

### **7.1 Ubicaciones Importantes**
```
src/
├── components/
│   ├── admin-reservas-dashboard-fixed.tsx ✅ COMPLETO
│   ├── client-reservations.tsx ✅ COMPLETO  
│   ├── app-sidebar.tsx ✅ CONFIGURADO
│   └── [admin-nueva-entidad-dashboard.tsx] 🔄 PENDIENTE
├── app/
│   ├── panel/page.tsx ✅ ROUTER CONFIGURADO
│   ├── destinos/page.tsx ✅ ERROR HANDLING
│   ├── destinos/[id]/page.tsx ✅ ERROR HANDLING
│   └── reserva/page.tsx ✅ FORM MEJORADO
├── api/
│   ├── axios.ts ✅ CONFIGURADO
│   ├── reservas.ts ✅ COMPLETO
│   └── [nueva-entidad.ts] 🔄 PENDIENTE
└── hooks/
    ├── useAuth.ts ✅ FUNCIONANDO
    └── use-toast.ts ✅ FUNCIONANDO
```

---

## 🎯 **8. PRÓXIMOS PASOS PARA IMPLEMENTAR**

### **Casos de Uso Pendientes:**
1. **Gestión de Usuarios** (`admin-usuarios-dashboard.tsx`)
2. **Gestión de Paquetes** (`admin-paquetes-dashboard.tsx`)  
3. **Cupones y Descuentos** (`admin-cupones-dashboard.tsx`)
4. **Sistema de Informes** (`admin-informes-dashboard.tsx`)

### **Para cada caso, seguir:**
1. Usar esta documentación como referencia
2. Copiar la estructura del componente de reservas
3. Adaptar las interfaces TypeScript
4. Crear las APIs correspondientes
5. Implementar validaciones específicas
6. Testear funcionalidad completa

---

## 🏆 **RESUMEN: TRABAJO COMPLETADO**

### ✅ **IMPLEMENTADO AL 100%**
- **Sistema de Reservas Admin**: CRUD completo con modales
- **Panel Cliente Reservas**: Visualización y cancelación  
- **Manejo de Errores**: Producción-ready
- **TypeScript**: Interfaces corregidas
- **Routing**: Sistema de tabs funcional
- **API Integration**: Axios configurado
- **Error Handling**: Robusto para producción

### 🎯 **PLANTILLA LISTA PARA USAR**
Este documento contiene **todo lo necesario** para implementar cualquier nuevo caso de uso siguiendo el patrón probado y funcional del sistema de reservas.

**Uso recomendado**: Copiar esta documentación a un nuevo chat y solicitar implementación de casos específicos siguiendo estos patrones.
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