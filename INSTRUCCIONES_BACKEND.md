# INSTRUCCIONES AL BACKEND — Errores en consola y pruebas

Fecha: 2025-10-11

Este documento reúne todas las consultas (cURL) y comprobaciones que el equipo frontend ha usado para reproducir y depurar los errores que aparecen en la consola del navegador al usar la app. Pegar aquí las respuestas del backend o marcar las acciones realizadas para cerrar el ticket.

Resumen rápido de los problemas observados en consola
- Requests a `/api/users/` devuelven 403 Forbidden con cuerpo: `{ "detail": "You do not have permission to perform this action." }`.
- El cliente intenta rutas alternativas (`/api/usuarios/`) como fallback.
- Asignación de roles hace POST a `/api/users/{id}/roles/` con payload `{ "role": "<slug>" }` (enviar slug o id debe estar documentado/aceptado por backend).
- Logout debe ser POST `/api/logout/` (y el backend debe registrar una entrada de bitácora tipo 'Salida').
- Bitácora debe exponerse en `/api/bitacora/` (DRF paginado / paginación tipo `results` o `data`).

Objetivo de estas instrucciones
- Proveer al backend las peticiones exactas (cURL) para reproducir los errores.
- Indicar el comportamiento/payloads esperados por el frontend.
- Listar preguntas concretas que necesitamos confirmar o corregir en el backend.

Token de ejemplo (reemplazar por uno válido al probar):

```text
TOKEN=eyJhbGciOiJI...REEMPLAZAR_POR_TOKEN_DE_PRUEBA
```

IMPORTANTE: en los ejemplos uso el header `Authorization: Token <TOKEN>` (el frontend envía `Token <token>`). Si su backend usa `Bearer <token>` indíquenlo y el frontend se adaptará.

----

1) Probar listado de usuarios (endpoints canónicos y fallback)

- Prueba 1: endpoint canónico

```bash
curl -i -H "Authorization: Token $TOKEN" \
  "http://127.0.0.1:8000/api/users/"
```

Esperado (200): respuesta paginada DRF (ejemplo):

```json
HTTP/1.1 200 OK
{
  "count": 123,
  "next": "...",
  "previous": null,
  "results": [ { "id": 1, "email": "a@b.com", "roles": [1], ... }, ... ]
}
```

Si el backend devuelve 403: indicar exactamente qué permiso falta (nombre de la permission o rol requerido) para que frontend pueda evitar llamar el endpoint cuando el usuario no tenga ese permiso, y también para que el equipo pueda otorgarlo en su cuenta de desarrollo si corresponde.

- Prueba 2: fallback (legacy)

```bash
curl -i -H "Authorization: Token $TOKEN" \
  "http://127.0.0.1:8000/api/usuarios/"
```

Si `usuarios/` es la ruta correcta en producción, confirmen cuál será la canónica. El frontend actualmente intenta `/users/` y si falla prueba `/usuarios/`.

2) Asignar rol a un usuario

- Endpoint usado por frontend:

POST /api/users/{id}/roles/

Payload enviado por el frontend (ejemplo):

```json
{ "role": "cliente" }
```

Ejemplo cURL:

```bash
curl -i -X POST -H "Authorization: Token $TOKEN" -H "Content-Type: application/json" \
  -d '{"role":"cliente"}' \
  "http://127.0.0.1:8000/api/users/2/roles/"
```

Preguntas / comprobaciones para el backend:
- ¿Este endpoint acepta `role` como slug (`"cliente"`) y/o como id numérico (`2`)? Documentar formato exacto.
- ¿Cuál es la respuesta esperada al asignar (200 con objeto nuevo, 201, 204)? Proveer ejemplo.
- Si hay validación/permiso, ¿qué permiso/rol debe tener el solicitante para modificar roles?

3) El flujo de logout y bitácora

- Endpoint esperado por frontend para logout:

POST /api/logout/

Ejemplo cURL:

```bash
curl -i -X POST -H "Authorization: Token $TOKEN" \
  "http://127.0.0.1:8000/api/logout/"
```

Comportamiento esperado del backend:
- Registrar una entrada en la bitácora con tipo/action 'Salida' y referencia al usuario (usuario, timestamp, meta si aplica).
- Responder con 200 OK (o 204) al frontend. Si el token ya es inválido, aceptar y devolver 200/204 para que frontend pueda limpiar su estado (el frontend ya implementa una estrategia tolerante pero nos interesa la bitácora).

4) Consultar Bitácora (para mostrar en Admin)

- Endpoint esperado:

GET /api/bitacora/?page=1&page_size=25&ordering=-fecha

Ejemplo cURL:

```bash
curl -i -H "Authorization: Token $TOKEN" \
  "http://127.0.0.1:8000/api/bitacora/?page=1&page_size=25"
```

Respuesta esperada (ejemplo DRF paginado):

```json
HTTP/1.1 200 OK
{
  "count": 350,
  "next": "...",
  "previous": null,
  "results": [
    { "id": 1001, "usuario": {"id":1, "email":"admin@..."}, "accion": "Entrada", "meta": {...}, "fecha": "2025-10-11T12:34:56Z" },
    { "id": 1000, "usuario": {...}, "accion": "Salida", "fecha": "2025-10-11T11:00:00Z" }
  ]
}
```

