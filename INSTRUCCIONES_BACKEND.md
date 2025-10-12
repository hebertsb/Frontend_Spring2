# INSTRUCCIONES URGENTES AL EQUIPO BACKEND — Editar perfil (Admin)

Por favor ejecuten las siguientes consultas (usar token administrador) y peguen las respuestas completas (status + headers + body JSON) justo debajo de cada comando. Necesitamos estas respuestas para ajustar el frontend y corregir por qué el modal "Editar usuario" no muestra/prefill correctamente los datos.

INSTRUCCIONES RÁPIDAS:
- Reemplacen <TOKEN> por un token válido de administrador.
- Reemplacen <ID> por el id de un usuario real que aparece en la UI.
- Peguen exactamente el output que obtienen (incluyendo status y body JSON).

------------------------------------------------------------
1) GET usuario (detalle)

Comando:
curl -i -H "Authorization: Token <TOKEN>" "http://127.0.0.1:8000/api/users/<ID>/"

Pegar aquí (status + headers + body):
---


2) GET perfil autenticado (/users/me/)

Comando:
curl -i -H "Authorization: Token <TOKEN>" "http://127.0.0.1:8000/api/users/me/"

Pegar aquí (status + headers + body):
---


3) Probar editar (payload que el frontend envía)

Comando (PATCH ejemplo):
curl -i -X PATCH -H "Content-Type: application/json" -H "Authorization: Token <TOKEN>" \
	-d '{"user": {"first_name":"Prueba","last_name":"Usuario","email":"prueba+edit@example.com"}, "telefono": "+59170000000"}' \
	"http://127.0.0.1:8000/api/users/<ID>/"

Si PATCH devuelve 405, prueben también con PUT y peguen ambas respuestas.

Pegar aquí (status + headers + body):
---


4) ¿Qué campo indica si un usuario está activo/inactivo?

Por favor indiquen el nombre exacto del campo (p.ej. `is_active`) y peguen un ejemplo de un objeto de usuario con dicho campo (puede ser el mismo resultado del punto 1).

Respuesta (texto + ejemplo):
---


5) Roles: forma de los objetos en `/api/roles/` y asignación

Comando:
curl -i -H "Authorization: Token <TOKEN>" "http://127.0.0.1:8000/api/roles/"

Pegar aquí (status + headers + body):
---

Pregunta: Para `POST /api/users/<ID>/roles/` ¿aceptan `role` por slug ("cliente") o por id (2)? Si tienen un ejemplo de llamada para asignar rol, péguenlo.

Respuesta (texto + ejemplo):
---


6) Ejemplo de error de validación (400) al editar

Por favor ejecuten una petición de edición que provoque un 400 (por ejemplo email duplicado) y peguen la respuesta exacta (status 400 y body). Necesitamos saber si los errores vienen como `{ "user": { "email": ["..."] } }` o como `{ "email": ["..."] }` o alguna otra forma.

Comando ejemplo (pueden usar un email existente):
curl -i -X PATCH -H "Content-Type: application/json" -H "Authorization: Token <TOKEN>" -d '{"user":{"email":"existing@example.com"}}' "http://127.0.0.1:8000/api/users/<ID>/"

Pegar aquí (status + headers + body):
---


Preguntas cortas (respuestas en texto son suficientes):
- ¿Se requiere trailing slash en las URLs? (sí/no)
- ¿PATCH /api/users/<ID>/ está soportado o hay que usar PUT? (indicar preferred)
- ¿Al desactivar un usuario el backend revoca tokens automáticamente? (sí/no)

------------------------------------------------------------
Gracias — cuando peguen estas respuestas actualizaré `normalizeApiUser`, la lógica de prefill del modal y el payload de edición para que coincida exactamente con el backend y corregir el problema de carga de datos en la UI.

