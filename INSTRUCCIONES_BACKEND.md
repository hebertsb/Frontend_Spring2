# 🚀 CÓMO INICIAR EL BACKEND DJANGO

## 📋 Instrucciones para ejecutar tu backend Django

Para que el frontend funcione correctamente, necesitas tener tu backend Django ejecutándose en el puerto 8000.

### 1️⃣ Navega a tu directorio del backend
```bash
cd D:\Sis2\backend-turismo
```

### 2️⃣ Activa tu entorno virtual (si tienes uno)
```bash
# En Windows
venv\Scripts\activate

# En Linux/Mac
source venv/bin/activate
```

### 3️⃣ Instala las dependencias (si es necesario)
```bash
pip install -r requirements.txt
```

### 4️⃣ Ejecuta las migraciones (si es necesario)
```bash
python manage.py migrate
```

### 5️⃣ Inicia el servidor Django
```bash
python manage.py runserver
```

### ✅ Verificación
Tu backend debería estar disponible en:
- **URL del servidor**: http://127.0.0.1:8000/
- **API de registro**: http://127.0.0.1:8000/api/auth/register/

### 🔧 Configuración del Frontend
El frontend está configurado para conectarse automáticamente a:
```
http://127.0.0.1:8000/api/
```

Si tu backend está en otra URL, puedes cambiarla en el archivo `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://tu-servidor:puerto/api/
```

### 🎯 Una vez que el backend esté ejecutándose:
1. Recarga la página de login
2. Deberías ver "✅ Backend conectado correctamente"
3. Ahora puedes usar el formulario de registro

---

## 📝 Cambios Realizados en el Frontend

### ✅ Problemas Solucionados:
1. **IDs Duplicados**: Agregué prefijos únicos (`register-*`) a todos los campos del formulario de registro
2. **Campos Actualizados**: 
   - ✅ `nombres` y `apellidos` (separados)
   - ✅ `fecha_nacimiento` 
   - ✅ `genero` (select con opciones)
   - ✅ `documento_identidad`
   - ✅ `pais`
3. **Validaciones Frontend**: 
   - ✅ Campos requeridos
   - ✅ Formato de email
   - ✅ Contraseña mínimo 8 caracteres
   - ✅ Confirmación de contraseña
   - ✅ Mayor de edad (18 años)
   - ✅ Solo letras para nombres/apellidos
4. **Mejor UX**: 
   - ✅ Formulario organizado por secciones
   - ✅ Iconos descriptivos
   - ✅ Indicadores de campos requeridos (*)
   - ✅ Mensajes de error específicos
   - ✅ Estado de conexión del backend

### 🎨 Estructura del Formulario:
```
📋 INFORMACIÓN PERSONAL
- Nombres * (requerido)
- Apellidos * (requerido)  
- Fecha de Nacimiento
- Género (Masculino/Femenino/Otro/Prefiero no decir)

📧 DATOS DE CONTACTO  
- Email * (requerido)
- Teléfono
- País

🆔 IDENTIFICACIÓN
- Documento de Identidad (CI o Pasaporte)

🔐 SEGURIDAD
- Contraseña * (mínimo 8 caracteres)
- Confirmar Contraseña * (debe coincidir)
```

¡Ahora tu frontend está listo para funcionar con el nuevo backend!
