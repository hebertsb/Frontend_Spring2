import axios from './axios';

// Obtener todas las reservas
export const listarReservas = () => axios.get('/reservas/');

// Crear una nueva reserva
export const crearReserva = (data: any) => axios.post('/reservas/', data);

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
