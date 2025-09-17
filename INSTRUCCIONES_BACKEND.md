# 🚨 PREGUNTAS CRÍTICAS PARA EL ASISTENTE DE BACKEND

## ✅ **VULNERABILIDAD DE SEGURIDAD - RESUELTA**

### **🔥 CONFIRMACIÓN DE SEGURIDAD:**

**PROBLEMA ANTERIOR:** C### **Frontend (CORREGIDO):**
- ID 1 = ADMIN ✅
- ID 2 = OPERADOR ✅
- ID 3 = CLIENTE ✅
- **ID 4 = SOPORTE** ✅

## ✅ **ACCIÓN COMPLETADA:**

**EL FRONTEND HA SIDO CORREGIDO** - El mapeo de roles ahora está alineado con el backend.

### **Archivos actualizados:**
1. ✅ `src/context/AuthContext.tsx` - ROLE_MAP corregido
2. ✅ `src/components/admin-dashboard.tsx` - ROLE_MAP y verificaciones corregidas
3. ✅ `src/components/comunes/navegacion.tsx` - Verificaciones de rol corregidas
4. ✅ `src/components/nav-user.tsx` - Verificaciones de rol corregidas
5. ✅ `src/components/ProtectedRoute.tsx` - Mapeo de roles corregido
6. ✅ `src/app/panel/page.tsx` - allowedRoles corregido [1, 4]

## Resumen de acción recomendada

1. **✅ Verificar** el rol actual del usuario con las consultas SQL.
2. **✅ Asignar** rol SOPORTE (ID 4) si no lo tiene usando `/api/usuarios/{id}/asignar-rol/`
3. **✅ CORREGIR** el mapeo de roles en el frontend para que coincida con el backend (COMPLETADO)
4. **🔄 Confirmar** que el usuario aparezca correctamente como SOPORTEpodía usar su propio token para cambiar la contraseña de otro usuario.

**✅ CONFIRMADO POR BACKEND:** **El token solo puede ser usado por el email que lo solicitó.**

---

# 📋 Documentación de integración para recuperación de contraseña (backend)

---

## 1. Flujo de recuperación de contraseña
- El usuario ingresa su email en el formulario de recuperación.
- El backend genera un token largo y lo envía por correo.
- El usuario debe copiar el token/código recibido y pegarlo en el frontend.
- Luego, el usuario ingresa su nueva contraseña junto con el token **y su email**.

## 2. APIs disponibles
- POST /api/auth/solicitar-recuperacion-password/
  - Parámetros: `{ "email": "usuario@ejemplo.com" }`
  - Respuesta: `{ "detail": "Si el email existe, se enviará un enlace de recuperación." }`
- POST /api/auth/reset-password/
  - Parámetros:
    ```json
    {
      "email": "usuario@ejemplo.com",
      "token": "wHxjKgJNayEwrU9He9dbLxWeLn59Oykf7q4ZVMQUC6mx19Cb",
      "password": "nuevaPassword123"
    }
    ```
  - Respuesta:
    - Éxito: `{ "detail": "Contraseña restablecida correctamente." }`
    - Token inválido/expirado: `{ "detail": "Token inválido o expirado." }` (status 400 o 401)
    - Usuario no encontrado: `{ "detail": "Usuario no encontrado" }` (status 404)

## 3. Token/código
- El token se debe enviar en el body del POST a `/api/auth/reset-password/` junto con el email y la nueva contraseña.
- No hay endpoint específico solo para validar el token, la validación ocurre al restablecer la contraseña.
- El token expira en 1 hora desde que se genera.
- El token **solo es válido para el email que lo solicitó**.

## 4. Endpoint de restablecer
- POST /api/auth/reset-password/
- Body:
  ```json
  {
    "email": "usuario@ejemplo.com",
    "token": "wHxjKgJNayEwrU9He9dbLxWeLn59Oykf7q4ZVMQUC6mx19Cb",
    "password": "nuevaPassword123"
  }
  ```
- Es obligatorio enviar el email, el token y la nueva contraseña.

## 5. Respuestas esperadas
- /solicitar-recuperacion-password/
  - Siempre responde: `{ "detail": "Si el email existe, se enviará un enlace de recuperación." }` (status 200)
- /reset-password/
  - Éxito: `{ "detail": "Contraseña restablecida correctamente." }` (status 200)
  - Token inválido/expirado: `{ "detail": "Token inválido o expirado." }` (status 400 o 401)
  - Usuario no encontrado: `{ "detail": "Usuario no encontrado" }` (status 404)
  - Otros errores: mensajes estándar de validación.

---

### Notas adicionales
- El flujo actual del frontend (email → código → nueva contraseña) es compatible con el backend.
- El token es un string largo, no un código de 6 dígitos.
- El backend nunca revela si el email existe o no.
- **El token solo puede ser usado por el email que lo solicitó.**

---

