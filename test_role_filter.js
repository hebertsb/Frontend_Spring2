// Test del filtro de roles
// Simulación para verificar que el filtro funciona correctamente

const ROLE_MAP = {
  1: "ADMIN",
  2: "OPERADOR", 
  3: "CLIENTE",
  4: "SOPORTE"
};

const testUsers = [
  { id: "1", email: "gabriel.moreno@autonoma.edu.bo", nombres: "Gabriel", apellidos: "Moreno", roles: [1], estado: "activo" },
  { id: "2", email: "maria.fernandez@autonoma.edu.bo", nombres: "María", apellidos: "Fernández", roles: [2], estado: "activo" },
  { id: "3", email: "juan.perez@autonoma.edu.bo", nombres: "Juan", apellidos: "Pérez", roles: [3], estado: "activo" },
  { id: "4", email: "soporte@autonoma.edu.bo", nombres: "Soporte", apellidos: "Sistema", roles: [4], estado: "activo" },
  { id: "5", email: "blancobautistaluisfernando@gmail.com", nombres: "Luis Fernando", apellidos: "Blanco Bautista", roles: [4], estado: "activo" }
];

function testRoleFilter(users, filterRole) {
  return users.filter(user => {
    if (filterRole === "todos") return true;
    
    const userRoleNames = (user.roles || []).map(roleId => ROLE_MAP[roleId]).filter(Boolean);
    return userRoleNames.includes(filterRole);
  });
}

// Tests
console.log("🧪 Test 1: Filtrar por SOPORTE");
console.log(testRoleFilter(testUsers, "SOPORTE"));
// Esperado: 2 usuarios (soporte@autonoma.edu.bo y blancobautistaluisfernando@gmail.com)

console.log("\n🧪 Test 2: Filtrar por ADMIN");
console.log(testRoleFilter(testUsers, "ADMIN"));
// Esperado: 1 usuario (gabriel.moreno@autonoma.edu.bo)

console.log("\n🧪 Test 3: Todos los roles");
console.log(testRoleFilter(testUsers, "todos"));
// Esperado: 5 usuarios (todos)

console.log("\n🧪 Test 4: Filtrar por CLIENTE");
console.log(testRoleFilter(testUsers, "CLIENTE"));
// Esperado: 1 usuario (juan.perez@autonoma.edu.bo)