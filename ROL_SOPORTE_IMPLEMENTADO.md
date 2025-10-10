# Guía para solucionar error CORS y IDs duplicados en login (rol SOPORTE)

---

## 1. Error de CORS al hacer login

### 🛠️ Pasos para habilitar CORS en el backend

### 1.1 Identificar el framework
- ¿El backend es Django, FastAPI, Flask, Node.js, etc.?

### 1.2 Agregar el dominio de Netlify a la configuración de CORS

#### **Si usas Django + django-cors-headers:**
1. Instala el paquete si no lo tienes:
   ```bash
   pip install django-cors-headers
   ```
2. Agrega `'corsheaders'` a `INSTALLED_APPS` en `settings.py`.
3. Agrega el middleware al inicio de `MIDDLEWARE`:
   ```python
   'corsheaders.middleware.CorsMiddleware',
   ```
4. Agrega tu dominio Netlify a la lista de orígenes permitidos:
   ```python
   CORS_ALLOWED_ORIGINS = [
       "https://hilarious-lokum-3acdf9.netlify.app",
   ]
   ```
5. Reinicia el servidor backend.

#### **Si usas FastAPI:**
1. Instala el paquete CORS:
   ```bash
   pip install fastapi[all]
   ```
2. Agrega el middleware en tu archivo principal:
   ```python
   from fastapi.middleware.cors import CORSMiddleware

   app.add_middleware(
       CORSMiddleware,
       allow_origins=["https://hilarious-lokum-3acdf9.netlify.app"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```
3. Reinicia el servidor backend.

#### **Si usas Node.js (Express):**
1. Instala el paquete:
   ```bash
   npm install cors
   ```
2. Configura CORS en tu app:
   ```js
   const cors = require('cors');
   app.use(cors({
     origin: 'https://hilarious-lokum-3acdf9.netlify.app'
   }));
   ```
3. Reinicia el servidor backend.

### 1.3 Verifica
- Haz login desde tu frontend en Netlify.
- Si todo está bien, el error de CORS desaparecerá.

**Nota:** Si tienes varios entornos (producción, desarrollo), agrega todos los dominios necesarios.

---

## 2. Error de IDs duplicados en el login

### Problema
- Hay dos inputs con el mismo `id="login-email"` y dos con `id="login-password"` en el formulario de login.
- Cada id debe ser único en el DOM.

### Solución
- Cambia los `id` para que solo haya uno por cada input, o elimina los duplicados.
- Ejemplo:
  ```html
  <input id="login-email" ... />
  <!-- No debe haber otro input con id="login-email" en la misma página -->
  ```

---

¿Dudas? Consulta al equipo backend o frontend según corresponda.