## 📝 **Estado de implementación:**
- ✅ **Frontend:** Configurado para enviar SIEMPRE: email + token + password
- ✅ **Backend:** Valida correctamente la asociación email-token
- ✅ **Seguridad:** Token vinculado al email específico
- ✅ **Flujo completo:** Compatible y funcional

---

# ⚠️ **PROBLEMA ACTUAL: ROL SOPORTE NO SE MUESTRA CORRECTAMENTE**

## 🚨 **PROBLEMA DETECTADO:**

El usuario "soporte@autonoma.edu.bo" aparece con rol "USUARIO" en el frontend cuando debería aparecer con rol "SOPORTE".

## ✅ **RESPUESTA DEL BACKEND:**

# 🔒 Gestión y verificación de roles para usuario SOPORTE

## 1. Verificar rol actual del usuario "soporte@autonoma.edu.bo"

- Consulta SQL para usuario:
  ```sql
  SELECT * FROM authz_usuario WHERE email = 'soporte@autonoma.edu.bo';
  ```
- Consulta SQL para roles asociados:
  ```sql
  SELECT * FROM authz_usuario_roles WHERE usuario_id = (SELECT id FROM authz_usuario WHERE email = 'soporte@autonoma.edu.bo');
  ```

## 2. Verificar todos los roles disponibles

- Consulta SQL:
  ```sql
  SELECT * FROM authz_rol ORDER BY id;
  ```
- **🚨 ROLES SEGÚN EL BACKEND:**
  - **ID 1 = ADMIN**
  - **ID 2 = OPERADOR** 
  - **ID 3 = CLIENTE**
  - **ID 4 = SOPORTE** ⚠️ **DIFERENTE AL FRONTEND**

## 3. Verificar endpoint de listado de usuarios

- Endpoint: `GET /api/usuarios/`
- Respuesta esperada para usuario soporte:
  ```json
  {
    "id": 4,
    "email": "soporte@autonoma.edu.bo",
    "nombres": "Soporte",
    "apellidos": "Sistema",
    "roles": [4],
    "estado": "ACTIVO"
    // ...otros campos
  }
  ```

## 4. Asignar/cambiar rol SOPORTE

- Endpoint disponible:
  ```
  POST /api/usuarios/{id}/asignar-rol/
  Body: { "rol": "SOPORTE" }
  ```
- Alternativa SQL:
  ```sql
  UPDATE authz_usuario_roles SET rol_id = 4 WHERE usuario_id = 4;
  ```

## 5. Estructura de respuesta de usuario

- Respuesta esperada:
  ```json
  {
    "id": 4,
    "email": "soporte@autonoma.edu.bo",
    "nombres": "Soporte",
    "apellidos": "Sistema",
    "roles": [4],
    "estado": "ACTIVO"
    // ...otros campos
  }
  ```
- El campo `roles` es un array de IDs. Si tiene múltiples roles, aparecerán todos los IDs.

---

## 🔧 **PROBLEMA IDENTIFICADO - DISCREPANCIA DE IDs:**

### **Backend (correcto):**
- ID 1 = ADMIN
- ID 2 = OPERADOR  
- ID 3 = CLIENTE
- **ID 4 = SOPORTE** ✅

### **Frontend (incorrecto):**
- ID 1 = ADMIN
- ID 2 = OPERADOR
- ID 3 = CLIENTE
- ID 4 = USUARIO ❌
- **ID 5 = SOPORTE** ❌

## � **ACCIÓN REQUERIDA:**

**EL FRONTEND NECESITA CORRECCIÓN** - El mapeo de roles está desalineado con el backend.

## Resumen de acción recomendada

1. **✅ Verificar** el rol actual del usuario con las consultas SQL.
2. **✅ Asignar** rol SOPORTE (ID 4) si no lo tiene usando `/api/usuarios/{id}/asignar-rol/`
3. **🔧 CORREGIR** el mapeo de roles en el frontend para que coincida con el backend
4. **✅ Confirmar** que el usuario aparezca correctamente como SOPORTE

---

# ⚠️ **Nota sobre error 404 en recuperación de contraseña**

Si ves un error como:

```
127.0.0.1:8000/api/api/auth/solicitar-recuperacion-password/:1   Failed to load resource: the server responded with a status of 404 (Not Found)
```

Significa que la URL está mal formada (tiene `/api/api/`).

**Causa:** El `baseURL` en axios.ts ya incluye `/api/` (`http://127.0.0.1:8000/api/`), por lo que usar `/api/auth/...` duplica la ruta.

**✅ Solución aplicada:**
- ✅ Rutas corregidas en `auth.ts`:
  - `/auth/solicitar-recuperacion-password/` (sin el `/api/` inicial)
  - `/auth/reset-password/` (sin el `/api/` inicial)

**URLs finales correctas:**
- `http://127.0.0.1:8000/api/auth/solicitar-recuperacion-password/`
- `http://127.0.0.1:8000/api/auth/reset-password/`

Esto asegura que el endpoint funcione correctamente y no devuelva 404.