# 🚨 VULNERABILIDAD DE SEGURIDAD - RECUPERACIÓN DE CONTRASEÑA

## ⚠️ **PROBLEMA CRÍTICO IDENTIFICADO**

### **Descripción:**
El sistema actual permite que cualquier usuario use su propio token de recuperación para cambiar la contraseña de cualquier otro usuario. Esto es una vulnerabilidad crítica de seguridad.

### **Escenario de exploit:**
1. Usuario A (víctima) solicita recuperación para `victima@email.com`
2. Usuario B (atacante) solicita recuperación para `atacante@email.com` 
3. Usuario B recibe token: `abc123xyz...`
4. Usuario B usa SU token para cambiar la contraseña de la cuenta de Usuario A

### **Causa raíz:**
El backend **NO está validando** que el token pertenezca al email especificado.

## 🔧 **SOLUCIÓN REQUERIDA EN BACKEND:**

### **Endpoint actual problemático:**
```http
POST /auth/reset-password/
{
  "email": "victima@email.com",
  "token": "token_de_otro_usuario", 
  "password": "nueva_password"
}
```

### **Validación necesaria en backend:**
```python
def reset_password(request):
    email = request.data.get('email')
    token = request.data.get('token')
    password = request.data.get('password')
    
    # ❌ PROBLEMA: Falta esta validación
    # ✅ SOLUCIÓN: Agregar esta validación
    reset_request = PasswordResetToken.objects.filter(
        email=email,
        token=token,
        is_active=True,
        expires_at__gt=timezone.now()
    ).first()
    
    if not reset_request:
        return Response({
            "error": "Token inválido o expirado para este email"
        }, status=400)
    
    # Cambiar contraseña solo si token pertenece al email
    user = User.objects.get(email=email)
    user.set_password(password)
    user.save()
    
    # Invalidar token después de uso
    reset_request.is_active = False
    reset_request.save()
```

## 🛡️ **MEDIDAS DE SEGURIDAD ADICIONALES:**

1. **Expiración de tokens:** Máximo 15-30 minutos
2. **Un solo uso:** Token se invalida después de usarse
3. **Rate limiting:** Máximo 3 intentos de reset por email por hora
4. **Logging:** Registrar todos los intentos de reset
5. **Validación de email:** Token debe pertenecer exactamente al email solicitado

## 📅 **PRIORIDAD:** CRÍTICA - Requiere corrección inmediata

### **Impacto:** 
- Cualquier usuario puede comprometer cualquier cuenta
- Violación masiva de privacidad y seguridad
- Posible pérdida total de confianza del usuario

### **Estado actual del frontend:**
- ✅ Actualizado para SIEMPRE enviar email + token + password
- ✅ Validación agregada para requerir ambos parámetros
- ✅ Logs mejorados para debugging

**El frontend ya está preparado para el flujo seguro. El backend debe implementar la validación correspondiente.**