# braille-backend

API del proyecto de grado **Solución basada en tecnología para promover la lectoescritura del
sistema Braille en estudiantes con discapacidad visual de Norte de Santander** (Ingeniería de
Sistemas, UFPS; Omar Jaimes y Bryan Vera). El aplicativo web, los paquetes compartidos y el firmware
viven en el repositorio hermano `braille-frontend` (normalmente en `../braille-frontend`).

<!-- Mantener por debajo de ~200 líneas. Si cambia una decisión descrita aquí, actualizar este
archivo en el mismo PR. Lo personal va en CLAUDE.local.md (no versionado). -->

## Contexto que el código no muestra

- La API guarda usuarios, contenidos y progreso. El ciclo de práctica (acorde → evaluación →
  retroalimentación) ocurre en el navegador: esta API recibe los intentos ya evaluados y no está en
  el camino crítico de la retroalimentación.
- **Usuarios finales:** estudiantes con discapacidad visual y docentes tiflólogos. Los mensajes de
  error los lee un lector de pantalla tal cual.
- **Datos personales de estudiantes (Ley 1581 de 2012):** datos mínimos (sin documento de
  identidad), seudónimos en los reportes de investigación y consentimiento informado.
- La justificación completa está en el _Informe de selección justificada de la solución_ (fuera
  del repositorio). Requerimientos que tocan esta API: RF-13 (contenidos), RF-14 (registro de
  intentos), RF-15 (metas), RF-16 (panel docente), RF-17 (sincronización sin conexión), RF-18
  (registro, inicio de sesión y roles) y RF-20 (exportar CSV).

## Stack

NestJS 12 (ESM) con adaptador Fastify · Prisma 7 con `@prisma/adapter-pg` · PostgreSQL 17 · Zod ·
OpenAPI con `@nestjs/swagger` · Vitest · oxlint · Prettier · Docker · Railway.

## Comandos (PowerShell)

| Comando                          | Qué hace                                                 |
| -------------------------------- | -------------------------------------------------------- |
| `docker compose up -d db`        | PostgreSQL de desarrollo en **localhost:5467**           |
| `pnpm start:dev`                 | API en http://localhost:3000 (`/v1/salud` y `/docs`)     |
| `pnpm test`                      | Unitarias (`src/**/*.spec.ts`)                           |
| `pnpm test:e2e`                  | E2E sobre Fastify (`test/**/*.e2e-spec.ts`), sin BD real |
| `pnpm lint` / `pnpm typecheck`   | oxlint / TypeScript                                      |
| `pnpm format` / `format:check`   | Prettier                                                 |
| `pnpm db:migrar --name <nombre>` | Crea y aplica una migración en desarrollo                |
| `pnpm db:desplegar`              | Aplica migraciones pendientes (CI y producción)          |
| `pnpm openapi:exportar`          | Regenera `openapi.json`                                  |

Antes de dar un cambio por terminado, correr en este orden (el mismo del CI):
`pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm test:e2e`.

## Arquitectura (no romper)

- **Monolito modular:** un módulo NestJS por dominio: `identidad`, `contenidos`, `progreso` y
  `reportes`. Cada módulo expone un servicio público; ninguno importa repositorios, tablas ni
  servicios internos de otro.
- Controladores delgados; la lógica va en los servicios.
- La base de datos se usa solo a través de `PrismaService` (`src/prisma/`).
- La configuración se lee solo desde `src/config/configuracion.ts`, validada con Zod; no leer
  `process.env` en otro lugar.
- Todas las rutas van bajo `/v1`. Un cambio incompatible (quitar un campo o cambiar su significado)
  va en `/v2`, no sobre `/v1`.

## Contrato con el frontend

- `openapi.json` es el contrato que consume `braille-frontend`. Tras cambiar un endpoint o un DTO,
  ejecutar `pnpm openapi:exportar` y subir el archivo en el mismo PR: el CI falla si no coincide con
  el código.
- Documentar cada endpoint con los decoradores de `@nestjs/swagger`: resumen en español y respuestas
  de error.
- **Sincronización idempotente:** el `id` de cada intento es un UUID generado por el cliente y la
  API hace _upsert_. Reenviar un intento tras perder la red no lo duplica.

## Errores

- Siempre _Problem Details_ (RFC 9457) a través de `FiltroProblemDetails`
  (`src/comun/problem-details.filter.ts`).
- `title` y `detail` en español claro, escritos para ser escuchados; sin jerga ni textos técnicos en
  inglés.
- Nunca enviar al cliente el detalle de un error 500; solo se registra en el servidor.

## Base de datos y migraciones

- Esquema en `prisma/schema.prisma` (borrador: `Usuario` e `Intento`).
- Todo cambio de esquema se hace con `pnpm db:migrar --name <cambio>` y se versiona la carpeta
  `prisma/migrations/`. Nunca editar una migración ya subida: se crea una nueva.
- El cliente de Prisma se genera al instalar, en `src/generated/prisma` (no versionado). Si faltan
  sus tipos: `pnpm exec prisma generate`.
- En CI y producción se usa `prisma migrate deploy`; el contenedor lo ejecuta al arrancar.

## Convenciones de código

- Español en identificadores, comentarios, mensajes, documentación y commits; inglés solo donde lo
  exige NestJS, Prisma o una librería.
- ESM con `module: nodenext`: los imports relativos llevan extensión `.js`
  (`import { SaludService } from './salud.service.js'`).
- TypeScript estricto con `noUncheckedIndexedAccess`; sin `any`.
- No cambiar versiones mayores de dependencias salvo en un PR dedicado.

## Seguridad y privacidad

- Al construir `identidad`: contraseñas con Argon2id, sesión en cookie `httpOnly` y autorización
  por rol (estudiante, docente y administrador). Sin CAPTCHA ni pruebas cognitivas; se permite pegar
  la contraseña y usar gestores (WCAG 3.3.8).
- Todo endpoint declara qué roles pueden usarlo. Solo son públicos la salud, el registro y el inicio
  de sesión.
- No registrar datos personales en los logs.
- Secretos solo en `.env` (no versionado), Railway y GitHub; `.env.example` sin valores reales.

## Entorno del equipo

- Windows 11 con PowerShell, Node.js 22.13+, pnpm 10.28 (corepack) y Docker Desktop. Finales de
  línea LF (`.gitattributes`).
- Los dos repositorios se clonan uno al lado del otro en `tesis-braille/`.
- El PostgreSQL de Docker usa el puerto **5467** del equipo, porque el 5432 lo ocupa otro
  PostgreSQL. Dentro de Docker y en el CI sigue siendo 5432.
- Si Prisma se conecta a `localhost:5432`, el `.env` está desactualizado o hay una variable de
  entorno `DATABASE_URL` del sistema que tiene prioridad sobre el `.env`.

## Git

- Ramas cortas desde `main`; _Conventional Commits_ en español (`feat:`, `fix:`, `docs:`, `test:`,
  `refactor:`, `chore:`; ámbito opcional, p. ej. `feat(progreso): …`).
- Todo cambio entra por PR revisado por el otro integrante y con el CI en verde.
- No incluir enlaces de sesión en commits ni en PRs.
