// =========================
// Interfaces actualizadas
// =========================

export interface Servicio {
  // Permitir id string o number para compatibilidad con datos de fallback
  id: number | string;
  // categoría puede ser un objeto completo o sólo el nombre
  categoria?: Categoria | string;
  proveedor?: Proveedor;
  created_at?: string | null;
  updated_at?: string | null;
  titulo?: string;
  descripcion?: string;
  // Campos adicionales usados por componentes/fallback
  descripcion_servicio?: string;
  duracion?: string; // ejemplo: "4h"
  dias?: number;
  capacidad_max?: number;
  punto_encuentro?: string;
  estado?: string;
  imagen_url?: string; // URL directa
  imagenes?: string[]; // arreglo de imágenes (fallback)
  precio_usd?: string | number; // puede venir como "90.00" o 90
  precio?: string | number;
  costo?: number;
  servicios_incluidos?: string[]; // array de strings
  incluido?: string[];
  calificacion?: number;
  visible_publico?: boolean;
  tipo?: string;
}

export interface Categoria {
  id?: number;
  created_at?: string | null;
  updated_at?: string | null;
  nombre: string;
}

export interface Rol {
  id: number;
  created_at: string | null;
  updated_at: string | null;
  nombre: string;
}

export interface Proveedor {
  id: number;
  rol: Rol;
  created_at: string | null;
  updated_at: string | null;
  nombre: string;
  rubro: string | null;
  num_viajes: number;
  telefono: string | null;
  fecha_nacimiento: string | null;
  genero: string | null;
  documento_identidad: string | null;
  pais: string | null;
  user: number;
}
