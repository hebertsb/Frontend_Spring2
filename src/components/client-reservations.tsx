'use client'

import React, { useState, useEffect, useMemo } from "react";
import { 
  Calendar, 
  User, 
  Filter, 
  Search, 
  Clock, 
  RefreshCw, 
  X, 
  MapPin, 
  DollarSign, 
  Users, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Star,
  Download,
  Printer,
  FileText
} from "lucide-react";
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

interface Notificacion {
  id: string;
  tipo: 'urgente' | 'warning' | 'info' | 'suggestion';
  titulo: string;
  mensaje: string;
  fecha: Date;
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
  
  // Estados para favoritos y valoraciones
  const [favoritos, setFavoritos] = useState<Set<number>>(new Set());
  const [showValoracionModal, setShowValoracionModal] = useState(false);
  const [reservaToValorate, setReservaToValorate] = useState<Reserva | null>(null);
  const [valoracion, setValoracion] = useState(5);
  const [comentario, setComentario] = useState("");
  
  // Estados para notificaciones
  const [notificacionesEliminadas, setNotificacionesEliminadas] = useState<Set<string>>(new Set());
  
  // Estados para reprogramación
  const [showReprogramacionModal, setShowReprogramacionModal] = useState(false);
  const [reservaToReprogram, setReservaToReprogram] = useState<Reserva | null>(null);
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [motivoReprogramacion, setMotivoReprogramacion] = useState("");
  
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
      
      // Debug: Análisis detallado de precios en los primeros 3 registros
      response.data.slice(0, 3).forEach((reserva: any, index: number) => {
        console.log(`\n=== ANÁLISIS PRECIO RESERVA ${index + 1} ===`);
        console.log('ID:', reserva.id);
        console.log('Total (original):', reserva.total, typeof reserva.total);
        console.log('Moneda:', reserva.moneda);
        console.log('Estado:', reserva.estado);
        console.log('Detalles completos:', reserva.detalles);
        if (reserva.detalles && reserva.detalles.length > 0) {
          console.log('Primer detalle - precio_unitario:', reserva.detalles[0].precio_unitario, typeof reserva.detalles[0].precio_unitario);
          console.log('Primer detalle - subtotal:', reserva.detalles[0].subtotal, typeof reserva.detalles[0].subtotal);
        }
        console.log('===============================\n');
      });
      
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
        
        // Debug: Mostrar información de monedas
        if (reservasUsuario.length > 0) {
          console.log('💰 Análisis de monedas en reservas:');
          reservasUsuario.forEach(reserva => {
            console.log(`Reserva #${reserva.id}:`, {
              total: reserva.total,
              moneda: reserva.moneda,
              estado: reserva.estado,
              totalFormateado: formatearMoneda(reserva.total, reserva.moneda)
            });
          });
        }
        
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

  // Función helper para formatear moneda correctamente
  const formatearMoneda = (monto: string | number, moneda: string = 'USD') => {
    console.log('🔥 formatearMoneda EJECUTÁNDOSE:', { monto, moneda });
    
    const valor = typeof monto === 'string' ? parseFloat(monto) : monto;
    const simbolo = moneda === 'USD' ? '$' : 'Bs. ';
    
    // Debug logging para entender el problema de precios
    console.log('🔍 formatearMoneda DEBUG:', {
      monto_original: monto,
      tipo_monto: typeof monto,
      valor_parseado: valor,
      moneda,
      simbolo,
      resultado: `${simbolo}${valor.toFixed(2)}`
    });
    
    // Validación de NaN
    if (isNaN(valor)) {
      console.error('❌ formatearMoneda: Valor inválido detectado:', { monto, valor });
      return `${simbolo}0.00`;
    }
    
    const resultado = `${simbolo}${valor.toFixed(2)}`;
    console.log('✅ formatearMoneda resultado final:', resultado);
    
    return resultado;
  };

