'use client'

import React, { useState, useEffect } from "react";
import { Calendar, User, Filter, Search, Clock, RefreshCw, X, MapPin, DollarSign, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { listarReservas, editarReserva } from "@/api/reservas";
import { useToast } from "@/hooks/use-toast";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

// ========================================
// INTERFACES ACTUALIZADAS SEGÚN BACKEND
// ========================================

interface Acompanante {
  id: number;
  documento: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  nacionalidad: string;
  email: string;
  telefono: string;
  created_at: string;
  updated_at: string;
}

interface ReservaAcompanante {
  id: number;
  acompanante: Acompanante;
  estado: string;
  es_titular: boolean;
}

interface ReservaServicio {
  id: number;
  servicio: number;
  nombre_servicio: string;
  tipo_servicio: string;
  cantidad_personas: number;
  subtotal: string;
  precio_unitario: string;
  fecha_servicio: string;
}

interface Reserva {
  id: number;
  usuario: number;
  fecha_inicio: string;
  estado: 'PENDIENTE' | 'PAGADA' | 'CANCELADA' | 'REPROGRAMADA';
  cupon: number | null;
  total: string;
  moneda: string;
  fecha_original?: string;
  fecha_reprogramacion?: string;
  motivo_reprogramacion?: string;
  numero_reprogramaciones: number;
  reprogramado_por?: number;
  created_at: string;
  updated_at: string;
  servicios: ReservaServicio[];
  acompanantes: ReservaAcompanante[];
  notas?: string;
}

export default function ClientReservations() {
  const [reservations, setReservations] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todas");
  const [busqueda, setBusqueda] = useState("");
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [reservaToCancel, setReservaToCancel] = useState<Reserva | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  // Cargar reservas del usuario
  const cargarReservas = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para ver tus reservas",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 Usuario actual:', user);
      console.log('🔍 ID del usuario:', user.id, 'Tipo:', typeof user.id);
      
      const response = await listarReservas();
      console.log('📋 Todas las reservas del backend:', response.data);
      
      // La respuesta de axios viene en response.data
      if (response.data && Array.isArray(response.data)) {
        // Mostrar estructura de reservas para debug
        if (response.data.length > 0) {
          console.log('📋 Primera reserva ejemplo:', response.data[0]);
          console.log('📋 Usuario de la primera reserva:', response.data[0].usuario, 'Tipo:', typeof response.data[0].usuario);
        }
        
        // Logging detallado para debug
        console.log('🔍 Buscando reservas para userId:', user.id);
        console.log('🔍 Total de reservas recibidas:', response.data.length);
        
        // Analizar estructura de las reservas
        if (response.data.length > 0) {
          console.log('📋 Primera reserva ejemplo completa:', response.data[0]);
          console.log('📋 Campo usuario de primera reserva:', response.data[0].usuario);
          console.log('📋 Tipo del campo usuario:', typeof response.data[0].usuario);
        }
        
        // Filtrar reservas considerando que usuario puede ser un objeto
        const reservasUsuario = response.data.filter(
          (reserva: Reserva) => {
            // Extraer ID del usuario dependiendo de la estructura
            let reservaUserId;
            
            if (typeof reserva.usuario === 'object' && reserva.usuario !== null) {
              // Si usuario es un objeto, buscar el campo id
              reservaUserId = (reserva.usuario as any).id;
              console.log(`🔍 Reserva ${reserva.id}: usuario es objeto con id=${reservaUserId}`);
            } else {
              // Si usuario es primitivo (número o string)
              reservaUserId = reserva.usuario;
              console.log(`🔍 Reserva ${reserva.id}: usuario es primitivo=${reservaUserId}`);
            }
            
            // Comparaciones múltiples para asegurar compatibilidad
            const userIdString = String(user.id);
            const userIdNumber = Number(user.id);
            const reservaUserIdString = String(reservaUserId);
            const reservaUserIdNumber = Number(reservaUserId);
            
            const match = reservaUserIdNumber === userIdNumber || reservaUserIdString === userIdString;
            
            console.log(`🔍 Comparando: reservaUserId(${reservaUserId}) === userId(${user.id}) = ${match}`);
            
            return match;
          }
        );
        
        console.log('✅ Reservas filtradas para el usuario:', reservasUsuario);
        setReservations(reservasUsuario);
        
        if (reservasUsuario.length === 0) {
          toast({
            title: "Información",
            description: "No tienes reservas registradas",
          });
        }
      } else {
        setReservations([]);
        toast({
          title: "Información",
          description: "No tienes reservas registradas",
        });
      }
    } catch (error: any) {
      console.error('❌ Error al cargar reservas:', error);
      
      let mensajeError = "No se pudieron cargar las reservas";
      
      // Manejar errores específicos
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        mensajeError = "La carga de reservas está tomando más tiempo del esperado. Reintentando...";
        console.log('⏰ Timeout detectado, reintentando en 3 segundos...');
        
        // Reintentar después de 3 segundos
        setTimeout(() => {
          console.log('🔄 Reintentando cargar reservas...');
          cargarReservas();
        }, 3000);
      } else if (error.response?.status === 500) {
        mensajeError = "Error del servidor. Intente nuevamente en unos momentos.";
      } else if (error.response?.status === 401) {
        mensajeError = "Su sesión ha expirado. Por favor, inicie sesión nuevamente.";
      }
      
      toast({
        title: "Error",
        description: mensajeError,
        variant: "destructive",
        duration: error.code === 'ECONNABORTED' ? 3000 : 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReservas();
  }, [user]);

  // Filtrar reservas según estado y búsqueda
  const reservasFiltradas = reservations.filter(reserva => {
    const cumpleFiltro = filtro === "todas" || reserva.estado.toLowerCase() === filtro.toLowerCase();
    
    // Buscar en ID de reserva, nombres de acompañantes o servicios
    const terminoBusqueda = busqueda.toLowerCase();
    const cumpleBusqueda = !terminoBusqueda || 
      reserva.id.toString().includes(terminoBusqueda) ||
      (reserva.acompanantes || []).some(ra => 
        ra.acompanante.nombre.toLowerCase().includes(terminoBusqueda) ||
        ra.acompanante.apellido.toLowerCase().includes(terminoBusqueda) ||
        ra.acompanante.documento.toLowerCase().includes(terminoBusqueda)
      ) ||
      (reserva.servicios || []).some((servicio: ReservaServicio) => 
                servicio.nombre_servicio?.toLowerCase().includes(busqueda.toLowerCase())
      );
    
    return cumpleFiltro && cumpleBusqueda;
  });

  // Funciones helper actualizadas para estados del backend
  const getEstadoColor = (estado: string) => {
    switch (estado.toUpperCase()) {
      case "PAGADA":
        return "border-green-200 bg-green-50 text-green-700";
      case "PENDIENTE":
        return "border-yellow-200 bg-yellow-50 text-yellow-700";
      case "CANCELADA":
        return "border-red-200 bg-red-50 text-red-700";
      case "REPROGRAMADA":
        return "border-purple-200 bg-purple-50 text-purple-700";
      default:
        return "border-gray-200 bg-gray-50 text-gray-700";
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado.toUpperCase()) {
      case "PAGADA":
        return "Pagada";
      case "PENDIENTE":
        return "Pendiente";
      case "CANCELADA":
        return "Cancelada";
      case "REPROGRAMADA":
        return "Reprogramada";
      default:
        return estado;
    }
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const obtenerImagenDestino = (titulo: string) => {
    if (titulo.toLowerCase().includes("salar")) return "/salar-de-uyuni-atardecer.png";
    if (titulo.toLowerCase().includes("titicaca")) return "/lago-titicaca-bolivia-panorama.png";
    if (titulo.toLowerCase().includes("madidi")) return "/madidi-amazon-rainforest.png";
    if (titulo.toLowerCase().includes("tiwanaku")) return "/tiwanaku-community.png";
    if (titulo.toLowerCase().includes("copacabana")) return "/copacabana-bolivia.png";
    if (titulo.toLowerCase().includes("potosí")) return "/bolivia-tour-uyuni-titicaca.png";
    if (titulo.toLowerCase().includes("la paz")) return "/bolivia-andes-trekking.png";
    return "/placeholder.jpg";
  };

  // Función para abrir el modal de detalles
  const verDetallesReserva = (reserva: Reserva) => {
    setSelectedReserva(reserva);
    setShowModal(true);
  };

  // Función para cerrar el modal
  const cerrarModal = () => {
    setShowModal(false);
    setSelectedReserva(null);
  };

  // Función para cancelar reserva
  const cancelarReserva = async (reserva: Reserva) => {
    setReservaToCancel(reserva);
    setShowCancelConfirm(true);
  };

  // Función para confirmar la cancelación
  const confirmarCancelacion = async () => {
    if (!reservaToCancel) return;

    try {
      setLoading(true);

      // Preparar datos completos para cancelar - incluir TODOS los campos de la reserva original
      const datosActualizados = {
        // Campos obligatorios del sistema
        estado: "CANCELADA",
        fecha_inicio: reservaToCancel.fecha_inicio,
        total: reservaToCancel.total,
        
        // Servicios de la reserva
        servicios: reservaToCancel.servicios,
        
        // Información del usuario
        usuario: reservaToCancel.usuario || user?.id,
        
        // Notas actualizadas con motivo de cancelación
        notas: reservaToCancel.notas 
          ? `${reservaToCancel.notas}\n\n[CANCELADA] Reserva cancelada por el cliente el ${new Date().toLocaleDateString('es-ES')}.` 
          : `[CANCELADA] Reserva cancelada por el cliente el ${new Date().toLocaleDateString('es-ES')}.`,
        
        // Campos adicionales que pueden ser requeridos por el backend
        created_at: reservaToCancel.created_at
      };

      console.log('🔄 Cancelando reserva:', reservaToCancel.id);
      console.log('🔄 Datos de cancelación completos:', datosActualizados);

      const response = await editarReserva(reservaToCancel.id.toString(), datosActualizados);

      if (response.status === 200) {
        toast({
          title: "Reserva Cancelada",
          description: `La reserva #${reservaToCancel.id} ha sido cancelada exitosamente.`,
        });

        // Recargar las reservas para mostrar el estado actualizado
        await cargarReservas();

        // Cerrar modales
        setShowCancelConfirm(false);
        setReservaToCancel(null);
        if (showModal) {
          cerrarModal();
        }
      }
    } catch (error: any) {
      console.error('❌ Error al cancelar reserva:', error);
      console.error('❌ Response data:', error.response?.data);
      console.error('❌ Request data que falló:', error.config?.data);
      
      let mensajeError = "No se pudo cancelar la reserva";
      if (error.response?.data?.detail) {
        mensajeError = error.response.data.detail;
      } else if (error.response?.data?.error) {
        mensajeError = error.response.data.error;
      } else if (error.response?.data) {
        // Si hay errores de validación específicos, mostrarlos
        const errores = error.response.data;
        if (typeof errores === 'object') {
          const mensajes = Object.entries(errores).map(([campo, mensaje]) => 
            `${campo}: ${Array.isArray(mensaje) ? mensaje.join(', ') : mensaje}`
          ).join('\n');
          mensajeError = `Errores de validación:\n${mensajes}`;
        }
      } else if (error.message) {
        mensajeError = error.message;
      }

      toast({
        title: "Error al Cancelar",
        description: mensajeError,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar el diálogo de confirmación
  const cerrarConfirmacion = () => {
    setShowCancelConfirm(false);
    setReservaToCancel(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-lg shadow-sm">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Cargando tus reservas...
            </h3>
            <p className="text-gray-600 text-sm">
              Esto puede tomar unos momentos mientras recuperamos toda la información
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Mis Reservas
        </h1>
        <p className="text-gray-600">
          Gestiona y revisa todas tus reservas de viaje
        </p>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar por destino..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filtro por estado */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todas">Todas las reservas</option>
              <option value="pagada">Pagadas</option>
              <option value="pendiente">Pendientes</option>
              <option value="cancelada">Canceladas</option>
              <option value="reprogramada">Reprogramadas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de reservas */}
      <div className="grid gap-6">
        {reservasFiltradas.length > 0 ? (
          reservasFiltradas.map((reserva) => {
            // Obtener información del titular con validación segura
            const acompanantes = reserva.acompanantes || [];
            const servicios = reserva.servicios || [];
            
            const titular = acompanantes.find(ra => ra.es_titular);
            const nombreTitular = titular ? `${titular.acompanante.nombre} ${titular.acompanante.apellido}` : 'N/A';
            const totalPersonas = acompanantes.length;
            const totalServicios = servicios.length;
            
            console.log('🔍 Datos de reserva:', {
              id: reserva.id,
              acompanantes: acompanantes,
              servicios: servicios,
              totalPersonas,
              totalServicios
            });
            
            return (
              <div key={reserva.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row">
                  {/* Imagen */}
                  <div className="md:w-64 h-48 md:h-auto">
                    <img
                      src={obtenerImagenDestino(`Reserva ${reserva.id}`)}
                      alt={`Reserva ${reserva.id}`}
                      className="w-full h-full object-cover rounded-t-xl md:rounded-l-xl md:rounded-t-none"
                    />
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          Reserva #{reserva.id}
                        </h3>
                        <p className="text-gray-600 mb-2">Titular: {nombreTitular}</p>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getEstadoColor(reserva.estado)}`}>
                          {getEstadoTexto(reserva.estado)}
                        </div>
                        {totalServicios > 1 && (
                          <div className="mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {totalServicios} servicio{totalServicios > 1 ? 's' : ''}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="text-right mt-4 md:mt-0">
                        <div className="text-2xl font-bold text-blue-600">
                          {reserva.moneda === 'USD' ? '$' : 'Bs. '}
                          {parseFloat(reserva.total).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">{reserva.moneda}</div>
                      </div>
                    </div>

                    {/* Detalles */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <div>
                          <div className="text-xs text-gray-500">Fecha de viaje</div>
                          <div className="text-sm font-medium">{formatFecha(reserva.fecha_inicio)}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <div>
                          <div className="text-xs text-gray-500">Servicios</div>
                          <div className="text-sm font-medium">{totalServicios} servicio{totalServicios > 1 ? 's' : ''}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <div>
                          <div className="text-xs text-gray-500">Acompañantes</div>
                          <div className="text-sm font-medium">{totalPersonas} persona{totalPersonas > 1 ? 's' : ''}</div>
                        </div>
                      </div>
                    </div>

                    {/* Información adicional */}
                    <div className="text-xs text-gray-500 mb-4">
                      <div>Reservado el {formatFecha(reserva.created_at)}</div>
                      {reserva.numero_reprogramaciones > 0 && (
                        <div className="mt-1 text-orange-600">
                          <strong>Reprogramaciones:</strong> {reserva.numero_reprogramaciones}
                        </div>
                      )}
                      {reserva.motivo_reprogramacion && (
                        <div className="mt-1 text-gray-600">
                          <strong>Motivo:</strong> {reserva.motivo_reprogramacion}
                        </div>
                      )}
                    </div>

                    {/* Lista de servicios si hay múltiples */}
                    {servicios.length > 1 && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Servicios incluidos:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {servicios.map((servicio: ReservaServicio, index: number) => (
                            <li key={index} className="flex justify-between">
                              <span>• {servicio.nombre_servicio} (x{servicio.cantidad_personas})</span>
                              <span className="font-medium">{reserva.moneda === 'USD' ? '$' : 'Bs. '}{parseFloat(servicio.precio_unitario).toFixed(2)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Botones de acción */}
                    <div className="flex gap-3">
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => verDetallesReserva(reserva)}
                      >
                        Ver Detalles
                      </Button>
                      {reserva.estado.toUpperCase() === "PAGADA" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => console.log('Modificar reserva:', reserva.id)}
                        >
                          Modificar
                        </Button>
                      )}
                      {(reserva.estado.toUpperCase() === "PAGADA" || 
                        reserva.estado.toUpperCase() === "PENDIENTE") && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-300 text-red-700 hover:bg-red-50"
                          onClick={() => cancelarReserva(reserva)}
                          disabled={loading}
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tienes reservas
            </h3>
            <p className="text-gray-500 mb-6">
              {busqueda || filtro !== "todas" 
                ? "No se encontraron reservas con los filtros aplicados"
                : "Aún no has realizado ninguna reserva. ¡Explora nuestros destinos!"
              }
            </p>
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={() => router.push('/destinos')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Explorar Destinos
              </Button>
              <Button 
                onClick={() => router.push('/paquetes')}
                variant="outline"
              >
                Ver Paquetes
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Botón de recarga */}
      <div className="mt-6 flex justify-center">
        <Button
          variant="outline"
          onClick={cargarReservas}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Recargar Reservas
        </Button>
      </div>

      {/* Modal de detalles de reserva */}
      {showModal && selectedReserva && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del modal */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Detalles de la Reserva</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={cerrarModal}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Contenido del modal */}
            <div className="p-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información General</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID de Reserva:</span>
                      <span className="font-medium">#{selectedReserva.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estado:</span>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getEstadoColor(selectedReserva.estado)}`}>
                        {selectedReserva.estado.charAt(0).toUpperCase() + selectedReserva.estado.slice(1)}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha de Reserva:</span>
                      <span className="font-medium">{formatFecha(selectedReserva.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha de Viaje:</span>
                      <span className="font-medium">{formatFecha(selectedReserva.fecha_inicio)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Usuario:</span>
                      <span className="font-medium">
                        {/* Buscar el titular en los acompañantes */}
                        {selectedReserva.acompanantes?.find(ra => ra.es_titular)?.acompanante?.nombre || 
                         `Usuario ID: ${selectedReserva.usuario}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Costos</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-2xl font-bold text-blue-600">
                      <span>Total:</span>
                      <span>${parseFloat(selectedReserva.total).toFixed(2)} USD</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Total acompañantes: {(selectedReserva.acompanantes || []).length} persona(s)
                    </div>
                    <div className="text-sm text-gray-600">
                      Servicios contratados: {(selectedReserva.servicios || []).length} servicio(s)
                    </div>
                  </div>
                </div>
              </div>

              {/* Detalles de actividades */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Servicios y Destinos
                </h3>
                <div className="grid gap-4">
                  {(selectedReserva.servicios || []).map((servicio, index) => (
                    <div key={servicio.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <img
                              src={obtenerImagenDestino(servicio.nombre_servicio)}
                              alt={servicio.nombre_servicio}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div>
                              <h4 className="font-semibold text-gray-900">{servicio.nombre_servicio}</h4>
                              <p className="text-sm text-gray-600 capitalize">{servicio.tipo_servicio}</p>
                              <p className="text-sm text-gray-600">{servicio.cantidad_personas} persona(s)</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            ${parseFloat(servicio.precio_unitario).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">por persona</div>
                          <div className="text-sm font-medium text-blue-600">
                            Subtotal: ${parseFloat(servicio.subtotal).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Acompañantes */}
              {selectedReserva.acompanantes && selectedReserva.acompanantes.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Acompañantes ({(selectedReserva.acompanantes || []).length})
                  </h3>
                  <div className="grid gap-3">
                    {(selectedReserva.acompanantes || []).map((acompanante, index) => (
                      <div key={acompanante.id || index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium text-gray-900">
                                {acompanante.acompanante.nombre} {acompanante.acompanante.apellido}
                              </h5>
                              {acompanante.es_titular && (
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                  Titular
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>Documento: {acompanante.acompanante.documento}</p>
                              <p>Teléfono: {acompanante.acompanante.telefono}</p>
                              <p>Email: {acompanante.acompanante.email}</p>
                              {acompanante.acompanante.fecha_nacimiento && (
                                <p>Fecha de nacimiento: {acompanante.acompanante.fecha_nacimiento}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notas adicionales */}
              {selectedReserva.notas && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Notas Adicionales</h3>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                    <p className="text-gray-700">{selectedReserva.notas}</p>
                  </div>
                </div>
              )}

              {/* Botones de acción en el modal */}
              <div className="flex gap-3 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={cerrarModal}
                  className="flex-1 md:flex-none"
                >
                  Cerrar
                </Button>
                {(selectedReserva.estado.toUpperCase() === "PAGADA") && (
                  <Button
                    variant="outline"
                    className="flex-1 md:flex-none"
                    onClick={() => {
                      console.log('Modificar reserva:', selectedReserva.id);
                      // Aquí puedes agregar la lógica para modificar la reserva
                    }}
                  >
                    Modificar Reserva
                  </Button>
                )}
                {(selectedReserva.estado.toUpperCase() === "PAGADA" || 
                  selectedReserva.estado.toUpperCase() === "PENDIENTE") && (
                  <Button
                    variant="destructive"
                    className="flex-1 md:flex-none"
                    onClick={() => cancelarReserva(selectedReserva)}
                    disabled={loading}
                  >
                    {loading ? "Cancelando..." : "Cancelar Reserva"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de cancelación */}
      {showCancelConfirm && reservaToCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Cancelar Reserva</h3>
                  <p className="text-sm text-gray-600">Esta acción no se puede deshacer</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-2">
                  ¿Estás seguro de que quieres cancelar la siguiente reserva?
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Reserva #{reservaToCancel.id}</span>
                    <span className="text-lg font-bold text-blue-600">
                      ${parseFloat(reservaToCancel.total).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Servicios: {reservaToCancel.servicios.length} servicio(s)</p>
                    <p>Acompañantes: {reservaToCancel.acompanantes.length} persona(s)</p>
                    <p>Fecha: {formatFecha(reservaToCancel.fecha_inicio)}</p>
                    <p>Estado: {reservaToCancel.estado}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={cerrarConfirmacion}
                  className="flex-1"
                  disabled={loading}
                >
                  No, Mantener
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmarCancelacion}
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? "Cancelando..." : "Sí, Cancelar"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}