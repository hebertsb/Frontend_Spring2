import { Servicio } from './servicios';

// Datos de fallback para cuando la API no esté disponible
export const serviciosFallback: Servicio[] = [
  {
    id: "1",
    titulo: "Salar de Uyuni Completo",
    descripcion_servicio: "Visita el desierto de sal más grande del mundo con tours diurnos y nocturnos para ver el espejo del cielo y las estrellas",
    tipo: "Tour",
    costo: 1200,
    categoria: { nombre: "Aventura" },
    dias: 3,
    descripcion: "Experiencia completa en el Salar de Uyuni incluyendo isla Incahuasi, Hotel de Sal y fotografías únicas",
    incluido: [
      "Transporte 4x4",
      "Guía especializado",
      "Alojamiento 2 noches",
      "Todas las comidas",
      "Entrada al Salar"
    ],
    calificacion: 4.8,
    visible_publico: true,
    imagenes: ["/salar-de-uyuni-espejo.png", "/salar-de-uyuni-atardecer.png", "/isla-incahuasi-cactus.png"],
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-05-20T15:30:00Z"
  },
  {
    id: "2",
    titulo: "Lago Titicaca Sagrado",
    descripcion_servicio: "Explora el lago navegable más alto del mundo, visita Copacabana, Isla del Sol y conoce la cultura andina",
    tipo: "Cultural",
    costo: 800,
    categoria: { nombre: "Cultural" },
    dias: 2,
    descripcion: "Descubre los misterios del Lago Titicaca y la rica cultura de los pueblos originarios",
    incluido: [
      "Transporte desde La Paz",
      "Guía local",
      "Alojamiento 1 noche",
      "Desayuno y almuerzo",
      "Paseos en bote"
    ],
    calificacion: 4.6,
    visible_publico: true,
    imagenes: ["/lago-titicaca-bolivia-panorama.png", "/copacabana-bolivia.png", "/isla-del-sol-ruinas.png"],
    created_at: "2024-02-01T10:00:00Z",
    updated_at: "2024-05-15T12:00:00Z"
  },
  {
    id: "3",
    titulo: "Madidi Amazon Adventure",
    descripcion_servicio: "Inmersión total en la selva amazónica boliviana con observación de vida silvestre y experiencias auténticas",
    tipo: "Naturaleza",
    costo: 950,
    categoria: { nombre: "Naturaleza" },
    dias: 4,
    descripcion: "Aventura en el Parque Nacional Madidi, uno de los lugares con mayor biodiversidad del planeta",
    incluido: [
      "Vuelo La Paz - Rurrenabaque",
      "Lodge en la selva",
      "Todas las comidas",
      "Guía naturalista",
      "Actividades de observación"
    ],
    calificacion: 4.7,
    visible_publico: true,
    imagenes: ["/madidi-amazon-rainforest.png", "/bolivian-pink-flamingos.png"],
    created_at: "2024-03-10T10:00:00Z",
    updated_at: "2024-05-10T14:20:00Z"
  },
  {
    id: "4",
    titulo: "Tiwanaku Arqueológico",
    descripcion_servicio: "Descubre los misterios de la civilización Tiwanaku, cultura preincaica de gran importancia histórica",
    tipo: "Cultural",
    costo: 450,
    categoria: { nombre: "Arqueología" },
    dias: 1,
    descripcion: "Visita guiada a las ruinas de Tiwanaku con explicación detallada de la cultura precolombina",
    incluido: [
      "Transporte desde La Paz",
      "Guía arqueólogo",
      "Entrada al sitio",
      "Almuerzo tradicional",
      "Museo"
    ],
    calificacion: 4.4,
    visible_publico: true,
    imagenes: ["/tiwanaku-community.png", "/aymara-culture-bolivia.png"],
    created_at: "2024-03-20T10:00:00Z",
    updated_at: "2024-05-08T11:15:00Z"
  },
  {
    id: "5",
    titulo: "Bolivia Andes Trekking",
    descripcion_servicio: "Trekking de alta montaña en la Cordillera Real con vistas espectaculares de los Andes bolivianos",
    tipo: "Aventura",
    costo: 1350,
    categoria: { nombre: "Montañismo" },
    dias: 5,
    descripcion: "Experiencia de trekking para aventureros en busca de paisajes únicos y desafío físico",
    incluido: [
      "Guía de montaña certificado",
      "Equipo de camping",
      "Todas las comidas",
      "Transporte local",
      "Permisos de escalada"
    ],
    calificacion: 4.9,
    visible_publico: true,
    imagenes: ["/bolivia-andes-trekking.png", "/bolivia-honeymoon-sunset.png"],
    created_at: "2024-04-05T10:00:00Z",
    updated_at: "2024-05-05T16:45:00Z"
  },
  {
    id: "6",
    titulo: "Cochabamba Gastronómica",
    descripcion_servicio: "Tour gastronómico por los mercados tradicionales y restaurantes emblemáticos de Cochabamba",
    tipo: "Gastronomía",
    costo: 380,
    categoria: { nombre: "Gastronomía" },
    dias: 1,
    descripcion: "Descubre los sabores auténticos de la cocina boliviana en la capital gastronómica del país",
    incluido: [
      "Guía gastronómico",
      "Degustaciones en mercados",
      "Almuerzo tradicional",
      "Clase de cocina",
      "Recetas para llevar"
    ],
    calificacion: 4.5,
    visible_publico: true,
    imagenes: ["/bolivian-food-market-cochabamba.png"],
    created_at: "2024-04-15T10:00:00Z",
    updated_at: "2024-05-03T13:30:00Z"
  },
  {
    id: "7",
    titulo: "Hotel de Sal Experience",
    descripcion_servicio: "Experiencia única durmiendo en un hotel construido completamente de sal en el Salar de Uyuni",
    tipo: "Lujo",
    costo: 850,
    categoria: { nombre: "Lujo" },
    dias: 2,
    descripcion: "Combina la aventura del Salar con el lujo de un alojamiento único en el mundo",
    incluido: [
      "Alojamiento en Hotel de Sal",
      "Tour privado del Salar",
      "Cena gourmet",
      "Observación de estrellas",
      "Traslados incluidos"
    ],
    calificacion: 4.6,
    visible_publico: true,
    imagenes: ["/hotel-de-sal-bolivia.png", "/salar-de-uyuni-espejo.png"],
    created_at: "2024-05-01T10:00:00Z",
    updated_at: "2024-05-18T09:20:00Z"
  },
  {
    id: "8",
    titulo: "Totora Boats Titicaca",
    descripcion_servicio: "Navegación tradicional en botes de totora por el Lago Titicaca, técnica ancestral aún vigente",
    tipo: "Cultural",
    costo: 320,
    categoria: { nombre: "Tradiciones" },
    dias: 1,
    descripcion: "Experimenta la navegación tradicional andina en embarcaciones hechas de totora",
    incluido: [
      "Paseo en bote de totora",
      "Guía cultural",
      "Demostración de construcción",
      "Almuerzo típico",
      "Transporte local"
    ],
    calificacion: 4.3,
    visible_publico: true,
    imagenes: ["/totora-boats-titicaca.png", "/lago-titicaca-bolivia-panorama.png"],
    created_at: "2024-05-10T10:00:00Z",
    updated_at: "2024-05-16T14:10:00Z"
  },
  {
    id: "9",
    titulo: "Bolivia Complete Journey",
    descripcion_servicio: "Gran tour que combina los principales destinos de Bolivia: Uyuni, Titicaca, La Paz y selva amazónica",
    tipo: "Tour Completo",
    costo: 2400,
    categoria: { nombre: "Tour Completo" },
    dias: 8,
    descripcion: "El viaje más completo para conocer la diversidad natural y cultural de Bolivia",
    incluido: [
      "Todos los traslados",
      "Alojamiento 7 noches",
      "Guías especializados",
      "Todas las comidas",
      "Actividades incluidas",
      "Vuelos internos"
    ],
    calificacion: 4.8,
    visible_publico: true,
    imagenes: ["/bolivia-tour-uyuni-titicaca.png", "/bolivia-honeymoon-sunset.png"],
    created_at: "2024-05-20T10:00:00Z",
    updated_at: "2024-05-25T17:00:00Z"
  }
];