  // Función helper para obtener símbolo de moneda
  const obtenerSimboloMoneda = (moneda: string = 'USD') => {
    return moneda === 'USD' ? '$' : 'Bs. ';
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

  // Calcular estadísticas del cliente usando useMemo para optimización
  const estadisticasCliente = useMemo(() => {
    const totalReservas = reservations.length;
    
    const reservasPagadas = reservations.filter(r => r.estado.toUpperCase() === 'PAGADA');
    const reservasPendientes = reservations.filter(r => r.estado.toUpperCase() === 'PENDIENTE');
    const reservasCanceladas = reservations.filter(r => r.estado.toUpperCase() === 'CANCELADA');
    
    // Calcular gasto total (solo reservas pagadas) - separar por moneda
    const gastosPorMoneda = reservasPagadas.reduce((acumulador, reserva) => {
      const moneda = reserva.moneda || 'USD';
      const monto = parseFloat(reserva.total || '0');
      
      if (!acumulador[moneda]) {
        acumulador[moneda] = 0;
      }
      acumulador[moneda] += monto;
      
      return acumulador;
    }, {} as Record<string, number>);

    // Determinar moneda principal (la que más se usa)
    const monedaPrincipal = Object.keys(gastosPorMoneda).length > 0 
      ? Object.entries(gastosPorMoneda).sort(([,a], [,b]) => b - a)[0][0] 
      : 'USD';
    
    // Gasto total en la moneda principal
    const gastoTotal = gastosPorMoneda[monedaPrincipal] || 0;

    // Calcular próximo viaje
    const reservasActivas = reservations.filter(r => 
      ['PAGADA', 'PENDIENTE'].includes(r.estado.toUpperCase())
    );
    const proximoViaje = reservasActivas
      .filter(r => new Date(r.fecha_inicio) > new Date())
      .sort((a, b) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime())[0];

    // Servicios más frecuentes
    const serviciosContador: Record<string, number> = {};
    reservations.forEach(reserva => {
      reserva.servicios?.forEach(servicio => {
        serviciosContador[servicio.nombre_servicio] = (serviciosContador[servicio.nombre_servicio] || 0) + 1;
      });
    });
    
    const servicioFavorito = Object.entries(serviciosContador)
      .sort(([,a], [,b]) => b - a)[0];

    // Total de personas viajadas
    const totalPersonas = reservasPagadas.reduce((total, reserva) => {
      return total + (reserva.acompanantes?.length || 0);
    }, 0);

    return {
      totalReservas,
      reservasPagadas: reservasPagadas.length,
      reservasPendientes: reservasPendientes.length,
      reservasCanceladas: reservasCanceladas.length,
      gastoTotal,
      proximoViaje,
      servicioFavorito: servicioFavorito ? servicioFavorito[0] : null,
      totalPersonas,
      monedaPrincipal,
      gastosPorMoneda // Agregar información de gastos por moneda
    };
  }, [reservations]);

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

  // Función para exportar reservas como texto estructurado
  const exportarReservas = () => {
    const fechaExporte = new Date().toLocaleDateString('es-ES');
    let contenido = `RESUMEN DE RESERVAS - ${user?.nombres || 'Cliente'}\n`;
    contenido += `Fecha de exportación: ${fechaExporte}\n`;
    contenido += `==============================================\n\n`;

    // Agregar estadísticas
    contenido += `ESTADÍSTICAS:\n`;
    contenido += `• Total de reservas: ${estadisticasCliente.totalReservas}\n`;
    contenido += `• Reservas pagadas: ${estadisticasCliente.reservasPagadas}\n`;
    contenido += `• Gasto total: ${estadisticasCliente.monedaPrincipal === 'USD' ? '$' : 'Bs. '}${estadisticasCliente.gastoTotal.toFixed(2)}\n`;
    contenido += `• Personas viajadas: ${estadisticasCliente.totalPersonas}\n\n`;

    reservasFiltradas.forEach((reserva, index) => {
      const titular = reserva.acompanantes?.find(ra => ra.es_titular);
      const nombreTitular = titular ? `${titular.acompanante.nombre} ${titular.acompanante.apellido}` : 'N/A';
      
      contenido += `${index + 1}. RESERVA #${reserva.id}\n`;
      contenido += `   Estado: ${getEstadoTexto(reserva.estado)}\n`;
      contenido += `   Titular: ${nombreTitular}\n`;
      contenido += `   Fecha de viaje: ${formatFecha(reserva.fecha_inicio)}\n`;
      contenido += `   Total: ${reserva.moneda === 'USD' ? '$' : 'Bs. '}${parseFloat(reserva.total).toFixed(2)}\n`;
      contenido += `   Servicios: ${reserva.servicios?.length || 0}\n`;
      contenido += `   Acompañantes: ${reserva.acompanantes?.length || 0}\n`;
      
      if (reserva.servicios && reserva.servicios.length > 0) {
        contenido += `   Detalles de servicios:\n`;
        reserva.servicios.forEach(servicio => {
          contenido += `     • ${servicio.nombre_servicio} (${servicio.tipo_servicio}) - ${reserva.moneda === 'USD' ? '$' : 'Bs. '}${parseFloat(servicio.precio_unitario).toFixed(2)}\n`;
        });
      }
      contenido += `\n`;
    });

    // Crear y descargar archivo
    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `mis-reservas-${fechaExporte.replace(/\//g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: "Exportación Completa",
      description: "Tus reservas han sido exportadas exitosamente",
    });
  };

  // Función para imprimir reservas
  const imprimirReservas = () => {
    const fechaImpresion = new Date().toLocaleDateString('es-ES');
    
    const ventanaImpresion = window.open('', '_blank');
    if (!ventanaImpresion) {
      toast({
        title: "Error",
        description: "No se pudo abrir la ventana de impresión. Verifique que los pop-ups estén habilitados.",
        variant: "destructive",
      });
      return;
    }

    let contenidoHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Mis Reservas - ${user?.nombres || 'Cliente'}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .stats { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
          .reserva { border: 1px solid #ddd; margin-bottom: 15px; padding: 15px; border-radius: 5px; }
          .reserva-header { background: #e9ecef; padding: 10px; margin: -15px -15px 10px -15px; border-radius: 5px 5px 0 0; }
          .estado-pagada { color: #28a745; font-weight: bold; }
          .estado-pendiente { color: #ffc107; font-weight: bold; }
          .estado-cancelada { color: #dc3545; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>RESUMEN DE RESERVAS</h1>
          <h2>${user?.nombres || 'Cliente'} ${user?.apellidos || ''}</h2>
          <p>Fecha de impresión: ${fechaImpresion}</p>
        </div>
        
        <div class="stats">
          <h3>Estadísticas</h3>
          <p><strong>Total de reservas:</strong> ${estadisticasCliente.totalReservas}</p>
          <p><strong>Reservas pagadas:</strong> ${estadisticasCliente.reservasPagadas}</p>
          <p><strong>Gasto total:</strong> ${estadisticasCliente.monedaPrincipal === 'USD' ? '$' : 'Bs. '}${estadisticasCliente.gastoTotal.toFixed(2)}</p>
          <p><strong>Personas viajadas:</strong> ${estadisticasCliente.totalPersonas}</p>
        </div>
    `;

    reservasFiltradas.forEach((reserva) => {
      const titular = reserva.acompanantes?.find(ra => ra.es_titular);
      const nombreTitular = titular ? `${titular.acompanante.nombre} ${titular.acompanante.apellido}` : 'N/A';
      const estadoClass = `estado-${reserva.estado.toLowerCase()}`;
      
      contenidoHTML += `
        <div class="reserva">
          <div class="reserva-header">
            <h3>Reserva #${reserva.id}</h3>
          </div>
          <p><strong>Estado:</strong> <span class="${estadoClass}">${getEstadoTexto(reserva.estado)}</span></p>
          <p><strong>Titular:</strong> ${nombreTitular}</p>
          <p><strong>Fecha de viaje:</strong> ${formatFecha(reserva.fecha_inicio)}</p>
          <p><strong>Total:</strong> ${reserva.moneda === 'USD' ? '$' : 'Bs. '}${parseFloat(reserva.total).toFixed(2)}</p>
          <p><strong>Servicios:</strong> ${reserva.servicios?.length || 0}</p>
          <p><strong>Acompañantes:</strong> ${reserva.acompanantes?.length || 0}</p>
          
          ${reserva.servicios && reserva.servicios.length > 0 ? `
            <h4>Servicios incluidos:</h4>
            <ul>
              ${reserva.servicios.map(servicio => `
                <li>${servicio.nombre_servicio} (${servicio.tipo_servicio}) - ${reserva.moneda === 'USD' ? '$' : 'Bs. '}${parseFloat(servicio.precio_unitario).toFixed(2)}</li>
              `).join('')}
            </ul>
          ` : ''}
        </div>
      `;
    });

    contenidoHTML += `
        <div class="footer">
          <p>Este documento fue generado automáticamente desde el panel de cliente</p>
        </div>
      </body>
      </html>
    `;

    ventanaImpresion.document.write(contenidoHTML);
    ventanaImpresion.document.close();
    ventanaImpresion.focus();
    
    setTimeout(() => {
      ventanaImpresion.print();
    }, 500);

    toast({
      title: "Preparando Impresión",
      description: "Se ha abierto la ventana de impresión",
    });
  };

  // Función para manejar favoritos
  const toggleFavorito = (reservaId: number) => {
    const nuevosFavoritos = new Set(favoritos);
    if (nuevosFavoritos.has(reservaId)) {
      nuevosFavoritos.delete(reservaId);
      toast({
        title: "Removido de Favoritos",
        description: "La reserva ha sido removida de tus favoritos",
      });
    } else {
      nuevosFavoritos.add(reservaId);
      toast({
        title: "Agregado a Favoritos",
        description: "La reserva ha sido agregada a tus favoritos",
      });
    }
    setFavoritos(nuevosFavoritos);
    
    // Aquí puedes agregar lógica para persistir en localStorage o backend
    localStorage.setItem('favoritos-reservas', JSON.stringify(Array.from(nuevosFavoritos)));
  };

  // Función para abrir modal de valoración
  const abrirValoracion = (reserva: Reserva) => {
    setReservaToValorate(reserva);
    setShowValoracionModal(true);
    setValoracion(5);
    setComentario("");
  };

  // Función para enviar valoración
  const enviarValoracion = () => {
    if (!reservaToValorate) return;

    // Simular envío de valoración (aquí conectarías con el backend)
    toast({
      title: "¡Valoración Enviada!",
      description: `Gracias por valorar tu experiencia en la Reserva #${reservaToValorate.id}`,
    });

    // Cerrar modal
    setShowValoracionModal(false);
    setReservaToValorate(null);
    setValoracion(5);
    setComentario("");
  };

  // Función para abrir modal de reprogramación
  const abrirReprogramacion = (reserva: Reserva) => {
    setReservaToReprogram(reserva);
    setShowReprogramacionModal(true);
    setNuevaFecha("");
    setMotivoReprogramacion("");
  };

  // Función para confirmar reprogramación
  const confirmarReprogramacion = async () => {
    if (!reservaToReprogram || !nuevaFecha) {
      toast({
        title: "Error",
        description: "Por favor selecciona una nueva fecha",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Preparar datos para reprogramación
      const datosReprogramacion = {
        estado: "REPROGRAMADA",
        fecha_inicio: nuevaFecha,
        fecha_original: reservaToReprogram.fecha_original || reservaToReprogram.fecha_inicio,
        fecha_reprogramacion: nuevaFecha,
        motivo_reprogramacion: motivoReprogramacion || "Reprogramación solicitada por el cliente",
        numero_reprogramaciones: (reservaToReprogram.numero_reprogramaciones || 0) + 1,
        reprogramado_por: user?.id,
        total: reservaToReprogram.total,
        servicios: reservaToReprogram.servicios,
        usuario: reservaToReprogram.usuario || user?.id,
        notas: reservaToReprogram.notas 
          ? `${reservaToReprogram.notas}\n\n[REPROGRAMADA] Fecha cambiada de ${formatFecha(reservaToReprogram.fecha_inicio)} a ${formatFecha(nuevaFecha)} el ${new Date().toLocaleDateString('es-ES')}. Motivo: ${motivoReprogramacion || "Solicitud del cliente"}.`
          : `[REPROGRAMADA] Fecha cambiada de ${formatFecha(reservaToReprogram.fecha_inicio)} a ${formatFecha(nuevaFecha)} el ${new Date().toLocaleDateString('es-ES')}. Motivo: ${motivoReprogramacion || "Solicitud del cliente"}.`,
        created_at: reservaToReprogram.created_at
      };

      console.log('🔄 Reprogramando reserva:', reservaToReprogram.id);
      console.log('🔄 Datos de reprogramación:', datosReprogramacion);

      const response = await editarReserva(reservaToReprogram.id.toString(), datosReprogramacion);

      if (response.status === 200) {
        toast({
          title: "Reserva Reprogramada",
          description: `La reserva #${reservaToReprogram.id} ha sido reprogramada para el ${formatFecha(nuevaFecha)}`,
        });

        // Recargar las reservas
        await cargarReservas();

        // Cerrar modal
        setShowReprogramacionModal(false);
        setReservaToReprogram(null);
        setNuevaFecha("");
        setMotivoReprogramacion("");
      }
    } catch (error: any) {
      console.error('❌ Error al reprogramar reserva:', error);
      
      let mensajeError = "No se pudo reprogramar la reserva";
      if (error.response?.data?.detail) {
        mensajeError = error.response.data.detail;
      } else if (error.response?.data?.error) {
        mensajeError = error.response.data.error;
      } else if (error.message) {
        mensajeError = error.message;
      }

      toast({
        title: "Error al Reprogramar",
        description: mensajeError,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Cargar favoritos desde localStorage
  useEffect(() => {
    const favoritosGuardados = localStorage.getItem('favoritos-reservas');
    if (favoritosGuardados) {
      setFavoritos(new Set(JSON.parse(favoritosGuardados)));
    }
  }, []);

  // Calcular notificaciones y recordatorios
  const notificaciones = useMemo(() => {
    const hoy = new Date();
    const en7Dias = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000);
    const en30Dias = new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000);

    const notificacionesList: Notificacion[] = [];

    // Verificar viajes próximos
    reservations.forEach(reserva => {
      if (reserva.estado.toUpperCase() === 'PAGADA') {
        const fechaViaje = new Date(reserva.fecha_inicio);
        
        if (fechaViaje <= en7Dias && fechaViaje > hoy) {
          notificacionesList.push({
            id: `viaje-${reserva.id}`,
            tipo: 'urgente',
            titulo: '¡Viaje próximo!',
            mensaje: `Tu viaje de la Reserva #${reserva.id} es el ${formatFecha(reserva.fecha_inicio)}`,
            fecha: fechaViaje
          });
        } else if (fechaViaje <= en30Dias && fechaViaje > en7Dias) {
          notificacionesList.push({
            id: `viaje-${reserva.id}`,
            tipo: 'info',
            titulo: 'Viaje en 30 días',
            mensaje: `Prepárate para tu viaje de la Reserva #${reserva.id} el ${formatFecha(reserva.fecha_inicio)}`,
            fecha: fechaViaje
          });
        }
      }

      // Verificar reservas pendientes de pago
      if (reserva.estado.toUpperCase() === 'PENDIENTE') {
        notificacionesList.push({
          id: `pago-${reserva.id}`,
          tipo: 'warning',
          titulo: 'Pago pendiente',
          mensaje: `La Reserva #${reserva.id} tiene pago pendiente por ${reserva.moneda === 'USD' ? '$' : 'Bs. '}${parseFloat(reserva.total).toFixed(2)}`,
          fecha: new Date(reserva.created_at)
        });
      }

      // Sugerir valoraciones para viajes completados sin valorar
      if (reserva.estado.toUpperCase() === 'PAGADA' && new Date(reserva.fecha_inicio) < hoy) {
        const diasDesdeViaje = Math.floor((hoy.getTime() - new Date(reserva.fecha_inicio).getTime()) / (1000 * 60 * 60 * 24));
        if (diasDesdeViaje <= 30) {
          notificacionesList.push({
            id: `valoracion-${reserva.id}`,
            tipo: 'suggestion',
            titulo: '¿Cómo fue tu viaje?',
            mensaje: `Comparte tu experiencia de la Reserva #${reserva.id}`,
            fecha: new Date(reserva.fecha_inicio)
          });
        }
      }
    });

    return notificacionesList.sort((a, b) => {
      if (a.tipo === 'urgente' && b.tipo !== 'urgente') return -1;
      if (b.tipo === 'urgente' && a.tipo !== 'urgente') return 1;
      return b.fecha.getTime() - a.fecha.getTime();
    }).slice(0, 5); // Mostrar máximo 5 notificaciones
  }, [reservations]);

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

      {/* Panel de notificaciones */}
      {notificaciones.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            Notificaciones
          </h2>
          <div className="grid gap-3">
            {notificaciones.map((notificacion) => (
              <div
                key={notificacion.id}
                className={`p-4 rounded-lg border-l-4 ${
                  notificacion.tipo === 'urgente'
                    ? 'bg-red-50 border-red-400 text-red-800'
                    : notificacion.tipo === 'warning'
                    ? 'bg-yellow-50 border-yellow-400 text-yellow-800'
                    : notificacion.tipo === 'info'
                    ? 'bg-blue-50 border-blue-400 text-blue-800'
                    : 'bg-green-50 border-green-400 text-green-800'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{notificacion.titulo}</h4>
                    <p className="text-sm mt-1">{notificacion.mensaje}</p>
                  </div>
                  <button
                    className="text-gray-400 hover:text-gray-600 ml-4"
                    onClick={() => {
                      // Aquí puedes agregar lógica para ocultar la notificación
                      console.log('Ocultar notificación:', notificacion.id);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Panel de estadísticas del cliente */}
      {reservations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total de Reservas */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Reservas</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticasCliente.totalReservas}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {estadisticasCliente.reservasPagadas} pagadas
                  </span>
                  {estadisticasCliente.reservasPendientes > 0 && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      {estadisticasCliente.reservasPendientes} pendientes
                    </span>
                  )}
                </div>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          {/* Gasto Total */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-600 text-sm font-medium">Gasto Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {estadisticasCliente.monedaPrincipal === 'USD' ? '$' : 'Bs. '}
                  {estadisticasCliente.gastoTotal.toFixed(2)}
                </p>
                {/* Mostrar desglose si hay múltiples monedas */}
                {Object.keys(estadisticasCliente.gastosPorMoneda || {}).length > 1 && (
                  <div className="mt-2 space-y-1">
                    {Object.entries(estadisticasCliente.gastosPorMoneda || {}).map(([moneda, monto]) => (
                      <p key={moneda} className="text-xs text-gray-500">
                        {moneda === 'USD' ? '$' : 'Bs. '}{monto.toFixed(2)} {moneda}
                      </p>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  En reservas completadas
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>

          {/* Próximo Viaje */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Próximo Viaje</p>
                {estadisticasCliente.proximoViaje ? (
                  <>
                    <p className="text-lg font-bold text-gray-900">
                      {formatFecha(estadisticasCliente.proximoViaje.fecha_inicio).split(' ').slice(0, 2).join(' ')}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Reserva #{estadisticasCliente.proximoViaje.id}
                    </p>
                  </>
                ) : (
                  <p className="text-lg text-gray-500">Sin viajes próximos</p>
                )}
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          {/* Personas Viajadas */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Personas Viajadas</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticasCliente.totalPersonas}</p>
                {estadisticasCliente.servicioFavorito && (
                  <p className="text-xs text-gray-500 mt-2">
                    Favorito: {estadisticasCliente.servicioFavorito}
                  </p>
                )}
              </div>
              <Users className="w-8 h-8 text-indigo-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
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

          {/* Botones de exportar e imprimir */}
          {reservasFiltradas.length > 0 && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={exportarReservas}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={imprimirReservas}
                className="flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </Button>
            </div>
          )}
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
                          {formatearMoneda(reserva.total, reserva.moneda)}
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
                    <div className="flex flex-wrap gap-3">
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => verDetallesReserva(reserva)}
                      >
                        Ver Detalles
                      </Button>
                      
                      {/* Botón de favorito */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleFavorito(reserva.id)}
                        className={`flex items-center gap-2 ${
                          favoritos.has(reserva.id) 
                            ? 'border-yellow-300 text-yellow-700 bg-yellow-50' 
                            : 'border-gray-300 text-gray-700'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${favoritos.has(reserva.id) ? 'fill-current' : ''}`} />
                        {favoritos.has(reserva.id) ? 'Favorito' : 'Favorito'}
                      </Button>

                      {/* Botón de valoración (solo para reservas completadas) */}
                      {reserva.estado.toUpperCase() === "PAGADA" && 
                       new Date(reserva.fecha_inicio) < new Date() && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => abrirValoracion(reserva)}
                          className="flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-50"
                        >
                          <Star className="w-4 h-4" />
                          Valorar
                        </Button>
                      )}

                      {reserva.estado.toUpperCase() === "PAGADA" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => console.log('Modificar reserva:', reserva.id)}
                        >
                          Modificar
                        </Button>
                      )}

                      {/* Botón de reprogramar (solo para reservas pagadas o pendientes) */}
                      {(reserva.estado.toUpperCase() === "PAGADA" || 
                        reserva.estado.toUpperCase() === "PENDIENTE") && 
                       new Date(reserva.fecha_inicio) > new Date() && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => abrirReprogramacion(reserva)}
                          className="flex items-center gap-2 border-purple-300 text-purple-700 hover:bg-purple-50"
                        >
                          <Calendar className="w-4 h-4" />
                          Reprogramar
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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
                      <span>
                        {formatearMoneda(selectedReserva.total, selectedReserva.moneda)} {selectedReserva.moneda}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Total acompañantes: {(selectedReserva.acompanantes || []).length} persona(s)
                    </div>
                    <div className="text-sm text-gray-600">
                      Servicios contratados: {(selectedReserva.servicios || []).length} servicio(s)
                    </div>
                  </div>
                </div>

                {/* Nueva sección de información de contacto y documentos */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Información Importante
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Documentos Requeridos:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Documento de identidad válido</li>
                        <li>• Comprobante de vacunación (si aplica)</li>
                        <li>• Seguro de viaje recomendado</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Contacto de Emergencia:</p>
                      <div className="text-sm text-gray-600">
                        <p>📞 +591 70000000</p>
                        <p>📧 emergencias@turismo.bo</p>
                        <p>🕒 Disponible 24/7</p>
                      </div>
                    </div>
                    <div className="mt-3 p-2 bg-yellow-100 rounded border-l-4 border-yellow-400">
                      <p className="text-xs text-yellow-800">
                        <strong>Recordatorio:</strong> Llevar documentos originales el día del viaje
                      </p>
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

              {/* Timeline de historial de cambios */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Historial de la Reserva
                </h3>
                <div className="space-y-4">
                  {/* Creación de la reserva */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                        <span className="font-medium text-gray-900">Reserva Creada</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatFecha(selectedReserva.created_at)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Reserva inicial por {selectedReserva.moneda === 'USD' ? '$' : 'Bs. '}{parseFloat(selectedReserva.total).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Estado actual */}
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                      selectedReserva.estado.toUpperCase() === 'PAGADA' ? 'bg-green-500' :
                      selectedReserva.estado.toUpperCase() === 'PENDIENTE' ? 'bg-yellow-500' :
                      selectedReserva.estado.toUpperCase() === 'CANCELADA' ? 'bg-red-500' :
                      'bg-purple-500'
                    }`}></div>
                    <div>
                      <div className="flex items-center gap-2">
                        {selectedReserva.estado.toUpperCase() === 'PAGADA' && <CheckCircle className="w-4 h-4 text-green-500" />}
                        {selectedReserva.estado.toUpperCase() === 'PENDIENTE' && <Clock className="w-4 h-4 text-yellow-500" />}
                        {selectedReserva.estado.toUpperCase() === 'CANCELADA' && <X className="w-4 h-4 text-red-500" />}
                        {selectedReserva.estado.toUpperCase() === 'REPROGRAMADA' && <Calendar className="w-4 h-4 text-purple-500" />}
                        <span className="font-medium text-gray-900">
                          Estado: {getEstadoTexto(selectedReserva.estado)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Fecha del viaje: {formatFecha(selectedReserva.fecha_inicio)}
                      </p>
                      {selectedReserva.numero_reprogramaciones > 0 && (
                        <p className="text-xs text-purple-600 mt-1">
                          Reprogramada {selectedReserva.numero_reprogramaciones} vez(es)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Información de reprogramación si existe */}
                  {selectedReserva.fecha_original && selectedReserva.fecha_reprogramacion && (
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-purple-500" />
                          <span className="font-medium text-gray-900">Reprogramación</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          De {formatFecha(selectedReserva.fecha_original)} a {formatFecha(selectedReserva.fecha_reprogramacion)}
                        </p>
                        {selectedReserva.motivo_reprogramacion && (
                          <p className="text-xs text-gray-500 mt-1">
                            Motivo: {selectedReserva.motivo_reprogramacion}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Estado futuro (si aplica) */}
                  {selectedReserva.estado.toUpperCase() === 'PAGADA' && 
                   new Date(selectedReserva.fecha_inicio) > new Date() && (
                    <div className="flex items-start gap-4 opacity-60">
                      <div className="flex-shrink-0 w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-700">Viaje Programado</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatFecha(selectedReserva.fecha_inicio)} - Esperando fecha del viaje
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

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

      {/* Modal de reprogramación */}
      {showReprogramacionModal && reservaToReprogram && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Reprogramar Reserva
              </h3>
              <p className="text-gray-600 mb-4">
                Reprogramar la Reserva #{reservaToReprogram.id}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Fecha actual: {formatFecha(reservaToReprogram.fecha_inicio)}
              </p>

              {/* Nueva fecha */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nueva fecha de viaje *
                </label>
                <input
                  type="date"
                  value={nuevaFecha}
                  onChange={(e) => setNuevaFecha(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Motivo */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo de la reprogramación (opcional)
                </label>
                <textarea
                  value={motivoReprogramacion}
                  onChange={(e) => setMotivoReprogramacion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Ej: Cambio en el itinerario, emergencia familiar, etc."
                />
              </div>

              {/* Información adicional */}
              <div className="mb-6 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Importante:</strong> La reprogramación puede estar sujeta a disponibilidad 
                      y políticas del proveedor. Se mantendrán los mismos servicios contratados.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowReprogramacionModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmarReprogramacion}
                  disabled={!nuevaFecha || loading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? "Reprogramando..." : "Confirmar"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de valoración */}
      {showValoracionModal && reservaToValorate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Valorar tu Experiencia
              </h3>
              <p className="text-gray-600 mb-4">
                ¿Cómo fue tu experiencia en la Reserva #{reservaToValorate.id}?
              </p>

              {/* Selector de estrellas */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calificación (1-5 estrellas)
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setValoracion(star)}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= valoracion
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {valoracion === 1 && "Muy malo"}
                  {valoracion === 2 && "Malo"}
                  {valoracion === 3 && "Regular"}
                  {valoracion === 4 && "Bueno"}
                  {valoracion === 5 && "Excelente"}
                </p>
              </div>

              {/* Comentario */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comentario (opcional)
                </label>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Cuéntanos sobre tu experiencia..."
                />
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowValoracionModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={enviarValoracion}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Enviar Valoración
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