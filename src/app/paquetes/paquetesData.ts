export interface Paquete {
  id: string;
  nombre: string;
  ubicacion: string;
  descripcionCorta: string;
  precio: string;
  precioOriginal: string;
  duracion: string;
  maxPersonas: number;
  calificacion: number;
  numeroReseñas: number;
  categoria: string;
  dificultad: string;
  descuento: number;
  imagenes: string[];
  fechaCreacion: string;
}

export const paquetesData: Paquete[] = [
  {
    id: "1",
    nombre: "Salar de Uyuni 3 Días",
    ubicacion: "Uyuni, Potosí",
    descripcionCorta: "Aventura única en el desierto de sal más grande del mundo",
    precio: "Bs. 1,200",
    precioOriginal: "Bs. 1,500",
    duracion: "3 días, 2 noches",
    maxPersonas: 8,
    calificacion: 4.8,
    numeroReseñas: 124,
    categoria: "Aventura",
    dificultad: "Moderada",
    descuento: 20,
    imagenes: ["/salar-de-uyuni-espejo.png", "/salar-de-uyuni-atardecer.png", "/isla-incahuasi-cactus.png"],
    fechaCreacion: "2024-01-15"
  },
  {
    id: "2", 
    nombre: "Lago Titicaca y Copacabana",
    ubicacion: "La Paz",
    descripcionCorta: "Explora el lago navegable más alto del mundo y sus islas sagradas",
    precio: "Bs. 800",
    precioOriginal: "",
    duracion: "2 días, 1 noche",
    maxPersonas: 12,
    calificacion: 4.6,
    numeroReseñas: 89,
    categoria: "Cultural",
    dificultad: "Fácil",
    descuento: 0,
    imagenes: ["/lago-titicaca-bolivia-panorama.png", "/copacabana-bolivia.png", "/isla-del-sol-ruinas.png"],
    fechaCreacion: "2024-02-01"
  },
  {
    id: "3",
    nombre: "Madidi Amazon Experience",
    ubicacion: "Rurrenabaque, Beni",
    descripcionCorta: "Inmersión total en la selva amazónica boliviana",
    precio: "Bs. 950",
    precioOriginal: "Bs. 1,100",
    duracion: "4 días, 3 noches",
    maxPersonas: 10,
    calificacion: 4.7,
    numeroReseñas: 76,
    categoria: "Naturaleza",
    dificultad: "Moderada",
    descuento: 14,
    imagenes: ["/madidi-amazon-rainforest.png", "/bolivian-pink-flamingos.png"],
    fechaCreacion: "2024-03-10"
  },
  {
    id: "4",
    nombre: "Tiwanaku Cultural",
    ubicacion: "Tiwanaku, La Paz",
    descripcionCorta: "Descubre los misterios de la civilización Tiwanaku",
    precio: "Bs. 450",
    precioOriginal: "",
    duracion: "1 día",
    maxPersonas: 15,
    calificacion: 4.4,
    numeroReseñas: 112,
    categoria: "Cultural",
    dificultad: "Fácil",
    descuento: 0,
    imagenes: ["/tiwanaku-community.png", "/aymara-culture-bolivia.png"],
    fechaCreacion: "2024-03-20"
  },
  {
    id: "5",
    nombre: "Bolivia Andes Trekking",
    ubicacion: "Cordillera Real, La Paz",
    descripcionCorta: "Trekking de alta montaña en los Andes bolivianos",
    precio: "Bs. 1,350",
    precioOriginal: "Bs. 1,600",
    duracion: "5 días, 4 noches",
    maxPersonas: 8,
    calificacion: 4.9,
    numeroReseñas: 67,
    categoria: "Aventura",
    dificultad: "Alta",
    descuento: 16,
    imagenes: ["/bolivia-andes-trekking.png", "/bolivia-honeymoon-sunset.png"],
    fechaCreacion: "2024-04-05"
  },
  {
    id: "6",
    nombre: "Cochabamba Gastronómica",
    ubicacion: "Cochabamba",
    descripcionCorta: "Tour gastronómico por los mercados y cocinas tradicionales",
    precio: "Bs. 380",
    precioOriginal: "",
    duracion: "1 día",
    maxPersonas: 12,
    calificacion: 4.5,
    numeroReseñas: 98,
    categoria: "Gastronomía",
    dificultad: "Fácil",
    descuento: 0,
    imagenes: ["/bolivian-food-market-cochabamba.png"],
    fechaCreacion: "2024-04-15"
  },
  {
    id: "7",
    nombre: "Hotel de Sal Uyuni",
    ubicacion: "Uyuni, Potosí",
    descripcionCorta: "Experiencia única en hotel construido completamente de sal",
    precio: "Bs. 850",
    precioOriginal: "Bs. 950",
    duracion: "2 días, 1 noche",
    maxPersonas: 6,
    calificacion: 4.6,
    numeroReseñas: 54,
    categoria: "Lujo",
    dificultad: "Fácil",
    descuento: 11,
    imagenes: ["/hotel-de-sal-bolivia.png", "/salar-de-uyuni-espejo.png"],
    fechaCreacion: "2024-05-01"
  },
  {
    id: "8",
    nombre: "Totora Boats Titicaca",
    ubicacion: "Huatajata, La Paz",
    descripcionCorta: "Navegación tradicional en botes de totora por el Lago Titicaca",
    precio: "Bs. 320",
    precioOriginal: "",
    duracion: "Medio día",
    maxPersonas: 8,
    calificacion: 4.3,
    numeroReseñas: 43,
    categoria: "Cultural",
    dificultad: "Fácil",
    descuento: 0,
    imagenes: ["/totora-boats-titicaca.png", "/lago-titicaca-bolivia-panorama.png"],
    fechaCreacion: "2024-05-10"
  },
  {
    id: "9",
    nombre: "Bolivia Complete Tour",
    ubicacion: "Multi-destino",
    descripcionCorta: "Gran tour que incluye Uyuni, Titicaca, La Paz y más destinos",
    precio: "Bs. 2,400",
    precioOriginal: "Bs. 2,800",
    duracion: "8 días, 7 noches",
    maxPersonas: 12,
    calificacion: 4.8,
    numeroReseñas: 156,
    categoria: "Tour Completo",
    dificultad: "Moderada",
    descuento: 14,
    imagenes: ["/bolivia-tour-uyuni-titicaca.png", "/bolivia-honeymoon-sunset.png"],
    fechaCreacion: "2024-05-20"
  }
];
