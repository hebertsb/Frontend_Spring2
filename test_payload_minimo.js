// Test con payload mínimo para identificar campos requeridos
console.log('🧪 Iniciando test con payload mínimo...');

// Payload absolutamente mínimo
const payloadMinimo = {
  usuario: 14,
  fecha_inicio: "2025-09-30",
  estado: "PENDIENTE",
  total: 112,
  moneda: "USD"
};

console.log('📋 Payload mínimo:');
console.log(JSON.stringify(payloadMinimo, null, 2));

// Payload con servicios básicos
const payloadConServicios = {
  usuario: 14,
  fecha_inicio: "2025-09-30",
  estado: "PENDIENTE", 
  total: 112,
  moneda: "USD",
  numero_reprogramaciones: 0,
  notas: "",
  servicios: [{
    servicio: 2,
    cantidad_personas: 1,
    precio_unitario: 112,
    subtotal: 112,
    fecha_servicio: "2025-09-30"
  }]
};

console.log('\n📋 Payload con servicios:');
console.log(JSON.stringify(payloadConServicios, null, 2));

// Payload con acompañantes básicos
const payloadConAcompanantes = {
  ...payloadConServicios,
  acompanantes: [{
    nombre: "Hebert",
    apellido: "Suarez",
    tipo_documento: "CI",
    numero_documento: "123456789",
    telefono: "+591 70123456",
    email: "test@example.com",
    fecha_nacimiento: "1990-01-01",
    nacionalidad: "Boliviana",
    es_titular: true
  }]
};

console.log('\n📋 Payload con acompañantes:');
console.log(JSON.stringify(payloadConAcompanantes, null, 2));

console.log('\n🎯 Prueba estos payloads uno por uno en el frontend para ver cuál falla');