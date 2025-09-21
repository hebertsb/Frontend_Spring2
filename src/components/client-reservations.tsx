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
  moneda?: string;
  acompanantes?: any[];
  created_at: string;
}

export default function ClientReservations() {
  const [reservations, setReservations] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false); // nuevo
  const [filtro, setFiltro] = useState("todas");
  const [busqueda, setBusqueda] = useState("");
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [reservaToCancel, setReservaToCancel] = useState<Reserva | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [numeroTarjeta, setNumeroTarjeta] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [cvv, setCvv] = useState("");
  const [guardarTarjeta, setGuardarTarjeta] = useState(false);

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

  // Helpers de tarjeta
  const onlyDigits = (s: string) => s.replace(/\D/g, "");
  const validarTarjeta = (): { ok: boolean; mensaje?: string } => {
    const num = onlyDigits(numeroTarjeta);
    if (num.length !== 16) return { ok: false, mensaje: "El número de tarjeta debe tener 16 dígitos" };

    // Fecha MM/AA
    const mmYY = fechaVencimiento.replace(/\s/g, "");
    if (!/^\d{2}\/\d{2}$/.test(mmYY)) return { ok: false, mensaje: "Formato de fecha debe ser MM/AA" };

    const [mmStr, yyStr] = mmYY.split("/");
    const mm = parseInt(mmStr, 10);
    const yy = parseInt(yyStr, 10);
    if (mm < 1 || mm > 12) return { ok: false, mensaje: "Mes inválido" };

    // año actual (2 dígitos)
    const now = new Date();
    const currentYY = parseInt(now.getFullYear().toString().slice(-2), 10);
    const currentMM = now.getMonth() + 1;
    if (yy < currentYY || (yy === currentYY && mm < currentMM)) return { ok: false, mensaje: "Tarjeta vencida" };

    // CVV
    if (!/^\d{3,4}$/.test(cvv)) return { ok: false, mensaje: "CVV inválido" };

    return { ok: true };
  };

  const maskCard = (num: string) => {
    const digits = onlyDigits(num);
    const last4 = digits.slice(-4);
    return `**** **** **** ${last4}`;
  };

  const saveCardLocal = (cardToken: string, cardNumber: string) => {
    try {
      const existing = JSON.parse(localStorage.getItem("saved_cards") || "[]");
      const toSave = {
        token: cardToken,
        masked: maskCard(cardNumber),
        saved_at: new Date().toISOString(),
        userId: user?.id ?? null,
      };
      existing.push(toSave);
      localStorage.setItem("saved_cards", JSON.stringify(existing));
    } catch (e) {
      console.warn("No se pudo guardar tarjeta localmente:", e);
    }
  };

  // Función para abrir el modal de detalles
  const verDetallesReserva = (reserva: Reserva) => {
    setSelectedReserva(reserva);
    setShowModal(true);
    // reset campos de pago (opc)
    setNumeroTarjeta("");
    setFechaVencimiento("");
    setCvv("");
    setGuardarTarjeta(false);
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

  // Función principal del pago (simulada)
  const handlePayNow = async () => {
    if (!selectedReserva) return;

    // Validación
    const v = validarTarjeta();
    if (!v.ok) {
      toast({
        title: "Datos inválidos",
        description: v.mensaje || "Revisa los datos de la tarjeta",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessingPayment(true);

      // Simular tokenización en gateway
      await new Promise((r) => setTimeout(r, 800));
      const fakeToken = "tok_" + Math.random().toString(36).substring(2, 12);

      // Si el usuario quiere guardar la tarjeta, lo guardamos localmente (simulado)
      if (guardarTarjeta) {
        saveCardLocal(fakeToken, numeroTarjeta);
      }

      // Simular cobro en pasarela
      await new Promise((r) => setTimeout(r, 900));

      // Actualizar estado de la reserva en backend (ej: confirmada)
      // Solo enviamos el campo que el backend espera (según tu API)
      const response = await editarReserva(selectedReserva.id.toString(), {
        estado: "confirmada", // cambia según tu flujo si quieres 'pagada' u otro
      });

      if (response.status === 200) {
        toast({
          title: "Pago exitoso",
          description: `Tu reserva #${selectedReserva.id} fue pagada con tarjeta terminada en ${numeroTarjeta.slice(-4)}.`,
        });

        // limpiar campos
        setNumeroTarjeta("");
        setFechaVencimiento("");
        setCvv("");
        setGuardarTarjeta(false);

        // Recargar reservas y cerrar modal
        await cargarReservas();
        cerrarModal();
      } else {
        console.error("Respuesta inesperada al actualizar reserva:", response);
        toast({
          title: "Error",
          description: "No se pudo actualizar la reserva después del pago",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("❌ Error en flujo de pago:", error);
      toast({
        title: "Error de pago",
        description: error?.response?.data?.detail || "Ocurrió un error al procesar el pago",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(false);
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
                        Checkout
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
              <h2 className="text-2xl font-bold text-gray-900">Checkout de la Reserva</h2>
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
              <h3 className="text-xl font-bold mb-4">Confirmación de la Reserva</h3>

              {/* Información general */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="text-lg font-semibold mb-2">Información General</h4>
                <p><strong>ID:</strong> #{selectedReserva.id}</p>
                <p><strong>Estado:</strong> {selectedReserva.estado}</p>
                <p><strong>Fecha de viaje:</strong> {formatFecha(selectedReserva.fecha_inicio)}</p>
                <p><strong>Reservado el:</strong> {formatFecha(selectedReserva.created_at)}</p>
                <p><strong>Usuario:</strong> {selectedReserva.usuario?.username || "N/A"}</p>
              </div>

              {/* Acompañantes */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="text-lg font-semibold mb-2">Acompañantes</h4>
                {selectedReserva.acompanantes && selectedReserva.acompanantes.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedReserva.acompanantes.map((a, index) => (
                      <li key={index}>
                        {a.nombre} {a.apellido} ({a.documento})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600 italic">No hay acompañantes registrados</p>
                )}
              </div>

              {/* Detalles y costos */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h4 className="text-lg font-semibold mb-2">Resumen de Costos</h4>
                {selectedReserva.detalles.map((detalle, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{detalle.titulo} x {detalle.cantidad}</span>
                    <span>${(parseFloat(detalle.precio_unitario) * detalle.cantidad).toFixed(2)}</span>
                  </div>
                ))}
                <div className="mt-3 font-bold text-lg text-blue-700 flex justify-between">
                  <span>Total:</span>
                  <span>${parseFloat(selectedReserva.total).toFixed(2)} {selectedReserva.moneda}</span>
                </div>
              </div>

              {/* Formulario de pago */}
              <div className="bg-white border p-4 rounded-lg shadow-sm mb-6">
                <h4 className="text-lg font-semibold mb-3">Método de Pago</h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de tarjeta
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      value={numeroTarjeta}
                      onChange={(e) =>
                        setNumeroTarjeta(
                          e.target.value
                            .replace(/\D/g, "")
                            .replace(/(.{4})/g, "$1 ")
                            .trim()
                        )
                      }
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de vencimiento
                      </label>
                      <input
                        type="text"
                        placeholder="MM/AA"
                        maxLength={5}
                        value={fechaVencimiento}
                        onChange={(e) =>
                          setFechaVencimiento(
                            e.target.value
                              .replace(/\D/g, "")
                              .replace(/(\d{2})(\d{1,2})/, "$1/$2")
                              .substring(0, 5)
                          )
                        }
                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="password"
                        placeholder="123"
                        maxLength={4}
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="guardarTarjeta"
                      checked={guardarTarjeta}
                      onChange={(e) => setGuardarTarjeta(e.target.checked)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <label htmlFor="guardarTarjeta" className="text-sm text-gray-700">
                      Guardar tarjeta para futuras compras
                    </label>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={cerrarModal}>Cerrar</Button>

                <Button
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  onClick={handlePayNow}
                  disabled={processingPayment}
                >
                  {processingPayment ? "Procesando pago..." : "Pagar ahora"}
                </Button>

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
