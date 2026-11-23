# INDILINGUA – Frontend (Angular 20)

## Ejecutar
```
npm install
npm start
```
Abre http://localhost:4200 (el backend debe estar en http://localhost:8080).

## Configuración
`src/app/ig-config.ts`
- `IG_API_URL`: URL del backend.
- `IG_ROL_ESTUDIANTE_ID`: id del rol de estudiante en tu tabla `roles` (se usa al registrar cuentas).
- `IG_NOTA_MINIMA`: nota mínima para aprobar (60).

## Rol → ícono y etiqueta del usuario
Se toma del rol que devuelve `POST /api/auth/login`:
- DOCENTE / MAESTRO / PROFESOR / TEACHER → **Maestro** (ícono de birrete)
- ADMIN → Administrador (ícono de birrete)
- Cualquier otro (ESTUDIANTE, USER…) → **Estudiante** (ícono de persona)
- Invitado → Invitado

## Backend: registro público
`POST /api/usuarios` exige token. Para que la pantalla "Crear cuenta" funcione, en `SecurityConfig.java` agrega
antes de `.anyRequest().authenticated()`:
```java
.requestMatchers(HttpMethod.POST, "/api/usuarios").permitAll()
```

## Pantallas
Login · Registro · Inicio · Lecciones · Evaluaciones · Mi progreso
