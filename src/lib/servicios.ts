export interface Categoria {
  nombre: string;
}

export interface Servicio {
  id: string;
  titulo: string;
  descripcion_servicio: string;
  tipo: string;
  costo: number;
  categoria: Categoria; // Relación con la categoría
  dias: number;
  descripcion: string;
  incluido: string[]; // Lista de elementos incluidos
  calificacion: number | null;
  visible_publico: boolean;
  imagenes: string[];
  created_at: string;
  updated_at: string;
}
