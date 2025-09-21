import axios from './axios';

// Obtener todas las reservas (con timeout extendido)
export const listarReservas = () => {
  console.log('📋 API: Solicitando lista completa de reservas con timeout extendido');
  return axios.get('reservas/', { 
    timeout: 30000 // 30 segundos para cargar todas las reservas
  });
};

// Crear una nueva reserva
export const crearReserva = async (data: any) => {
  try {
    console.log('🚀 API: Enviando reserva al backend');
    console.log('🚀 API: URL:', 'reservas/');
    console.log('🚀 API: Datos a enviar:', JSON.stringify(data, null, 2));
    
    const response = await axios.post('reservas/', data);
    
    console.log('✅ API: Respuesta exitosa');
    console.log('✅ API: Status:', response.status);
    console.log('✅ API: Data:', response.data);
    
    return response;
  } catch (error: any) {
    console.error('❌ API: Error al crear reserva:', error);
    console.error('❌ API: URL completa:', axios.defaults.baseURL + 'reservas/');
    console.error('❌ API: Status code:', error.response?.status);
    console.error('❌ API: Status text:', error.response?.statusText);
    console.error('❌ API: Response headers:', error.response?.headers);
    console.error('❌ API: Request headers:', error.config?.headers);
    console.error('❌ API: Request data enviada:', error.config?.data);
    
    // Si es error 500, es probable que sea HTML
    if (error.response?.status === 500) {
      console.error('🚨 ERROR 500 DETECTADO - PROBLEMA EN EL SERVIDOR BACKEND');
      console.error('📄 CONTENT TYPE:', error.response?.headers?.['content-type']);
      
      if (typeof error.response?.data === 'string') {
        console.error('📄 RESPUESTA COMPLETA (primeros 2000 chars):', error.response.data.substring(0, 2000));
        
        // Buscar información específica del error Django
        const djangoErrorMatch = error.response.data.match(/<h1>(.*?)<\/h1>/);
        if (djangoErrorMatch) {
          console.error('🎯 TÍTULO DEL ERROR:', djangoErrorMatch[1]);
        }
        
        // Buscar el traceback
        const tracebackMatch1 = error.response.data.match(/Traceback[\s\S]*?(?=<\/pre>|$)/);
        if (tracebackMatch1) {
          console.error('📋 TRACEBACK ENCONTRADO:', tracebackMatch1[0]);
        }
        
        const exceptionMatch = error.response.data.match(/<pre class="exception_value">([\s\S]*?)<\/pre>/);
        if (exceptionMatch) {
          console.error('🎯 EXCEPCIÓN ESPECÍFICA:', exceptionMatch[1]);
        }
        
        // Buscar el traceback completo
        const tracebackMatch2 = error.response.data.match(/<div id="traceback">([\s\S]*?)<\/div>/);
        if (tracebackMatch2) {
          console.error('🎯 TRACEBACK COMPLETO:', tracebackMatch2[1]);
        }
      }
    } 
    // Si es error 400, analizar errores de validación
    else if (error.response?.status === 400) {
      console.error('🚨 ERROR 400 DETECTADO - PROBLEMA DE VALIDACIÓN');
      console.error('📋 DATOS DE VALIDACIÓN:', JSON.stringify(error.response.data, null, 2));
      
      // Analizar errores específicos de campos
      if (typeof error.response.data === 'object') {
        Object.keys(error.response.data).forEach(campo => {
          console.error(`🔴 Error en campo "${campo}":`, error.response.data[campo]);
        });
      }
    } 
    else {
      console.error('❌ API: Response data completa:', JSON.stringify(error.response?.data, null, 2));
    }
    
    // Analizar error específico de campos faltantes
    if (error.response?.data && typeof error.response.data === 'object') {
      console.error('❌ API: Análisis detallado del error:');
      if (error.response.data.details) {
        console.error('❌ API: Campos con problemas:', error.response.data.details);
      }
      if (error.response.data.usuario) {
        console.error('❌ API: Error en usuario:', error.response.data.usuario);
      }
      if (error.response.data.servicios) {
        console.error('❌ API: Error en servicios:', error.response.data.servicios);
      }
      if (error.response.data.acompanantes) {
        console.error('❌ API: Error en acompañantes:', error.response.data.acompanantes);
      }
    }
    
    throw error;
  }
};

// Editar una reserva existente
export const editarReserva = async (id: string, data: any) => {
  try {
    console.log('🔄 API: Editando reserva con ID:', id);
    console.log('🔄 API: Datos a enviar:', data);
    console.log('🔄 API: URL completa:', `/reservas/${id}/`);
    
    const response = await axios.put(`/reservas/${id}/`, data);
    console.log('✅ API: Respuesta exitosa:');
    console.log('✅ API: Status:', response.status);
    console.log('✅ API: Data completa devuelta por backend:', response.data);
    console.log('✅ API: Estado específico devuelto:', response.data?.estado);
    console.log('✅ API: Tipo del estado devuelto:', typeof response.data?.estado);
    
    return response;
  } catch (error: any) {
    console.error('❌ API: Error al editar reserva:', error);
    console.error('❌ API: Respuesta del servidor:', error.response?.data);
    console.error('❌ API: Status code:', error.response?.status);
    console.error('❌ API: Headers:', error.response?.headers);
    throw error;
  }
};

// Eliminar una reserva
export const eliminarReserva = (id: string) => axios.delete(`/reservas/${id}/`);
