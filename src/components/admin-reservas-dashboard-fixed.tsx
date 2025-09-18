import React from "react";
import { Calendar, Edit, Trash2, Eye, EyeOff, MapPin, Users, Star, CheckCircle, X, User, Phone, Mail, Clock, DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';
import { listarReservas, crearReserva, editarReserva, eliminarReserva } from "@/api/reservas";
import { useToast } from "@/hooks/use-toast";
import useAuth from "@/hooks/useAuth";

// Estados de reserva - Solo los 4 estados que acepta el backend
const ESTADO_MAP: Record<string, string> = {
  "pendiente": "PENDIENTE",
  "cancelada": "CANCELADA",
  "pagada": "PAGADA",
  "reprogramada": "REPROGRAMADA"
};

interface Reserva {
  id: string;
  cliente?: string;
  clienteEmail?: string;
  destino?: string;
  paquete?: string;
  fecha: string;
  estado: string;
  precio?: number;
  precioUnitario?: number;
  telefono?: string;
  numeroPersonas?: number;
  tipoServicio?: string;
  // Campos originales del backend
  usuario?: any;
  fecha_inicio?: string;
  total?: string;
  detalles?: any[];
  acompanantes?: any[];
}

const estados = ["pendiente", "pagada", "cancelada", "reprogramada"];

const AdminReservasDashboard = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [filterEstado, setFilterEstado] = useState("todos");
  const [filterDestino, setFilterDestino] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("panel");
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReserva, setEditingReserva] = useState<Reserva | null>(null);
  
  // Estados para eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingReserva, setDeletingReserva] = useState<Reserva | null>(null);

  // Función para recargar reservas (reutilizable)
  const recargarReservas = async () => {
    try {
      setLoading(true);
      const res = await listarReservas();
      console.log("🔄 Recargando reservas...", res.data);
      
      // Usar la misma lógica de mapeo que en el useEffect inicial
      const reservasMapeadas = res.data.map((reserva: any) => {
        console.log("🔍 Procesando reserva para recarga:");
        console.log("  - ID:", reserva.id);
        console.log("  - Estado original:", reserva.estado);
        console.log("  - Tipo de estado:", typeof reserva.estado);
        
        const detalle = reserva.detalles?.[0] || {};
        
        const extraerDestino = (detalle: any): string => {
          const detalleObj = Array.isArray(detalle) ? detalle[0] : detalle;
          
          if (!detalleObj || typeof detalleObj !== 'object') {
            return 'Destino no especificado';
          }
          
          if (detalleObj.tipo && typeof detalleObj.tipo === 'string' && detalleObj.tipo.trim() !== '') {
            return detalleObj.tipo;
          }
          
          if (detalleObj.titulo && typeof detalleObj.titulo === 'string') {
            const titulo = detalleObj.titulo;
            const lugaresPosibles = ['Uyuni', 'Titicaca', 'Copacabana', 'La Paz', 'Sucre', 'Cochabamba', 'Santa Cruz', 'Potosí', 'Oruro', 'Tarija'];
            for (const lugar of lugaresPosibles) {
              if (titulo.toLowerCase().includes(lugar.toLowerCase())) {
                return lugar;
              }
            }
          }
          
          return 'Destino no especificado';
        };
        
        const extraerPaquete = (detalle: any): string => {
          const detalleObj = Array.isArray(detalle) ? detalle[0] : detalle;
          
          if (!detalleObj || typeof detalleObj !== 'object') {
            return 'Paquete no especificado';
          }
          
          if (detalleObj.titulo && typeof detalleObj.titulo === 'string' && detalleObj.titulo.trim() !== '') {
            return detalleObj.titulo;
          }
          
          return 'Paquete no especificado';
        };
        
        const calcularPrecioUnitario = (detalles: any[]): number => {
          if (!detalles || detalles.length === 0) return 0;
          
          const precios = detalles
            .map(detalle => parseFloat(detalle.precio_unitario || '0'))
            .filter(precio => precio > 0);
            
          if (precios.length === 0) return 0;
          
          return precios.reduce((sum, precio) => sum + precio, 0) / precios.length;
        };
        
        const destinoExtraido = extraerDestino(detalle);
        const paqueteExtraido = extraerPaquete(detalle);
        const precioUnitarioCalculado = calcularPrecioUnitario(reserva.detalles || []);
        
        let destinoFinal = destinoExtraido;
        let paqueteFinal = paqueteExtraido;
        
        if (destinoFinal === 'Destino no especificado' && paqueteFinal === 'Paquete no especificado') {
          const fecha = reserva.fecha_inicio ? new Date(reserva.fecha_inicio).toLocaleDateString() : '';
          destinoFinal = `Reserva ${fecha}`;
          paqueteFinal = `Tour ${reserva.total ? `$${reserva.total}` : 'Sin precio'}`;
        }
        
        const estadoFinal = reserva.estado?.toLowerCase() || 'pendiente';
        console.log("  - Estado final mapeado:", estadoFinal);
        
        const reservaMapeada = {
          id: reserva.id?.toString() || '',
          cliente: reserva.usuario ? `${reserva.usuario.nombres || ''} ${reserva.usuario.apellidos || ''}`.trim() : '',
          clienteEmail: reserva.usuario?.email || '',
          destino: destinoFinal,
          paquete: paqueteFinal,
          fecha: reserva.fecha_inicio ? new Date(reserva.fecha_inicio).toLocaleDateString() : '',
          estado: estadoFinal,
          precio: parseFloat(reserva.total || '0'),
          precioUnitario: precioUnitarioCalculado,
          telefono: reserva.usuario?.telefono || '',
          numeroPersonas: (reserva.acompanantes?.length || 0) + 1,
          tipoServicio: (reserva.detalles?.[0]?.tipo || ''),
          usuario: reserva.usuario,
          fecha_inicio: reserva.fecha_inicio,
          total: reserva.total,
          detalles: reserva.detalles,
          acompanantes: reserva.acompanantes
        };
        
        console.log("  - Objeto final:", {
          id: reservaMapeada.id,
          estado: reservaMapeada.estado,
          cliente: reservaMapeada.cliente
        });
        
        return reservaMapeada;
      });
      
      console.log("🔄 Total de reservas mapeadas:", reservasMapeadas.length);
      console.log("🔄 Estados de reservas mapeadas:", reservasMapeadas.map((r: any) => ({ id: r.id, estado: r.estado })));
      
      setReservas(reservasMapeadas);
      console.log("✅ Estado actualizado con nuevas reservas");
      setLoading(false);
    } catch (error) {
      console.error("❌ Error al recargar reservas:", error);
      setLoading(false);
    }
  };

  const getPanelTitle = () => {
    if (currentUser?.roles?.includes(1) || currentUser?.role === "ADMIN") {
      return "Panel Administrativo - Gestión de Reservas";
    } else if (currentUser?.roles?.includes(4) || currentUser?.role === "SOPORTE") {
      return "Panel de Soporte - Gestión de Reservas";
    }
    return "Panel de Gestión - Reservas";
  };

  const getPanelDescription = () => {
    if (currentUser?.roles?.includes(1) || currentUser?.role === "ADMIN") {
      return "Gestiona todas las reservas, estados y confirmaciones de tu plataforma turística";
    } else if (currentUser?.roles?.includes(4) || currentUser?.role === "SOPORTE") {
      return "Proporciona soporte y gestiona reservas de clientes";
    }
    return "Gestiona las reservas de tu plataforma turística";
  };

  useEffect(() => {
    setLoading(true);
    listarReservas()
      .then(res => {
        console.log("📝 Datos de reservas recibidos:", res.data);
        console.log("📊 Primera reserva ejemplo:", res.data[0]);
        
        // Mostrar estructura completa de las primeras 3 reservas
        res.data.slice(0, 3).forEach((reserva: any, index: number) => {
          console.log(`\n=== RESERVA ${index + 1} ===`);
          console.log("ID:", reserva.id);
          console.log("Estado:", reserva.estado);
          console.log("Total:", reserva.total);
          console.log("Fecha inicio:", reserva.fecha_inicio);
          console.log("Usuario:", reserva.usuario);
          console.log("Detalles:", reserva.detalles);
          console.log("Acompañantes:", reserva.acompanantes);
          
          if (reserva.detalles && reserva.detalles.length > 0) {
            console.log("Primer detalle:", reserva.detalles[0]);
            console.log("Claves del primer detalle:", Object.keys(reserva.detalles[0]));
          }
        });
        
        // Mapear los datos del backend al formato esperado por el frontend
        const reservasMapeadas = res.data.map((reserva: any) => {
          console.log("🔍 Procesando reserva:", reserva);
          console.log("📋 Detalles de la reserva:", reserva.detalles);
          console.log("📋 Estructura completa del detalle:", JSON.stringify(reserva.detalles, null, 2));
          
          // Extraer información del detalle
          const detalle = reserva.detalles?.[0] || {};
          console.log("📦 Detalle extraído:", detalle);
          
          // Función para extraer destino de diferentes posibles campos
          const extraerDestino = (detalle: any): string => {
            // Si detalle es un array, tomar el primer elemento
            const detalleObj = Array.isArray(detalle) ? detalle[0] : detalle;
            
            if (!detalleObj || typeof detalleObj !== 'object') {
              return 'Destino no especificado';
            }
            
            // Para tu estructura específica, usar 'tipo' como destino principal
            if (detalleObj.tipo && typeof detalleObj.tipo === 'string' && detalleObj.tipo.trim() !== '') {
              console.log(`🎯 Destino encontrado en campo 'tipo':`, detalleObj.tipo);
              return detalleObj.tipo;
            }
            
            // Si no hay 'tipo', intentar extraer del título
            if (detalleObj.titulo && typeof detalleObj.titulo === 'string') {
              const titulo = detalleObj.titulo;
              // Extraer ubicación del título si contiene nombres de lugares conocidos
              const lugaresPosibles = ['Uyuni', 'Titicaca', 'Copacabana', 'La Paz', 'Sucre', 'Cochabamba', 'Santa Cruz', 'Potosí', 'Oruro', 'Tarija'];
              for (const lugar of lugaresPosibles) {
                if (titulo.toLowerCase().includes(lugar.toLowerCase())) {
                  console.log(`🎯 Destino extraído del título '${lugar}':`, lugar);
                  return lugar;
                }
              }
            }
            
            // Buscar en otros campos posibles
            const posiblesCampos = [
              'destino', 'lugar', 'ubicacion', 'destination', 'location',
              'nombre_destino', 'ciudad', 'provincia', 'region', 'place',
              'site', 'area', 'zona'
            ];
            
            for (const campo of posiblesCampos) {
              if (detalleObj[campo] && typeof detalleObj[campo] === 'string' && detalleObj[campo].trim() !== '') {
                console.log(`🎯 Destino encontrado en campo '${campo}':`, detalleObj[campo]);
                return detalleObj[campo];
              }
            }
            
            // Buscar en campos anidados
            for (const [key, value] of Object.entries(detalleObj)) {
              if (typeof value === 'object' && value !== null) {
                const resultado: string = extraerDestino(value);
                if (resultado !== 'Destino no especificado') {
                  return resultado;
                }
              }
            }
            
            console.log("❌ No se encontró destino en:", Object.keys(detalleObj));
            return 'Destino no especificado';
          };
          
          // Función para extraer paquete de diferentes posibles campos
          const extraerPaquete = (detalle: any): string => {
            // Si detalle es un array, tomar el primer elemento
            const detalleObj = Array.isArray(detalle) ? detalle[0] : detalle;
            
            if (!detalleObj || typeof detalleObj !== 'object') {
              return 'Paquete no especificado';
            }
            
            // Para tu estructura específica, usar 'titulo' como paquete principal
            if (detalleObj.titulo && typeof detalleObj.titulo === 'string' && detalleObj.titulo.trim() !== '') {
              console.log(`📦 Paquete encontrado en campo 'titulo':`, detalleObj.titulo);
              return detalleObj.titulo;
            }
            
            // Buscar en otros campos posibles
            const posiblesCampos = [
              'paquete', 'tour', 'servicio', 'package', 'nombre_paquete', 
              'tipo_tour', 'actividad', 'experiencia', 'nombre',
              'title', 'name', 'service', 'plan', 'oferta'
            ];
            
            for (const campo of posiblesCampos) {
              if (detalleObj[campo] && typeof detalleObj[campo] === 'string' && detalleObj[campo].trim() !== '') {
                console.log(`📦 Paquete encontrado en campo '${campo}':`, detalleObj[campo]);
                return detalleObj[campo];
              }
            }
            
            // Buscar en campos anidados
            for (const [key, value] of Object.entries(detalleObj)) {
              if (typeof value === 'object' && value !== null) {
                const resultado: string = extraerPaquete(value);
                if (resultado !== 'Paquete no especificado') {
                  return resultado;
                }
              }
            }
            
            console.log("❌ No se encontró paquete en:", Object.keys(detalleObj));
            return 'Paquete no especificado';
          };
          
          // Función para calcular precio unitario promedio de todos los servicios
          const calcularPrecioUnitario = (detalles: any[]): number => {
            if (!detalles || detalles.length === 0) return 0;
            
            const precios = detalles
              .map(detalle => parseFloat(detalle.precio_unitario || '0'))
              .filter(precio => precio > 0);
              
            if (precios.length === 0) return 0;
            
            return precios.reduce((sum, precio) => sum + precio, 0) / precios.length;
          };
          
          const destinoExtraido = extraerDestino(detalle);
          const paqueteExtraido = extraerPaquete(detalle);
          const precioUnitarioCalculado = calcularPrecioUnitario(reserva.detalles || []);
          
          // Si aún no tenemos destino/paquete, intentar extraer de otros lugares
          let destinoFinal = destinoExtraido;
          let paqueteFinal = paqueteExtraido;
          
          // Intentar extraer del total de la reserva si no hay datos específicos
          if (destinoFinal === 'Destino no especificado' && paqueteFinal === 'Paquete no especificado') {
            // Crear nombres basados en la fecha y el total para identificar las reservas
            const fecha = reserva.fecha_inicio ? new Date(reserva.fecha_inicio).toLocaleDateString() : '';
            destinoFinal = `Reserva ${fecha}`;
            paqueteFinal = `Tour ${reserva.total ? `$${reserva.total}` : 'Sin precio'}`;
          }
          
          return {
            id: reserva.id?.toString() || '',
            cliente: reserva.usuario ? `${reserva.usuario.nombres || ''} ${reserva.usuario.apellidos || ''}`.trim() : '',
            clienteEmail: reserva.usuario?.email || '',
            destino: destinoFinal,
            paquete: paqueteFinal,
            fecha: reserva.fecha_inicio ? new Date(reserva.fecha_inicio).toLocaleDateString() : '',
            estado: reserva.estado?.toLowerCase() || 'pendiente',
            precio: parseFloat(reserva.total || '0'),
            precioUnitario: precioUnitarioCalculado,
            telefono: reserva.usuario?.telefono || '',
            numeroPersonas: (reserva.acompanantes?.length || 0) + 1,
            tipoServicio: (reserva.detalles?.[0]?.tipo || ''),
            // Mantener datos originales
            usuario: reserva.usuario,
            fecha_inicio: reserva.fecha_inicio,
            total: reserva.total,
            detalles: reserva.detalles,
            acompanantes: reserva.acompanantes
          };
        });
        
        console.log("🔄 Reservas mapeadas:", reservasMapeadas);
        console.log("🎯 Primera reserva mapeada:", reservasMapeadas[0]);
        
        // Debug de estados
        console.log("📊 Estados únicos encontrados:", Array.from(new Set(reservasMapeadas.map((r: any) => r.estado))));
        console.log("📊 Conteo por estados:", {
          pendiente: reservasMapeadas.filter((r: any) => r.estado === 'pendiente').length,
          pagada: reservasMapeadas.filter((r: any) => r.estado === 'pagada').length,
          cancelada: reservasMapeadas.filter((r: any) => r.estado === 'cancelada').length,
          reprogramada: reservasMapeadas.filter((r: any) => r.estado === 'reprogramada').length,
        });
        
        setReservas(reservasMapeadas);
      })
      .catch(() => setError("No se pudieron cargar las reservas"))
      .finally(() => setLoading(false));
  }, []);

  const filteredReservas = reservas.filter(reserva => {
    // Filtro de búsqueda por cliente, destino o paquete
    const matchesSearch = (reserva.cliente || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (reserva.destino || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (reserva.paquete || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por estado
    const matchesEstado = filterEstado === "todos" || (reserva.estado?.toLowerCase() === filterEstado);
    
    // Filtro por destino
    const matchesDestino = filterDestino === "todos" || (reserva.destino || "").toLowerCase().includes(filterDestino.toLowerCase());
    
    return matchesSearch && matchesEstado && matchesDestino;
  });

  // Obtener destinos únicos para el filtro
  const destinosUnicos = Array.from(new Set(reservas.map(r => r.destino).filter(destino => destino && destino.trim() !== "")));

  // Función para abrir el modal de detalles
  const verDetallesReserva = (reserva: Reserva) => {
    setSelectedReserva(reserva);
    setShowModal(true);
  };

  // Función para cerrar el modal
  const cerrarModal = () => {
    setSelectedReserva(null);
    setShowModal(false);
  };

  // Función para abrir el modal de edición
  const abrirModalEdicion = (reserva: Reserva) => {
    setEditingReserva({...reserva}); // Crear una copia para editar
    setShowEditModal(true);
  };

  // Función para cerrar el modal de edición
  const cerrarModalEdicion = () => {
    setEditingReserva(null);
    setShowEditModal(false);
  };

  // Funciones para eliminación lógica
  const abrirModalEliminacion = (reserva: Reserva) => {
    console.log("🗑️ Abriendo modal de eliminación para reserva:", reserva.id);
    setDeletingReserva(reserva);
    setShowDeleteModal(true);
  };

  const cerrarModalEliminacion = () => {
    setDeletingReserva(null);
    setShowDeleteModal(false);
  };

  const confirmarEliminacion = async () => {
    if (!deletingReserva) return;
    
    try {
      console.log("🗑️ Iniciando eliminación lógica de reserva:", deletingReserva.id);
      
      // Para eliminación lógica, actualizamos el estado a "cancelada"
      const datosEliminacion: any = {
        estado: "CANCELADA", // Backend requiere mayúsculas
        detalles: deletingReserva.detalles || [],
        acompanantes: deletingReserva.acompanantes || [],
        total: deletingReserva.total || "0",
      };

      // Si hay fecha_inicio, incluirla
      if (deletingReserva.fecha_inicio) {
        datosEliminacion.fecha_inicio = deletingReserva.fecha_inicio;
      }

      console.log("🗑️ Datos para eliminación lógica:", datosEliminacion);
      
      // Actualizar la reserva con estado CANCELADA (eliminación lógica)
      await editarReserva(deletingReserva.id, datosEliminacion);
      
      // Recargar las reservas
      console.log("🔄 Recargando reservas después de eliminación lógica...");
      await recargarReservas();
      
      toast({
        title: "✅ Reserva eliminada",
        description: `La reserva #${deletingReserva.id} ha sido marcada como cancelada`,
      });
      
      cerrarModalEliminacion();
      
    } catch (error: any) {
      console.error('❌ Error al eliminar reserva:', error);
      
      let errorMessage = "No se pudo eliminar la reserva. Por favor, intenta nuevamente.";
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        }
      }
      
      toast({
        title: "❌ Error al eliminar",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Función para guardar los cambios
  const validarDatosReserva = (reserva: any): { valido: boolean; errores: string[] } => {
    const errores: string[] = [];
    
    // Validar estado
    const estadosValidos = ['pendiente', 'pagada', 'cancelada', 'reprogramada'];
    if (!reserva.estado || !estadosValidos.includes(reserva.estado)) {
      errores.push('El estado de la reserva es obligatorio y debe ser válido');
    }
    
    // Validar número de personas
    if (reserva.numeroPersonas && (isNaN(reserva.numeroPersonas) || reserva.numeroPersonas < 1)) {
      errores.push('El número de personas debe ser un número mayor a 0');
    }
    
    // Validar precios
    if (reserva.precio && (isNaN(reserva.precio) || reserva.precio < 0)) {
      errores.push('El precio total debe ser un número positivo');
    }
    
    if (reserva.precioUnitario && (isNaN(reserva.precioUnitario) || reserva.precioUnitario < 0)) {
      errores.push('El precio unitario debe ser un número positivo');
    }
    
    // Validar fecha
    if (reserva.fecha_inicio) {
      const fecha = new Date(reserva.fecha_inicio);
      if (isNaN(fecha.getTime())) {
        errores.push('La fecha de inicio no es válida');
      }
    }
    
    // Validar teléfono si se proporciona
    if (reserva.telefono && reserva.telefono.trim() !== '') {
      const telefonoRegex = /^[\d\s\-\+\(\)]+$/;
      if (!telefonoRegex.test(reserva.telefono)) {
        errores.push('El teléfono contiene caracteres no válidos');
      }
    }
    
    return {
      valido: errores.length === 0,
      errores
    };
  };

  const guardarCambios = async () => {
    if (!editingReserva) return;
    
    // Validar los datos antes de enviar
    const validacion = validarDatosReserva(editingReserva);
    if (!validacion.valido) {
      toast({
        title: "❌ Datos inválidos",
        description: `Por favor, corrige los siguientes errores:\n• ${validacion.errores.join('\n• ')}`,
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Preparar los datos para la API - incluir campos requeridos por el backend
      const datosActualizacion: any = {
        estado: editingReserva.estado?.toUpperCase() || 'PENDIENTE', // Backend requiere mayúsculas
        detalles: editingReserva.detalles || [], // Campo requerido por el backend
        acompanantes: editingReserva.acompanantes || [], // Incluir acompañantes
        total: editingReserva.precio?.toString() || editingReserva.total || "0", // Total como string
      };

      // Agregar fecha_inicio solo si ha cambiado
      if (editingReserva.fecha_inicio) {
        datosActualizacion.fecha_inicio = editingReserva.fecha_inicio;
      }

      // Filtrar valores undefined/null
      const datosLimpios = Object.fromEntries(
        Object.entries(datosActualizacion).filter(([_, value]) => value != null && value !== '')
      );
      
      console.log('📤 Enviando datos de actualización (solo campos permitidos):', datosLimpios);
      console.log('📤 ID de reserva a editar:', editingReserva.id);
      console.log('📤 URL que se va a llamar:', `/reservas/${editingReserva.id}/`);
      
      // Llamar a la API para actualizar la reserva
      console.log("💾 Guardando cambios en el backend...");
      const resultadoEdicion = await editarReserva(editingReserva.id, datosLimpios);
      console.log("✅ Cambios guardados en el backend exitosamente");
      console.log("📋 Resultado de la edición:", resultadoEdicion.data);
      
      // Pequeño delay para asegurar que el backend procese el cambio
      console.log("⏳ Esperando 500ms para asegurar procesamiento...");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Recargar las reservas usando la función reutilizable
      console.log("🔄 Iniciando recarga de datos después de guardar...");
      await recargarReservas();
      console.log("✅ Recarga de datos completada");
      
      toast({
        title: "✅ Reserva actualizada",
        description: `Los cambios en la reserva #${editingReserva.id} se han guardado correctamente`,
      });
      
      cerrarModalEdicion();
    } catch (error: any) {
      console.error('❌ Error al guardar cambios:', error);
      console.error('❌ Respuesta del servidor:', error.response?.data);
      console.error('❌ Status:', error.response?.status);
      
      let errorMessage = "No se pudieron guardar los cambios. Por favor, intenta nuevamente.";
      
      if (error.response?.data) {
        // Si el servidor envía detalles del error, mostrarlos
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else {
          // Si es un objeto con errores de campos específicos
          const errors = Object.entries(error.response.data)
            .map(([field, messages]: [string, any]) => {
              const messageText = Array.isArray(messages) ? messages.join(', ') : messages;
              return `${field}: ${messageText}`;
            })
            .join('\n');
          errorMessage = `Errores de validación:\n${errors}`;
        }
      }
      
      toast({
        title: "❌ Error al guardar",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-4">
          <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            {getPanelTitle()}
          </h1>
        </div>
        <p className="text-gray-600">
          {getPanelDescription()}
        </p>
      </div>

      {/* Tabs para alternar vistas */}
      <div className="mb-4 md:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-4">
        <button
          className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm sm:text-base ${activeTab === "panel" ? "bg-blue-600 text-white" : "bg-white text-blue-600 border border-blue-600"}`}
          onClick={() => setActiveTab("panel")}
        >
          Panel General
        </button>
        <button
          className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm sm:text-base ${activeTab === "reservas" ? "bg-blue-600 text-white" : "bg-white text-blue-600 border border-blue-600"}`}
          onClick={() => setActiveTab("reservas")}
        >
          Gestión de reservas
        </button>
      </div>

      {/* Vista Gestión de reservas */}
      {activeTab === "reservas" && (
        <>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full lg:w-auto">
                <input
                  type="text"
                  placeholder="Buscar por cliente, destino o paquete..."
                  className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base min-w-0"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <select
                  className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  value={filterEstado}
                  onChange={e => setFilterEstado(e.target.value)}
                >
                  <option value="todos">Todos los estados</option>
                  {estados.map(estado => (
                    <option key={estado} value={estado}>{estado.toUpperCase()}</option>
                  ))}
                </select>
                <select
                  className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  value={filterDestino}
                  onChange={e => setFilterDestino(e.target.value)}
                >
                  <option value="todos">Todos los destinos</option>
                  {destinosUnicos.map(destino => (
                    <option key={destino} value={destino}>{destino}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-x-auto max-h-[60vh] md:max-h-[70vh]">
            <div className="overflow-x-auto overflow-y-auto max-h-[60vh] md:max-h-[70vh] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <table className="min-w-[1000px] md:min-w-full divide-y divide-gray-200 text-xs md:text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 md:px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[120px]">Cliente</th>
                    <th className="px-2 md:px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[100px]">Destino</th>
                    <th className="px-2 md:px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[100px]">Paquete</th>
                    <th className="px-2 md:px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[90px]">Fecha</th>
                    <th className="px-2 md:px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[80px]">Estado</th>
                    <th className="px-2 md:px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[80px]">Precio Unit.</th>
                    <th className="px-2 md:px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[80px]">Total</th>
                    <th className="px-2 md:px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[100px]">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReservas.map((reserva, index) => (
                    <tr key={reserva.id} className="hover:bg-gray-50">
                          <td className="px-1 md:px-4 py-1 md:py-2 whitespace-normal break-words text-[11px] md:text-sm">
                            <div className="font-medium text-gray-900 break-words whitespace-normal leading-tight">{reserva.cliente || "Sin nombre"}</div>
                            {reserva.clienteEmail && (
                              <div className="text-gray-500 break-all whitespace-normal leading-tight text-[10px] md:text-xs">{reserva.clienteEmail}</div>
                            )}
                          </td>
                      <td className="px-1 md:px-4 py-1 md:py-2 whitespace-normal break-words text-[11px] md:text-sm">
                        <div className="text-gray-900 break-words whitespace-normal leading-tight">{reserva.destino || "Sin destino"}</div>
                      </td>
                      <td className="px-1 md:px-4 py-1 md:py-2 whitespace-normal break-words text-[11px] md:text-sm">
                        <div className="text-gray-900 break-words whitespace-normal leading-tight">{reserva.paquete || "Sin paquete"}</div>
                      </td>
                      <td className="px-1 md:px-4 py-1 md:py-2 whitespace-normal text-[11px] md:text-sm">
                        <div className="text-gray-900 break-words whitespace-normal leading-tight">{reserva.fecha || "Sin fecha"}</div>
                      </td>
                      <td className="px-2 md:px-4 py-2 whitespace-normal">
                        {(() => {
                          const estado = (reserva.estado || "").toLowerCase();
                          let color = "bg-gray-100 text-gray-800";
                          if (estado === "pagada") color = "bg-green-100 text-green-800";
                          else if (estado === "pendiente") color = "bg-yellow-100 text-yellow-800";
                          else if (estado === "cancelada") color = "bg-red-100 text-red-800";
                          else if (estado === "pagada") color = "bg-blue-100 text-blue-800";
                          return (
                            <span className={`inline-flex px-2 py-1 text-[10px] md:text-xs font-semibold rounded-full ${color}`}>
                              {estado ? estado.charAt(0).toUpperCase() + estado.slice(1) : ""}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-1 md:px-4 py-1 md:py-2 whitespace-normal text-[11px] md:text-sm">
                        <div className="text-gray-900 font-medium">
                          ${reserva.precioUnitario ? reserva.precioUnitario.toFixed(2) : '0.00'}
                        </div>
                        {reserva.tipoServicio && (
                          <div className="text-gray-500 text-[10px] md:text-xs">{reserva.tipoServicio}</div>
                        )}
                      </td>
                      <td className="px-1 md:px-4 py-1 md:py-2 whitespace-normal text-[11px] md:text-sm">
                        <div className="text-gray-900 font-bold">
                          ${reserva.precio ? reserva.precio.toFixed(2) : '0.00'}
                        </div>
                        <div className="text-gray-500 text-[10px] md:text-xs">
                          {reserva.numeroPersonas} personas
                        </div>
                      </td>
                      <td className="px-2 md:px-4 py-2 whitespace-nowrap text-xs md:text-sm font-medium">
                        <div className="flex gap-2 items-center flex-wrap justify-start">
                          <button 
                            title="Ver detalles de la reserva" 
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            onClick={() => verDetallesReserva(reserva)}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            title="Editar reserva" 
                            className="text-green-600 hover:text-green-900 transition-colors"
                            onClick={() => abrirModalEdicion(reserva)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            title="Eliminar reserva" 
                            className="text-red-600 hover:text-red-900 transition-colors"
                            onClick={() => abrirModalEliminacion(reserva)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredReservas.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron reservas</h3>
                  <p className="mt-1 text-sm text-gray-500">Intenta cambiar los filtros de búsqueda</p>
                </div>
              )}
            </div>
          </div>
          {error && <div className="text-red-600 mt-4">{error}</div>}
          {loading && <div className="text-gray-600 mt-4">Cargando reservas...</div>}
        </>
      )}

      {/* Vista Panel General - Estadísticas */}
      {activeTab === "panel" && (
        <div className="space-y-6">
          {/* Estadísticas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Reservas</p>
                  <p className="text-3xl font-bold">{reservas.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Pagadas</p>
                  <p className="text-3xl font-bold">{reservas.filter(r => r.estado === 'pagada').length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Pendientes</p>
                  <p className="text-3xl font-bold">{reservas.filter(r => r.estado === 'pendiente').length}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Canceladas</p>
                  <p className="text-3xl font-bold">{reservas.filter(r => r.estado === 'cancelada').length}</p>
                </div>
                <X className="w-8 h-8 text-red-200" />
              </div>
            </div>
          </div>

          {/* Estadísticas secundarias */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Reprogramadas</p>
                  <p className="text-2xl font-bold text-gray-900">{reservas.filter(r => r.estado === 'reprogramada').length}</p>
                </div>
                <Star className="w-6 h-6 text-indigo-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Pagadas</p>
                  <p className="text-2xl font-bold text-gray-900">{reservas.filter(r => r.estado === 'pagada').length}</p>
                </div>
                <DollarSign className="w-6 h-6 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Destinos Únicos</p>
                  <p className="text-2xl font-bold text-gray-900">{Array.from(new Set(reservas.map(r => r.destino).filter(d => d && d.trim() !== ""))).length}</p>
                </div>
                <MapPin className="w-6 h-6 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-teal-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Clientes Únicos</p>
                  <p className="text-2xl font-bold text-gray-900">{Array.from(new Set(reservas.map(r => r.clienteEmail).filter(e => e && e.trim() !== ""))).length}</p>
                </div>
                <Users className="w-6 h-6 text-teal-500" />
              </div>
            </div>
          </div>

          {/* Resumen de Reservas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Reservas</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Distribución por Estado</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">PENDIENTE</span>
                  </div>
                  <span className="font-medium">{reservas.filter(r => r.estado === 'pendiente').length} ({reservas.length > 0 ? ((reservas.filter(r => r.estado === 'pendiente').length/reservas.length)*100).toFixed(1) : 0}%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">PAGADA</span>
                  </div>
                  <span className="font-medium">{reservas.filter(r => r.estado === 'pagada').length} ({reservas.length > 0 ? ((reservas.filter(r => r.estado === 'pagada').length/reservas.length)*100).toFixed(1) : 0}%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">CANCELADA</span>
                  </div>
                  <span className="font-medium">{reservas.filter(r => r.estado === 'cancelada').length} ({reservas.length > 0 ? ((reservas.filter(r => r.estado === 'cancelada').length/reservas.length)*100).toFixed(1) : 0}%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">REPROGRAMADA</span>
                  </div>
                  <span className="font-medium">{reservas.filter(r => r.estado === 'reprogramada').length} ({reservas.length > 0 ? ((reservas.filter(r => r.estado === 'reprogramada').length/reservas.length)*100).toFixed(1) : 0}%)</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Destinos Populares</h3>
              <div className="space-y-3">
                {Array.from(new Set(reservas.map(r => r.destino).filter(d => d && d.trim() !== ""))).slice(0, 5).map(destino => {
                  const count = reservas.filter(r => r.destino === destino).length;
                  const percentage = reservas.length > 0 ? ((count/reservas.length)*100).toFixed(1) : 0;
                  return (
                    <div key={destino} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-gray-700 font-medium">{destino}</span>
                      <div className="text-right">
                        <span className="font-bold text-gray-900">{count}</span>
                        <span className="text-sm text-gray-500 ml-2">({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles de reserva */}
      {showModal && selectedReserva && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del modal */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Detalles de la Reserva</h2>
                <p className="text-gray-600">ID: {selectedReserva.id}</p>
              </div>
              <button
                onClick={cerrarModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 space-y-6">
              {/* Información del cliente */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Información del Cliente
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Nombre:</span>
                      <span className="font-medium">{selectedReserva.cliente}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Email:</span>
                      <span className="font-medium">{selectedReserva.clienteEmail}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {selectedReserva.telefono && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-600">Teléfono:</span>
                        <span className="font-medium">{selectedReserva.telefono}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Número de personas:</span>
                      <span className="font-medium">{selectedReserva.numeroPersonas}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de la reserva */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Información de la Reserva
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600">Destino:</span>
                      <span className="font-medium">{selectedReserva.destino}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600">Paquete:</span>
                      <span className="font-medium">{selectedReserva.paquete}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600">Fecha:</span>
                      <span className="font-medium">{selectedReserva.fecha}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600">Estado:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        selectedReserva.estado === 'pagada' ? 'bg-green-100 text-green-800' :
                        selectedReserva.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                        selectedReserva.estado === 'cancelada' ? 'bg-red-100 text-red-800' :
                        selectedReserva.estado === 'pagada' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedReserva.estado ? selectedReserva.estado.charAt(0).toUpperCase() + selectedReserva.estado.slice(1) : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de precios */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Información de Precios
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-purple-600">
                      ${selectedReserva.precioUnitario ? selectedReserva.precioUnitario.toFixed(2) : '0.00'}
                    </div>
                    <div className="text-sm text-gray-600">Precio Unitario</div>
                    {selectedReserva.tipoServicio && (
                      <div className="text-xs text-purple-600 mt-1">{selectedReserva.tipoServicio}</div>
                    )}
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-green-600">
                      ${selectedReserva.precio ? selectedReserva.precio.toFixed(2) : '0.00'}
                    </div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <div className="text-2xl font-bold text-blue-600">
                      ${selectedReserva.precio && selectedReserva.numeroPersonas ? 
                        (selectedReserva.precio / selectedReserva.numeroPersonas).toFixed(2) : '0.00'}
                    </div>
                    <div className="text-sm text-gray-600">Por Persona</div>
                  </div>
                </div>
              </div>

              {/* Detalles de servicios */}
              {selectedReserva.detalles && selectedReserva.detalles.length > 0 && (
                <div className="bg-orange-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-orange-900 mb-3">Servicios Incluidos</h3>
                  <div className="space-y-3">
                    {selectedReserva.detalles.map((detalle: any, index: number) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-orange-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{detalle.titulo || 'Servicio sin título'}</h4>
                            <p className="text-sm text-gray-600">{detalle.tipo || 'Tipo no especificado'}</p>
                            {detalle.fecha_servicio && (
                              <p className="text-xs text-gray-500 mt-1">
                                Fecha: {new Date(detalle.fecha_servicio).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-orange-600">
                              ${parseFloat(detalle.precio_unitario || '0').toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-600">
                              Cantidad: {detalle.cantidad || 1}
                            </div>
                            <div className="text-sm font-semibold text-gray-900">
                              Subtotal: ${((parseFloat(detalle.precio_unitario || '0')) * (parseInt(detalle.cantidad || '1'))).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Acompañantes */}
              {selectedReserva.acompanantes && selectedReserva.acompanantes.length > 0 && (
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Acompañantes ({selectedReserva.acompanantes.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedReserva.acompanantes.map((acompanante: any, index: number) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-indigo-200">
                        <div className="font-medium text-gray-900">
                          {acompanante.nombres ? `${acompanante.nombres} ${acompanante.apellidos || ''}`.trim() : `Acompañante ${index + 1}`}
                        </div>
                        {acompanante.edad && (
                          <div className="text-sm text-gray-600">Edad: {acompanante.edad} años</div>
                        )}
                        {acompanante.documento && (
                          <div className="text-sm text-gray-600">Documento: {acompanante.documento}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer del modal */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={cerrarModal}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cerrar
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => {
                  cerrarModal();
                  abrirModalEdicion(selectedReserva!);
                }}
              >
                Editar Reserva
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Confirmar Reserva
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición de reserva */}
      {showEditModal && editingReserva && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del modal */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Editar Reserva</h2>
                <p className="text-gray-600">ID: {editingReserva.id}</p>
              </div>
              <button
                onClick={cerrarModalEdicion}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Formulario de edición */}
            <div className="p-6 space-y-6">
              {/* Información del cliente (solo lectura) */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Información del Cliente (Solo lectura)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                      type="text"
                      value={editingReserva.cliente || ''}
                      disabled
                      className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={editingReserva.clienteEmail || ''}
                      disabled
                      className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Estado de la reserva */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Estado de la Reserva
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <select
                    value={editingReserva.estado || 'pendiente'}
                    onChange={(e) => setEditingReserva({...editingReserva, estado: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="pagada">Pagada</option>
                    <option value="cancelada">Cancelada</option>
                    <option value="reprogramada">Reprogramada</option>
                  </select>
                </div>
              </div>

              {/* Información de la reserva */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Detalles de la Reserva
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Destino</label>
                    <input
                      type="text"
                      value={editingReserva.destino || ''}
                      onChange={(e) => setEditingReserva({...editingReserva, destino: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Paquete</label>
                    <input
                      type="text"
                      value={editingReserva.paquete || ''}
                      onChange={(e) => setEditingReserva({...editingReserva, paquete: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de inicio</label>
                    <input
                      type="datetime-local"
                      value={editingReserva.fecha_inicio ? new Date(editingReserva.fecha_inicio).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setEditingReserva({...editingReserva, fecha_inicio: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Número de personas</label>
                    <input
                      type="number"
                      min="1"
                      value={editingReserva.numeroPersonas || 1}
                      onChange={(e) => setEditingReserva({...editingReserva, numeroPersonas: parseInt(e.target.value)})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Información de precios */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Precios
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Precio Unitario</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editingReserva.precioUnitario || 0}
                        onChange={(e) => setEditingReserva({...editingReserva, precioUnitario: parseFloat(e.target.value)})}
                        className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editingReserva.precio || 0}
                        onChange={(e) => setEditingReserva({...editingReserva, precio: parseFloat(e.target.value)})}
                        className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Cálculo automático por persona */}
                <div className="mt-4 p-3 bg-white rounded-lg border">
                  <div className="text-sm text-gray-600">Precio por persona (calculado):</div>
                  <div className="text-lg font-bold text-purple-600">
                    ${editingReserva.precio && editingReserva.numeroPersonas ? 
                      (editingReserva.precio / editingReserva.numeroPersonas).toFixed(2) : '0.00'}
                  </div>
                </div>
              </div>

              {/* Información adicional */}
              <div className="bg-orange-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-orange-900 mb-3 flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Información Adicional
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono de contacto</label>
                    <input
                      type="tel"
                      value={editingReserva.telefono || ''}
                      onChange={(e) => setEditingReserva({...editingReserva, telefono: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de servicio</label>
                    <select
                      value={editingReserva.tipoServicio || ''}
                      onChange={(e) => setEditingReserva({...editingReserva, tipoServicio: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="">Seleccionar tipo</option>
                      <option value="Turismo">Turismo</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Aventura">Aventura</option>
                      <option value="Gastronómico">Gastronómico</option>
                      <option value="Ecoturismo">Ecoturismo</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer del modal */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={cerrarModalEdicion}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={guardarCambios}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && deletingReserva && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Header del modal */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Eliminar Reserva</h2>
                  <p className="text-gray-600">ID: {deletingReserva.id}</p>
                </div>
              </div>
              <button 
                onClick={cerrarModalEliminacion}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-6">
              <div className="mb-6">
                <div className="text-center mb-4">
                  <p className="text-gray-900 font-medium mb-2">
                    ¿Estás seguro de que deseas eliminar esta reserva?
                  </p>
                  <p className="text-gray-600 text-sm">
                    Esta acción marcará la reserva como <span className="font-semibold text-red-600">CANCELADA</span>.
                    Podrás reactivarla posteriormente cambiando su estado.
                  </p>
                </div>

                {/* Información de la reserva a eliminar */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cliente:</span>
                      <span className="font-medium">{deletingReserva.cliente}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Destino:</span>
                      <span className="font-medium">{deletingReserva.destino}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha:</span>
                      <span className="font-medium">{deletingReserva.fecha}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estado actual:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        deletingReserva.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                        deletingReserva.estado === 'pagada' ? 'bg-green-100 text-green-800' :
                        deletingReserva.estado === 'cancelada' ? 'bg-red-100 text-red-800' :
                        deletingReserva.estado === 'reprogramada' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {deletingReserva.estado ? deletingReserva.estado.charAt(0).toUpperCase() + deletingReserva.estado.slice(1) : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 text-red-600 mt-0.5">⚠️</div>
                    <div className="text-sm text-red-800">
                      <p className="font-medium">Eliminación Lógica</p>
                      <p>La reserva será marcada como cancelada pero no se eliminará permanentemente del sistema.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={cerrarModalEliminacion}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarEliminacion}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Confirmar Eliminación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReservasDashboard;