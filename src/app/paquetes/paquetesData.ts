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
export const paquetesData = [
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
    imagenes: ["/salar-de-uyuni-espejo.png", "/salar-de-uyuni-atardecer.png"],
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
    imagenes: ["/lago-titicaca-bolivia-panorama.png", "/copacabana-bolivia.png"],
    fechaCreacion: "2024-02-01"
  },
  // ...puedes agregar más paquetes aquí si es necesario
];
