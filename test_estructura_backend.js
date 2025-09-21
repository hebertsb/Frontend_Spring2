// Test para verificar qué estructura espera exactamente el backend

console.log("🧪 TESTING: Estructuras de payload para el backend");

console.log("\n📋 ESTRUCTURA ACTUAL (con 'detalles'):");
const payloadConDetalles = {
  "usuario": 2,
  "fecha_inicio": "2024-01-15",
  "estado": "confirmado",
  "total": "1500.00",
  "moneda": "BOB",
  "detalles": [
    {
      "paquete": 1,
      "cantidad_personas": 2,
      "precio_unitario": "750.00",
      "subtotal": "1500.00"
    }
  ],
  "acompanantes": [
    {
      "acompanante": {
        "documento": {
          "tipo": "CI",
          "numero": "12345678"
        },
        "estado": "activo",
        "es_titular": true
      }
    }
  ]
};
console.log(JSON.stringify(payloadConDetalles, null, 2));

console.log("\n📋 ESTRUCTURA ALTERNATIVA (con 'servicios'):");
const payloadConServicios = {
  "usuario": 2,
  "fecha_inicio": "2024-01-15",
  "estado": "confirmado",
  "total": "1500.00",
  "moneda": "BOB",
  "servicios": [
    {
      "servicio": 1,
      "cantidad_personas": 2,
      "precio_unitario": "750.00",
      "subtotal": "1500.00",
      "fecha_servicio": "2024-01-15"
    }
  ],
  "acompanantes": [
    {
      "nombre": "Usuario",
      "apellido": "Titular", 
      "tipo_documento": "CI",
      "numero_documento": "12345678",
      "telefono": "123456789",
      "email": "usuario@test.com",
      "fecha_nacimiento": "1990-01-01",
      "nacionalidad": "Boliviana",
      "es_titular": true
    }
  ]
};
console.log(JSON.stringify(payloadConServicios, null, 2));

console.log("\n🤔 El backend puede esperar una de estas dos estructuras.");
console.log("El error 500 sugiere que hay un problema con la estructura que estamos enviando.");