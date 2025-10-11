import { Servicio } from '@/lib/servicios'
import axios from './axios'

// ==============================
// 🔹 LISTADOS BÁSICOS
// ==============================

// Listar todos los servicios disponibles
export const listarServicios = async () => {
  console.log('🔄 API: Solicitando lista de servicios...')
  const response = await axios.get('servicios/')
  console.log('✅ API: Servicios obtenidos:', response.data)
  return response
}

// Listar todos los paquetes disponibles
export const listarPaquetes = async () => {
  console.log('🔄 API: Solicitando lista de paquetes...')
  const response = await axios.get('paquetes/')
  console.log('✅ API: Paquetes obtenidos:', response.data)
  return response
}

// ==============================
// 🔹 OBTENCIÓN DE REGISTROS
// ==============================

// Obtener un servicio específico por ID
export const obtenerServicio = async (id: string | number) => {
  console.log('🎯 API: Obteniendo servicio ID:', id)
  const response = await axios.get(`servicios/${id}/`)
  console.log('✅ API: Servicio obtenido:', response.data)
  return response
}

// Obtener un paquete específico por ID
export const obtenerPaquete = async (id: string | number) => {
  console.log('📦 API: Obteniendo paquete ID:', id)
  const response = await axios.get(`paquetes/${id}/`)
  console.log('✅ API: Paquete obtenido:', response.data)
  return response
}

// ==============================
// 🔹 DETECCIÓN DE TIPO (paquete o servicio)
// ==============================
export const detectarTipoServicio = async (id: string | number) => {
  try {
    // Intentar obtener como paquete primero
    try {
      const paqueteResponse = await obtenerPaquete(id)
      if (paqueteResponse.data) {
        return { tipo: 'paquete' as const, data: paqueteResponse.data }
      }
    } catch (error) {
      console.log('📦 No es un paquete, intentando como servicio...')
    }

    // Intentar obtener como servicio
    const servicioResponse = await obtenerServicio(id)
    if (servicioResponse.data) {
      return { tipo: 'servicio' as const, data: servicioResponse.data }
    }

    console.error('❌ ID no corresponde a paquete ni servicio:', id)
    return null
  } catch (error) {
    console.error('❌ Error al detectar tipo de servicio:', error)
    return null
  }
}

// ==============================
// 🔹 RESERVA DE SERVICIOS INDIVIDUALES
// ==============================
export const prepararReservaServicio = (
  servicio: Servicio,
  cantidadPersonas: number = 1,
  clienteId?: number
) => {
  // Detectar correctamente el precio del servicio (precio_usd, precio, o costo)
  const precio = parseFloat(
    servicio.precio_usd ?? servicio.precio ?? servicio.costo ?? 0
  )

  console.log('🎯 Preparando reserva para SERVICIO:', {
    id: servicio.id,
    titulo: servicio.titulo,
    precio_detectado: precio,
    clienteId,
  })

  const costoTotal = precio * cantidadPersonas

  return {
    cliente_id: clienteId ?? null, // ✅ Campo obligatorio en backend
    total: costoTotal.toFixed(2),
    moneda: 'BOB',
    detalles: [
      {
        servicio: servicio.id,
        cantidad: cantidadPersonas,
        precio_unitario: precio.toFixed(2),
        fecha_servicio: new Date().toISOString(),
      },
    ],
    fecha_inicio: '',
    estado: '',
    acompanantes: [] as any[],
  }
}

// ==============================
// 🔹 RESERVA DE PAQUETES
// ==============================
export const prepararReservaPaquete = async (
  paquete: any,
  cantidadPersonas: number = 1,
  clienteId?: number
) => {
  const precioPorPersona = parseFloat(
    paquete.precio ?? paquete.precio_usd ?? paquete.costo ?? 0
  )
  const totalPaquete = precioPorPersona * cantidadPersonas

  console.log('📦 Preparando reserva para PAQUETE:', {
    id: paquete.id,
    nombre: paquete.nombre,
    precio_por_persona: precioPorPersona,
    cantidad_personas: cantidadPersonas,
    clienteId,
  })

  const serviciosResponse = await listarServicios()
  const todosLosServicios = serviciosResponse.data
  const detalles: any[] = []

  if (paquete.servicios && paquete.servicios.length > 0) {
    const servicioContenedor = todosLosServicios.find(
      (s: any) => s.id === paquete.servicios[0]
    )

    if (servicioContenedor) {
      detalles.push({
        servicio: servicioContenedor.id,
        cantidad: cantidadPersonas,
        precio_unitario: precioPorPersona.toFixed(2),
        fecha_servicio: new Date().toISOString(),
      })

      console.log('🚀 PAQUETE CONFIGURADO - PRECIO FORZADO:', {
        servicio_contenedor: servicioContenedor.id,
        titulo_servicio: servicioContenedor.titulo,
        precio_paquete_FORZADO: precioPorPersona.toFixed(2),
      })
    } else {
      console.error('❌ No se encontró el servicio contenedor')
    }
  } else {
    console.error('❌ Paquete sin servicios asociados')
  }

  console.log('📦 Paquete procesado CORRECTAMENTE:', {
    precio_por_persona_mostrado: paquete.precio,
    cantidad_personas: cantidadPersonas,
    total_paquete_calculado: totalPaquete.toFixed(2),
  })

  return {
    cliente_id: clienteId ?? null, // ✅ Campo obligatorio en backend
    total: totalPaquete.toFixed(2),
    moneda: 'BOB',
    detalles,
    fecha_inicio: '',
    estado: '',
    acompanantes: [] as any[],
  }
}
