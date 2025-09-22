// Test para debugging del problema de precios
console.log("🧪 Debugging problema de precios Madidi Amazon Experience");

// Simular diferentes formatos de precio que pueden llegar
const preciosTest = [
  "Bs. 950",
  "Bs. 950.00", 
  "950",
  950,
  "90.00",
  "90",
  90
];

console.log("\n=== PRUEBAS DE FORMATO DE PRECIO ===");

preciosTest.forEach((precio, index) => {
  console.log(`\nTest ${index + 1}: Precio original = ${precio} (${typeof precio})`);
  
  // Simular el procesamiento en reserva/page.tsx línea 53
  if (typeof precio === 'string') {
    const precioLimpio = precio.replace(/[$Bs\.,\s]/g, ''); 
    const precioNumerico = parseFloat(precioLimpio);
    console.log(`  - Precio limpio: "${precioLimpio}"`);
    console.log(`  - Precio numérico: ${precioNumerico}`);
  } else {
    console.log(`  - Ya es numérico: ${precio}`);
  }
});

console.log("\n=== ANÁLISIS DEL PROBLEMA ===");
console.log("Si el precio viene como 'Bs. 950' debería dar 950");
console.log("Pero en la reserva aparece 90.00");
console.log("Posibles causas:");
console.log("1. Error en el backend al guardar el precio");
console.log("2. Transformación incorrecta en algún punto");
console.log("3. División no intencional (950/10 = 95, 950/10.55 ≈ 90)");
console.log("4. Uso de datos de diferentes fuentes");

// Verificar si hay alguna operación que pueda convertir 950 en 90
console.log("\n=== OPERACIONES QUE CONVIERTEN 950 EN 90 ===");
console.log("950 / 10.56 =", 950 / 10.56);
console.log("950 / 10.55 =", 950 / 10.55);
console.log("950 / 10.6 =", 950 / 10.6);
console.log("950 * 0.095 =", 950 * 0.095);
console.log("950 - 860 =", 950 - 860);

console.log("\n🔍 Revisar logs del navegador para ver exactamente qué valores están fluyendo");