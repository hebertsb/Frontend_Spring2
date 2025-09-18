'use client'

import React, { useState, useEffect } from "react";
import { Calendar, User, Filter, Search, Clock, RefreshCw, X, MapPin, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { listarReservas, editarReserva } from "@/api/reservas";
import { useToast } from "@/hooks/use-toast";
import useAuth from "@/hooks/useAuth";

// Tipos para las reservas
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
      const response = await listarReservas();
      
      // La respuesta de axios viene en response.data
      if (response.data && Array.isArray(response.data)) {
        // Filtrar solo las reservas del usuario actual
        // Convertir user.id a número para comparación
        const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
        const reservasUsuario = response.data.filter(
          (reserva: Reserva) => reserva.usuario?.id === userId
        );
        setReservations(reservasUsuario);
      } else {
        setReservations([]);
        toast({
          title: "Información",
          description: "No tienes reservas registradas",
        });
      }
    } catch (error) {
      console.error('Error al cargar reservas:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las reservas",
        variant: "destructive",
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
    const cumpleBusqueda = reserva.detalles.some(detalle => 
      detalle.titulo.toLowerCase().includes(busqueda.toLowerCase())
    );
    return cumpleFiltro && cumpleBusqueda;
  });

  // Funciones helper
  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "confirmada":
      case "confirmado":
        return "border-green-200 bg-green-50 text-green-700";
      case "pendiente":
        return "border-yellow-200 bg-yellow-50 text-yellow-700";
      case "completada":
      case "completado":
        return "border-blue-200 bg-blue-50 text-blue-700";
      case "cancelada":
      case "cancelado":
        return "border-red-200 bg-red-50 text-red-700";
      case "reprogramada":
      case "reprogramado":
        return "border-purple-200 bg-purple-50 text-purple-700";
      default:
        return "border-gray-200 bg-gray-50 text-gray-700";
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

  const calcularDuracion = (detalles: any[]) => {
    if (detalles.length === 0) return "1 día";
    if (detalles.length > 3) return `${detalles.length} días`;
    if (detalles.length > 1) return `${detalles.length} días`;
    return "1 día";
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

      // Preparar datos para cancelar (cambiar estado a cancelada)
      const datosActualizados = {
        estado: "cancelada",
        fecha_inicio: reservaToCancel.fecha_inicio,
        total: reservaToCancel.total,
        notas: reservaToCancel.notas ? `${reservaToCancel.notas}\n\n[CANCELADA] Reserva cancelada por el cliente el ${new Date().toLocaleDateString('es-ES')}.` 
               : `[CANCELADA] Reserva cancelada por el cliente el ${new Date().toLocaleDateString('es-ES')}.`,
        detalles: reservaToCancel.detalles.map(detalle => ({
          titulo: detalle.titulo,
          tipo: detalle.tipo,
          precio_unitario: detalle.precio_unitario,
          cantidad: detalle.cantidad
        }))
      };

      console.log('🔄 Cancelando reserva:', reservaToCancel.id);
      console.log('🔄 Datos de cancelación:', datosActualizados);

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
      
      let mensajeError = "No se pudo cancelar la reserva";
      if (error.response?.data?.detail) {
        mensajeError = error.response.data.detail;
      } else if (error.response?.data?.error) {
        mensajeError = error.response.data.error;
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
        <div className="flex items-center gap-3">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-gray-600">Cargando tus reservas...</span>
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
              <option value="confirmada">Confirmadas</option>
              <option value="pendiente">Pendientes</option>
              <option value="completada">Completadas</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de reservas */}
      <div className="grid gap-6">
        {reservasFiltradas.length > 0 ? (
          reservasFiltradas.map((reserva) => {
            const primerDetalle = reserva.detalles[0];
            const destinoPrincipal = primerDetalle?.titulo || "Destino";
            const totalPersonas = primerDetalle?.cantidad || 1;
            
            return (
              <div key={reserva.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row">
                  {/* Imagen */}
                  <div className="md:w-64 h-48 md:h-auto">
                    <img
                      src={obtenerImagenDestino(destinoPrincipal)}
                      alt={destinoPrincipal}
                      className="w-full h-full object-cover rounded-t-xl md:rounded-l-xl md:rounded-t-none"
                    />
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {destinoPrincipal}
                        </h3>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getEstadoColor(reserva.estado)}`}>
                          {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
                        </div>
                        {reserva.detalles.length > 1 && (
                          <div className="mt-2">
                            <Badge variant="secondary" className="text-xs">
                              +{reserva.detalles.length - 1} actividad{reserva.detalles.length > 2 ? 'es' : ''} más
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="text-right mt-4 md:mt-0">
                        <div className="text-2xl font-bold text-blue-600">
                          ${parseFloat(reserva.total).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">USD</div>
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
                          <div className="text-xs text-gray-500">Duración</div>
                          <div className="text-sm font-medium">{calcularDuracion(reserva.detalles)}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <div>
                          <div className="text-xs text-gray-500">Huéspedes</div>
                          <div className="text-sm font-medium">{totalPersonas} persona{totalPersonas > 1 ? 's' : ''}</div>
                        </div>
                      </div>
                    </div>

                    {/* Fecha de reserva y notas */}
                    <div className="text-xs text-gray-500 mb-4">
                      <div>Reservado el {formatFecha(reserva.created_at)}</div>
                      {reserva.notas && (
                        <div className="mt-1 text-gray-600">
                          <strong>Notas:</strong> {reserva.notas}
                        </div>
                      )}
                    </div>

                    {/* Lista de actividades si hay múltiples */}
                    {reserva.detalles.length > 1 && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Actividades incluidas:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {reserva.detalles.map((detalle, index) => (
                            <li key={index} className="flex justify-between">
                              <span>• {detalle.titulo}</span>
                              <span className="font-medium">${parseFloat(detalle.precio_unitario).toFixed(2)}</span>
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
                      {(reserva.estado.toLowerCase() === "confirmada" || reserva.estado.toLowerCase() === "confirmado") && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => console.log('Modificar reserva:', reserva.id)}
                        >
                          Modificar
                        </Button>
                      )}
                      {(reserva.estado.toLowerCase() === "confirmada" || 
                        reserva.estado.toLowerCase() === "confirmado" || 
                        reserva.estado.toLowerCase() === "pendiente") && (
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
                onClick={() => window.location.href = '/destinos'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Explorar Destinos
              </Button>
              <Button 
                onClick={() => window.location.href = '/paquetes'}
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
                      <span className="font-medium">{selectedReserva.usuario?.username || 'N/A'}</span>
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
                      Total por {selectedReserva.detalles.reduce((sum, detalle) => sum + detalle.cantidad, 0)} persona(s)
                    </div>
                    <div className="text-sm text-gray-600">
                      Duración estimada: {calcularDuracion(selectedReserva.detalles)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detalles de actividades */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Actividades y Destinos
                </h3>
                <div className="grid gap-4">
                  {selectedReserva.detalles.map((detalle, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <img
                              src={obtenerImagenDestino(detalle.titulo)}
                              alt={detalle.titulo}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div>
                              <h4 className="font-semibold text-gray-900">{detalle.titulo}</h4>
                              <p className="text-sm text-gray-600 capitalize">{detalle.tipo}</p>
                              <p className="text-sm text-gray-600">{detalle.cantidad} persona(s)</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            ${parseFloat(detalle.precio_unitario).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">por persona</div>
                          <div className="text-sm font-medium text-blue-600">
                            Subtotal: ${(parseFloat(detalle.precio_unitario) * detalle.cantidad).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

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
                {(selectedReserva.estado.toLowerCase() === "confirmada" || selectedReserva.estado.toLowerCase() === "confirmado") && (
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
                {(selectedReserva.estado.toLowerCase() === "confirmada" || 
                  selectedReserva.estado.toLowerCase() === "confirmado" || 
                  selectedReserva.estado.toLowerCase() === "pendiente") && (
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
                    <p>Destino: {reservaToCancel.detalles[0]?.titulo}</p>
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