Preguntas/ajustes:
- ¿La propiedad de fecha se llama `fecha`, `created_at` o `timestamp`? El frontend necesita una propiedad consistente para ordenar y mostrar.
- Asegurarse de que `accion` o `tipo` esté disponible y tenga valores legibles ('Entrada' / 'Salida' o 'login'/'logout').

5) Listado de roles

- Endpoint esperado por frontend (opcional si se necesita mapear slug→id):

GET /api/roles/

Ejemplo:

```bash
curl -i -H "Authorization: Token $TOKEN" "http://127.0.0.1:8000/api/roles/"
```

Respuesta esperada:

```json
[
  { "id": 1, "slug": "administrador", "name": "Administrador" },
  { "id": 2, "slug": "cliente", "name": "Cliente" },
  { "id": 3, "slug": "proveedor", "name": "Proveedor" },
  { "id": 4, "slug": "soporte", "name": "Soporte" }
]
```

Si el backend confirma que sólo acepta ids en el POST de asignación, el frontend implementará un mapeo automático `slug -> id` llamando a este endpoint.

6) Permisos y 403

Cuando el frontend recibe `403` en `/api/users/` necesitamos la información exacta sobre:

- ¿Qué permiso está faltando? (por ejemplo `auth.view_user` o `users.view_user` o `is_staff`)
- ¿Se requiere un rol *administrador* explícito? En cuyo caso indicar si la cuenta de desarrollo actual tiene ese rol o no.

Propuesta para mejorar la UX mientras se corrige el permiso en backend:
- El frontend ya evita llamar a `/api/users/` si el `currentUser` no parece ser admin (comprueba roles locales). Sin embargo, si la cuenta dev es admin y aún así recibe 403, revisar permisos del endpoint y roles/permissions de la cuenta.

7) Cabeceras y formato de Authorization

Confirmar si el backend espera exactamente `Authorization: Token <token>` o `Authorization: Bearer <token>`.
Si ambos formatos funcionan, indicar que acepten ambos (el frontend intenta `Token` actualmente).

8) Logs del backend

Por favor revisen los logs del servidor para estas peticiones fallidas y compartan:
- La ruta exacta que recibió el servidor (ej. `/api/users/`)
- El usuario autenticado o `anonymous` según el backend
- El permiso que denegó la petición (si DRF/guardian arroja un nombre de permiso)

9) Checklist de acciones a realizar por backend (sugerida)

- [ ] Confirmar y documentar las rutas canónicas: `/api/users/`, `/api/users/{id}/roles/`, `/api/roles/`, `/api/logout/`, `/api/bitacora/`.
- [ ] Asegurar que `/api/logout/` registra una entrada 'Salida' en la bitácora.
- [ ] Asegurar que `/api/users/` devuelve 200 para usuarios con permiso de listar (documentar el permiso exacto) y 403 para otros.
- [ ] Documentar si `role` en `/api/users/{id}/roles/` acepta `slug` y/o `id` (y la respuesta esperada).
- [ ] Incluir `slug` y `id` en la respuesta de `/api/roles/` para que frontend pueda mapear.
- [ ] Indicar el nombre del campo de fecha en bitácora para que el frontend lo use.

10) Ejemplo rápido de debugging que puede ejecutar el backend

Con un token válido (reemplazar $TOKEN):

```bash
# 1) Listar usuarios (ver si da 200 o 403):
curl -i -H "Authorization: Token $TOKEN" "http://127.0.0.1:8000/api/users/"

# 2) Pedir roles:
curl -i -H "Authorization: Token $TOKEN" "http://127.0.0.1:8000/api/roles/"

# 3) Simular asignación de rol a usuario id=2:
curl -i -X POST -H "Authorization: Token $TOKEN" -H "Content-Type: application/json" \
  -d '{"role":"cliente"}' "http://127.0.0.1:8000/api/users/2/roles/"

# 4) Probar logout (y comprobar bitácora):
curl -i -X POST -H "Authorization: Token $TOKEN" "http://127.0.0.1:8000/api/logout/"

# 5) Ver bitácora (últimas 10 entradas):
curl -i -H "Authorization: Token $TOKEN" "http://127.0.0.1:8000/api/bitacora/?page_size=10"
```

11) Resumen de preguntas concretas (por favor responder aquí):

- ¿La ruta para listar usuarios en producción es `/api/users/` o `/api/usuarios/`? ¿Cuál será la canónica?
- ¿Qué permiso exactamente controla la visibilidad de `/api/users/`? (proveer nombre de permission/rol)
- ¿El endpoint `/api/users/{id}/roles/` acepta `role` como slug o id o ambos? Proveer ejemplo de request/response.
- ¿`/api/logout/` crea la entrada `Salida` en la bitácora? Si no, ¿cómo preferís que lo solicitemos o qué endpoint usar?
- ¿Cómo se llama el campo fecha/timestamp en las entradas de bitácora?

----

Por favor copien aquí las respuestas del backend o peguen fragmentos de log (ruta + usuario + motivo del 403) y cerraré las tareas en `INSTRUCCIONES_BACKEND.md` con los cambios a implementar en el frontend si hay que adaptar payloads/headers.

Gracias — frontend.
