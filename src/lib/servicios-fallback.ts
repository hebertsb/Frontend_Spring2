import { Servicio } from './servicios';

// Minimal fallback dataset compatible with `Servicio` interface
export const serviciosFallback: Servicio[] = [
  {
    id: 1,
    titulo: 'Salar de Uyuni Completo',
    descripcion_servicio: 'Visita el desierto de sal más grande del mundo...',
    tipo: 'Tour',
    costo: 1200,
    categoria: { id: 1, nombre: 'Aventura', created_at: null, updated_at: null },
    dias: 3,
    descripcion: 'Experiencia completa en el Salar de Uyuni',
    incluido: ['Transporte 4x4', 'Guía', 'Alojamiento'],
    calificacion: 4.8,
    imagenes: ['/salar-de-uyuni-espejo.png'],
  },
  {
    id: 2,
    titulo: 'Lago Titicaca Sagrado',
    descripcion_servicio: 'Explora el lago navegable más alto del mundo...',
    tipo: 'Cultural',
    costo: 800,
    categoria: { id: 2, nombre: 'Cultural', created_at: null, updated_at: null },
    dias: 2,
    descripcion: 'Descubre los misterios del Lago Titicaca',
    incluido: ['Transporte', 'Guía', 'Alojamiento'],
    calificacion: 4.6,
    imagenes: ['/lago-titicaca.png'],
  },
  {
    id: 3,
    titulo: 'Madidi Amazon Adventure',
    descripcion_servicio: 'Inmersión en la selva amazónica',
    tipo: 'Naturaleza',
    costo: 950,
    categoria: { id: 3, nombre: 'Naturaleza', created_at: null, updated_at: null },
    dias: 4,
    descripcion: 'Aventura en el Parque Nacional Madidi',
    incluido: ['Vuelo', 'Lodge', 'Comidas'],
    calificacion: 4.7,
    imagenes: ['/madidi.png'],
  },
];