// Test para debug del backend local
const axios = require('axios');

async function testLocalBackend() {
  console.log('🧪 Testing localhost:8000 backend...\n');
  
  try {
    // 1. Test básico del API
    console.log('1️⃣ Testing basic API endpoint...');
    const apiResponse = await axios.get('http://localhost:8000/api/');
    console.log('✅ API Status:', apiResponse.status);
    console.log('✅ API Response:', apiResponse.data);
    
    // 2. Test de servicios
    console.log('\n2️⃣ Testing servicios endpoint...');
    const serviciosResponse = await axios.get('http://localhost:8000/api/servicios/');
    console.log('✅ Servicios Status:', serviciosResponse.status);
    console.log('✅ Servicios disponibles:');
    serviciosResponse.data.forEach(servicio => {
      console.log(`   - ID: ${servicio.id}, Título: ${servicio.titulo}, Costo: ${servicio.costo}`);
    });
    
    // 3. Test con token (si tienes uno en localStorage del navegador)
    console.log('\n3️⃣ Testing con token simulado...');
    
    // Token de ejemplo (reemplaza con uno real si lo tienes)
    const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.example'; // Cambia esto por tu token real
    
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    try {
      const reservasResponse = await axios.get('http://localhost:8000/api/reservas/', config);
      console.log('✅ Reservas Status:', reservasResponse.status);
      console.log('✅ Reservas:', reservasResponse.data);
    } catch (authError) {
      console.log('⚠️ Auth Error (expected):', authError.response?.status, authError.response?.data);
    }
    
    // 4. Test payload de reserva (estructura esperada)
    console.log('\n4️⃣ Testing payload structure...');
    const testPayload = {
      "fecha_inicio": "2025-09-30T00:00:00.000Z",
      "estado": "PENDIENTE",
      "total": "250.00",
      "moneda": "BOB",
      "detalles": [
        {
          "servicio": 1,
          "cantidad": 1,
          "precio_unitario": "250.00",
          "fecha_servicio": "2025-09-30T00:00:00.000Z"
        }
      ],
      "acompanantes": [
        {
          "acompanante": {
            "documento": "12345678",
            "nombre": "Test",
            "apellido": "User",
            "fecha_nacimiento": "1990-01-01",
            "nacionalidad": "Boliviana",
            "email": "test@email.com"
          },
          "estado": "CONFIRMADO",
          "es_titular": true
        }
      ]
    };
    
    console.log('📋 Payload de prueba:', JSON.stringify(testPayload, null, 2));
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
    if (error.response) {
      console.error('❌ Response Status:', error.response.status);
      console.error('❌ Response Data:', error.response.data);
    }
  }
}

testLocalBackend();