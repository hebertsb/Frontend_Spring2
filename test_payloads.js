// Test de diferentes payloads basados en documentación del backend

// VERSIÓN 1: Basada en documentación CRUD template (lo que el backend devuelve)
const payloadV1 = {
  fecha_inicio: "2025-09-25",
  estado: "PENDIENTE", 
  total: "250.00", // STRING según template
  detalles: [{
    titulo: "Tour Salar de Uyuni",
    tipo: "TOUR",
    precio_unitario: "250.00", // STRING según template
    cantidad: 1
  }],
  notas: "Reserva de prueba"
};

// VERSIÓN 2: Mi implementación actual (lo que envío)
const payloadV2 = {
  fecha_inicio: "2025-09-25",
  estado: "PENDIENTE",
  total: 250, // NUMBER
  moneda: "BOB",
  detalles: [{
    servicio: 1,
    cantidad: 1,
    precio_unitario: 250, // NUMBER
    fecha_servicio: "2025-09-25"
  }],
  acompanantes: [{
    acompanante: {
      documento: "12345678",
      nombre: "Juan",
      apellido: "Pérez",
      fecha_nacimiento: "1990-01-01",
      nacionalidad: "Boliviana",
      email: "test@test.com"
    },
    estado: "CONFIRMADO",
    es_titular: true
  }]
};

// VERSIÓN 3: Híbrida - fields que aparecen en ambos
const payloadV3 = {
  fecha_inicio: "2025-09-25",
  estado: "PENDIENTE",
  total: 250.00,
  detalles: [{
    servicio: 1, // ID del servicio
    cantidad: 1,
    precio_unitario: 250.00
  }],
  acompanantes: [{
    documento: "12345678",
    nombre: "Juan", 
    apellido: "Pérez",
    fecha_nacimiento: "1990-01-01",
    nacionalidad: "Boliviana",
    email: "test@test.com",
    es_titular: true
  }]
};

console.log("PAYLOAD V1 (Template):", JSON.stringify(payloadV1, null, 2));
console.log("PAYLOAD V2 (Actual):", JSON.stringify(payloadV2, null, 2));
console.log("PAYLOAD V3 (Híbrido):", JSON.stringify(payloadV3, null, 2));