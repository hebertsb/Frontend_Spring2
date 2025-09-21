// Script de prueba para debugging de reservas
console.log("🧪 Iniciando test de reserva...");

// Simular datos de usuario típicos
const mockUser = {
  id: "1", // Esto se convertirá a parseInt(1) = 1
  email: "test@example.com",
  name: "Test User"
};

// Simular datos de reserva típicos como los que ves en la pantalla
const mockDatosReserva = {
  fecha_inicio: "2025-09-29", // Fecha futura
  cupon: "",
  notas: "Alergias alimentarias, necesidades especiales, celebraciones...",
  servicios: [
    {
      id: 2,
      nombre: "Lago Titicaca y Copacabana",
      precio: 112.00,
      cantidad_personas: 1
    }
  ],
  titular: {
    nombre: "Hebert",
    apellido: "Suarez",
    tipo_documento: "CI",
    numero_documento: "123456789",
    telefono: "+591 2 123-4567",
    email: "hebert@example.com",
    fecha_nacimiento: "1990-01-01",
    nacionalidad: "Boliviana",
    es_titular: true
  },
  acompanantes: [], // Sin acompañantes en este test
  aceptaTerminos: true
};

// Construir payload exactamente como lo hace la aplicación
const total = mockDatosReserva.servicios.reduce((sum, servicio) => 
  sum + (servicio.precio * servicio.cantidad_personas), 0
);

const payloadReserva = {
  usuario: parseInt(mockUser.id),
  fecha_inicio: mockDatosReserva.fecha_inicio,
  fecha_fin: mockDatosReserva.fecha_inicio, // Agregar fecha_fin
  estado: "PENDIENTE",
  cupon: mockDatosReserva.cupon || null,
  total: parseFloat(total.toString()),
  moneda: "USD",
  numero_reprogramaciones: 0,
  notas: mockDatosReserva.notas || "",
  
  servicios: mockDatosReserva.servicios.map(servicio => ({
    servicio: servicio.id,
    cantidad_personas: servicio.cantidad_personas,
    precio_unitario: parseFloat(servicio.precio.toString()),
    subtotal: parseFloat((servicio.precio * servicio.cantidad_personas).toString()),
    fecha_servicio: mockDatosReserva.fecha_inicio
  })),
  
  acompanantes: [
    {
      ...mockDatosReserva.titular,
      nombre: mockDatosReserva.titular.nombre || "",
      apellido: mockDatosReserva.titular.apellido || "",
      tipo_documento: mockDatosReserva.titular.tipo_documento || "CI",
      numero_documento: mockDatosReserva.titular.numero_documento || "",
      telefono: mockDatosReserva.titular.telefono || "",
      email: mockDatosReserva.titular.email || "",
      fecha_nacimiento: mockDatosReserva.titular.fecha_nacimiento || "",
      nacionalidad: mockDatosReserva.titular.nacionalidad || "Boliviana",
      es_titular: true
    },
    ...mockDatosReserva.acompanantes.map(acomp => ({
      ...acomp,
      nombre: acomp.nombre || "",
      apellido: acomp.apellido || "",
      tipo_documento: acomp.tipo_documento || "CI",
      numero_documento: acomp.numero_documento || "",
      telefono: acomp.telefono || "",
      email: acomp.email || "",
      fecha_nacimiento: acomp.fecha_nacimiento || "",
      nacionalidad: acomp.nacionalidad || "Boliviana",
      es_titular: false
    }))
  ]
};

console.log("📋 Payload generado:");
console.log(JSON.stringify(payloadReserva, null, 2));

console.log("\n🔍 Validaciones:");
console.log("✓ Usuario ID:", payloadReserva.usuario, "(tipo:", typeof payloadReserva.usuario, ")");
console.log("✓ Fecha inicio:", payloadReserva.fecha_inicio);
console.log("✓ Total:", payloadReserva.total, "(tipo:", typeof payloadReserva.total, ")");
console.log("✓ Servicios count:", payloadReserva.servicios.length);
console.log("✓ Acompañantes count:", payloadReserva.acompanantes.length);

// Verificar campos requeridos
const camposRequeridos = [
  'usuario', 'fecha_inicio', 'estado', 'total', 'moneda', 'servicios', 'acompanantes'
];

camposRequeridos.forEach(campo => {
  if (payloadReserva[campo] === undefined || payloadReserva[campo] === null) {
    console.log(`❌ Campo faltante: ${campo}`);
  } else {
    console.log(`✓ Campo presente: ${campo}`);
  }
});

console.log("\n🎯 Resumen del payload para envío a API:");