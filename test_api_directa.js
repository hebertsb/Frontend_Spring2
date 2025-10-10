// Test directo con la API para identificar campos requeridos
const axios = require('axios');

// Configurar base URL
axios.defaults.baseURL = 'https://web-production-64f6.up.railway.app/api/';

// Token de ejemplo (necesitarás usar uno válido)
const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzU4NDE0OTY0LCJpYXQiOjE3NTg0MTEzNjQsImp0aSI6ImQ5NmE1OGJkNjcwMzQ1NWNhYTY4YjlkNzVhMzVjNGE4IiwidXNlcl9pZCI6MTR9.q4Hbo1TXFT_EfPfGh2J8GdjUbJK6DUwLYqBH6YmiBaY';

// Test 1: Payload mínimo
async function testPayloadMinimo() {
  console.log('🧪 TEST 1: Payload mínimo...');
  
  const payload = {
    usuario: 14,
    fecha_inicio: "2025-09-30",
    estado: "PENDIENTE",
    total: 112,
    moneda: "USD"
  };
  
  try {
    const response = await axios.post('/reservas/', payload, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Éxito con payload mínimo:', response.data);
  } catch (error) {
    console.log('❌ Error con payload mínimo:', error.response?.data);
  }
}

// Test 2: Payload con servicios y acompañantes
async function testPayloadCompleto() {
  console.log('🧪 TEST 2: Payload completo...');
  
  const payload = {
    usuario: 14,
    fecha_inicio: "2025-09-30",
    fecha_fin: "2025-09-30",
    estado: "PENDIENTE",
    total: 112,
    moneda: "USD",
    numero_reprogramaciones: 0,
    notas: "",
    servicios: [{
      servicio_id: 2,  // Usar servicio_id en lugar de servicio
      cantidad_personas: 1,
      precio_unitario: 112,
      subtotal: 112,
      fecha_servicio: "2025-09-30"
    }],
    acompanantes: [{
      nombre: "Hebert Suarez",
      apellido: "Burgos",
      tipo_documento: "CI",
      numero_documento: "1234567898",
      telefono: "+591 70123456",
      email: "suarezburgoshebert@gmail.com",
      fecha_nacimiento: "1990-01-01",
      nacionalidad: "Boliviana",
      es_titular: true
    }]
  };
  
  try {
    const response = await axios.post('/reservas/', payload, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Éxito con payload completo:', response.data);
  } catch (error) {
    console.log('❌ Error con payload completo:', error.response?.data);
  }
}

// Test 3: Payload con diferentes variaciones de campos
async function testVariacionesCampos() {
  console.log('🧪 TEST 3: Variaciones de campos...');
  
  const variaciones = [
    {
      nombre: "Con servicio en lugar de servicio_id",
      servicios: [{ servicio: 2, cantidad_personas: 1, precio_unitario: 112, subtotal: 112, fecha_servicio: "2025-09-30" }]
    },
    {
      nombre: "Con id_servicio en lugar de servicio",
      servicios: [{ id_servicio: 2, cantidad_personas: 1, precio_unitario: 112, subtotal: 112, fecha_servicio: "2025-09-30" }]
    },
    {
      nombre: "Con paquete en lugar de servicio",
      servicios: [{ paquete: 2, cantidad_personas: 1, precio_unitario: 112, subtotal: 112, fecha_servicio: "2025-09-30" }]
    }
  ];
  
  for (const variacion of variaciones) {
    console.log(`\n🔍 Probando: ${variacion.nombre}`);
    
    const payload = {
      usuario: 14,
      fecha_inicio: "2025-09-30",
      estado: "PENDIENTE",
      total: 112,
      moneda: "USD",
      servicios: variacion.servicios,
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
    
    try {
      const response = await axios.post('/reservas/', payload, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Éxito:', response.data);
      break; // Si funciona, salir del loop
    } catch (error) {
      console.log('❌ Error:', error.response?.data);
    }
  }
}

// Ejecutar tests
async function ejecutarTests() {
  console.log('🚀 Iniciando tests de API directa...\n');
  
  await testPayloadMinimo();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await testPayloadCompleto();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await testVariacionesCampos();
  
  console.log('\n🏁 Tests completados');
}

ejecutarTests();