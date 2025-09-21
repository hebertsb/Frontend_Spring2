import axios from './axios';

// ============================================
// PAQUETES API
// ============================================

// Obtener todos los paquetes
export const listarPaquetes = async () => {
  try {
    console.log('🔄 API: Solicitando lista de paquetes...');
    const response = await axios.get('paquetes/');
    console.log('✅ API: Paquetes obtenidos:', response.data);
    return response;
  } catch (error: any) {
    console.error('❌ API: Error al obtener paquetes:', error);
    console.error('❌ API: Respuesta del servidor:', error.response?.data);
    throw error;
  }
};

// Obtener un paquete específico por ID
export const obtenerPaquete = async (id: string | number) => {
  try {
    console.log('🔄 API: Solicitando paquete con ID:', id);
    const response = await axios.get(`paquetes/${id}/`);
    console.log('✅ API: Paquete obtenido:', response.data);
    return response;
  } catch (error: any) {
    console.error('❌ API: Error al obtener paquete:', error);
    console.error('❌ API: Respuesta del servidor:', error.response?.data);
    throw error;
  }
};

// Crear un nuevo paquete
export const crearPaquete = async (data: any) => {
  try {
    console.log('🔄 API: Creando paquete:', data);
    const response = await axios.post('paquetes/', data);
    console.log('✅ API: Paquete creado exitosamente:', response.data);
    return response;
  } catch (error: any) {
    console.error('❌ API: Error al crear paquete:', error);
    console.error('❌ API: Respuesta del servidor:', error.response?.data);
    throw error;
  }
};

// Editar un paquete existente
export const editarPaquete = async (id: string | number, data: any) => {
  try {
    console.log('🔄 API: Editando paquete con ID:', id);
    console.log('🔄 API: Datos a enviar:', data);
    const response = await axios.put(`paquetes/${id}/`, data);
    console.log('✅ API: Paquete editado exitosamente:', response.data);
    return response;
  } catch (error: any) {
    console.error('❌ API: Error al editar paquete:', error);
    console.error('❌ API: Respuesta del servidor:', error.response?.data);
    throw error;
  }
};

// Eliminar un paquete
export const eliminarPaquete = async (id: string | number) => {
  try {
    console.log('🗑️ API: Eliminando paquete con ID:', id);
    const response = await axios.delete(`paquetes/${id}/`);
    console.log('✅ API: Paquete eliminado exitosamente');
    return response;
  } catch (error: any) {
    console.error('❌ API: Error al eliminar paquete:', error);
    throw error;
  }
};