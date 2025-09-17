export type Categoria = {
  id: number;
  nombre: string;
};

export type Servicio = {
  id: number;
  titulo: string;
  descripcion: string;
  tipo: string;
  costo: number;
  categoria: Categoria;
  visible_publico: boolean;
  created_at: string;
  updated_at: string;
};

export type Destino = {
  id: number;
  nombre: string;
  dias: number;
  descripcion: string;
  created_at: string;
  updated_at: string;
};

export type Itinerario = {
  id: number;
  dia: number;
  titulo: string;
  actividades: string[];
  created_at: string;
  updated_at: string;
};

export type Paquete = {
  id: number;
  nombre: string;
  ubicacion: string;
  descripcion_corta: string;
  descripcion_completa: string;
  calificacion: number;
  numero_reseñas: number;
  precio: string;
  precio_original: string;
  duracion: string;
  max_personas: number;
  dificultad: string;
  categoria: Categoria;
  imagenes: string[];
  destinos: Destino[];
  itinerario: Itinerario[];
  incluido: string[];
  no_incluido: string[];
  fechas_disponibles: string[];
  descuento?: number;
  created_at: string;
  updated_at: string;
};
