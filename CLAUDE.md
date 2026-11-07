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
  el camino crítico de la retroalimentación. **No** habla con el dispositivo.
- **Usuarios finales:** estudiantes con discapacidad visual y docentes tiflólogos. Los mensajes de
  error los lee un lector de pantalla tal cual.
- **Datos personales de estudiantes (Ley 1581 de 2012):** datos mínimos (sin documento de
  identidad), seudónimos en los reportes de investigación y consentimiento informado.
- Requerimientos que tocan esta API (numeración de `docs/entregables/especificacion-requerimientos.md`
  0.3): RF-23 (registro de intentos), RF-25 (exportar CSV), RF-27 (cuentas de estudiantes),
  RF-28 (consultar y exportar progreso), RF-29 (roles), RF-30 (acceso del estudiante con código),
  RF-31 y RF-32 (grupos y asignación de módulos), RF-33 (panel del tutor), RF-38 (autoregistro del
  estudiante), RF-39 (sesiones), RF-41 (módulos propios del tutor), RF-42 (metas por sesión) y
  RF-43 (registro del tutor con aprobación). Los contenidos salen de RF-08 (series) y de la tabla
  del alfabeto (ADR-0006). Ninguno está implementado todavía.
- Sin RF en la especificación 0.3: la sincronización sin conexión. Si se retoma, primero se agrega
  a la especificación (regla de la raíz: nada se implementa sin un RF).

## Etapa actual: versión de prueba

- Hoy solo existe el **esqueleto**: configuración validada, conexión a PostgreSQL, filtro de errores,
  OpenAPI y un endpoint de salud. Ningún módulo de dominio existe todavía; el esquema de
  `prisma/schema.prisma` es un borrador.
- Los PR de esta etapa llevan la etiqueta **`prototipo`** en GitHub (también en `braille-frontend`)
  y sus ramas empiezan por `prototipo/`. Los de la versión final no la llevan.

## Stack (versiones exactas en `package.json`)

Node.js ≥ 22.13 · pnpm 10.28 · TypeScript 6 (ESM, `module: nodenext`) · NestJS 12 con adaptador
Fastify 5 · Prisma 7 con `@prisma/adapter-pg` · PostgreSQL 17 · Zod 4 (solo para validar la
configuración) · OpenAPI con `@nestjs/swagger` · Vitest 4 · oxlint · Prettier · Docker · Railway.

## Estructura actual

```text
src/
├── main.ts                 Arranque: carga .env, crea la app Fastify y escucha en 0.0.0.0
├── app.module.ts           Importa ConfiguracionModule, PrismaModule y SaludModule
├── configurar-app.ts       Prefijo /v1, filtro de errores, CORS y Swagger (lo comparten main, e2e y export)
├── exportar-openapi.ts     Escribe openapi.json sin conectarse a la base
├── version.ts              VERSION_API (subirla junto con package.json)
├── config/                 configuracion.ts (Zod), módulo global y su prueba (configuracion.spec.ts)
├── comun/                  problem-details.filter.ts (FiltroProblemDetails)
├── prisma/                 PrismaService (conexión perezosa) y módulo global
├── salud/                  GET /v1/salud: estado de la API y de la base de datos
└── generated/prisma/       Cliente generado por Prisma (no versionado)
prisma/                     schema.prisma (Usuario, Intento) y migración 20260928161217_inicial
test/api.e2e-spec.ts        E2E con app.inject de Fastify y PrismaService simulado
openapi.json                Contrato publicado (verificado en CI)
docker-compose.yml          db (PostgreSQL) y, con el perfil `completo`, la API
Dockerfile                  Imagen de producción: migrate deploy y luego node dist/main.js
```

## Comandos (PowerShell)

| Comando                                        | Qué hace                                                          |
| ---------------------------------------------- | ----------------------------------------------------------------- |
| `pnpm install`                                 | Instala y genera el cliente de Prisma (`postinstall`)             |
| `docker compose up -d db`                      | PostgreSQL de desarrollo en **localhost:5467**                    |
| `docker compose --profile completo up --build` | Base de datos + API en contenedores                               |
| `pnpm start:dev`                               | API en http://localhost:3000 (`/v1/salud`, `/docs`, `/docs-json`) |
| `pnpm build` / `pnpm start:prod`               | Compila a `dist/` y ejecuta `node dist/main.js`                   |
| `pnpm test` / `pnpm test:watch`                | Unitarias (`src/**/*.spec.ts`)                                    |
| `pnpm test:cov`                                | Unitarias con cobertura (sin umbral configurado)                  |
| `pnpm test:e2e`                                | E2E sobre Fastify (`test/**/*.e2e-spec.ts`), sin BD real          |
| `pnpm lint` / `pnpm typecheck`                 | oxlint (`src/` y `test/`) / TypeScript                            |
| `pnpm format` / `pnpm format:check`            | Prettier                                                          |
| `pnpm db:migrar --name <nombre>`               | Crea y aplica una migración en desarrollo                         |
| `pnpm db:desplegar`                            | Aplica migraciones pendientes (CI y producción)                   |
| `pnpm openapi:exportar`                        | Compila y regenera `openapi.json`                                 |

El CI (`.github/workflows/ci.yml`) corre, en este orden: `format:check`, `lint`, `typecheck`,
`test`, `test:e2e`, `db:desplegar` sobre un PostgreSQL vacío y `openapi:exportar` + `git diff`
de `openapi.json`. Antes de dar un cambio por terminado, correr al menos los cinco primeros.

## Variables de entorno

`DATABASE_URL` (obligatoria, URL `postgres://` o `postgresql://`), `ORIGENES_WEB` (CORS, separadas
por coma; por defecto `http://localhost:5173`), `PORT` (por defecto 3000) y `NODE_ENV`. Se validan en
`src/config/configuracion.ts`; si falta algo, la API no arranca y dice qué corregir.

## Arquitectura (no romper)

- **Monolito modular:** un módulo NestJS por dominio. Previstos (aún no existen): `identidad`,
  `grupos`, `contenidos`, `progreso` y `reportes`. Cada módulo expone un servicio público; ninguno importa
  repositorios, tablas ni servicios internos de otro.
- Controladores delgados; la lógica va en los servicios.
- La base de datos se usa solo a través de `PrismaService` (`src/prisma/`).
- La configuración se lee solo desde `src/config/configuracion.ts`, validada con Zod; no leer
  `process.env` en otro lugar (excepción actual: `main.ts`, `exportar-openapi.ts` y
  `prisma.config.ts` cargan `.env` o ponen un valor por defecto).
- Todas las rutas van bajo `/v1`. Un cambio incompatible va en `/v2`, no sobre `/v1`.

## Contrato con el frontend

- `openapi.json` es el contrato que consume `braille-frontend`. Tras cambiar un endpoint o un DTO,
  ejecutar `pnpm openapi:exportar` y subir el archivo en el mismo PR: el CI falla si no coincide.
- Documentar cada endpoint con los decoradores de `@nestjs/swagger`: resumen en español y respuestas
  de error.
- **Sincronización idempotente:** el `id` de cada intento es un UUID generado por el cliente y la
  API hará _upsert_ (ya previsto en el modelo `Intento`; el endpoint aún no existe).

## Errores

- Siempre _Problem Details_ (RFC 9457) a través de `FiltroProblemDetails`: `{ type, title, status,
detail?, instance?, errores? }`, con `type: 'about:blank'` y `content-type: application/problem+json`.
- `title` y `detail` en español claro, escritos para ser escuchados. Las rutas inexistentes
  responden "No existe la ruta GET /v1/…".
- Nunca enviar al cliente el detalle de un error 500; solo se registra en el servidor.

## Base de datos y migraciones

- Esquema en `prisma/schema.prisma` (borrador: `Usuario` con `Rol`, e `Intento` con máscaras de 6
  bits, `ResultadoIntento` y `ModoIntento`). Una migración: `20260928161217_inicial`.
- Todo cambio de esquema se hace con `pnpm db:migrar --name <cambio>` y se versiona la carpeta
  `prisma/migrations/`. Nunca editar una migración ya subida: se crea una nueva.
- El cliente se genera en `src/generated/prisma` (no versionado). Si faltan sus tipos:
  `pnpm exec prisma generate`.
- En CI y producción se usa `prisma migrate deploy`; el contenedor lo ejecuta al arrancar.

## Pruebas

- Unitarias junto al código (`*.spec.ts`); hoy solo `configuracion.spec.ts`.
- E2E en `test/`: la app completa con `app.inject` de Fastify y `PrismaService` reemplazado por un
  doble (no se usa Supertest ni una base real).
- Nombres de las pruebas en español, describiendo el comportamiento.

## Convenciones de código

- Español en identificadores, comentarios, mensajes, documentación y commits; inglés solo donde lo
  exige NestJS, Prisma o una librería.
- ESM con `module: nodenext`: los imports relativos llevan extensión `.js`.
- TypeScript estricto con `noUncheckedIndexedAccess`; sin `any` (oxlint lo marca como error).
- No cambiar versiones mayores de dependencias salvo en un PR dedicado.

## Seguridad y privacidad

- Al construir `identidad` (ADR-0013): tutores y administradores con correo y contraseña (Argon2id);
  el tutor se registra y queda pendiente hasta que un administrador lo apruebe. Estudiantes con
  código corto de 6 dígitos que crea el tutor, el administrador o el propio estudiante sin grupo
  (autoregistro, cuenta marcada como tal), con límite de intentos. Sesión en cookie `httpOnly` y
  autorización por rol (estudiante, tutor y administrador). Sin CAPTCHA ni pruebas cognitivas
  (WCAG 3.3.8).
- Todo endpoint declara qué roles pueden usarlo. Solo son públicos la salud, el inicio de sesión, el
  autoregistro de estudiante y el registro de tutor, estos dos con límite de frecuencia por origen.
  (Hoy no hay autenticación: el único endpoint es la salud.)
- Las cuentas de autoregistro no entran en la exportación de la evaluación hasta tener
  consentimiento registrado.
- No registrar datos personales en los logs.
- Secretos solo en `.env` (no versionado), Railway y GitHub; `.env.example` sin valores reales.

## Entorno del equipo

- Windows con PowerShell, Node.js 22.13+, pnpm 10.28 (corepack) y Docker Desktop. Finales de línea
  LF (`.gitattributes`).
- El PostgreSQL de Docker usa el puerto **5467** del equipo, porque el 5432 lo ocupa otro
  PostgreSQL. Dentro de Docker y en el CI sigue siendo 5432.
- Si Prisma se conecta a `localhost:5432`, el `.env` está desactualizado o hay una variable de
  entorno `DATABASE_URL` del sistema que tiene prioridad sobre el `.env`.

## Git

- Ramas cortas desde `main`; _Conventional Commits_ en español (`feat:`, `fix:`, `docs:`, `test:`,
  `refactor:`, `chore:`; ámbito opcional, p. ej. `feat(progreso): …`).
- Todo cambio entra por PR revisado por el otro integrante y con el CI en verde.
- No incluir enlaces de sesión en commits ni en PRs.

## Diferencias con la propuesta (`../braille-api/CLAUDE.md`)

La propuesta del espacio de trabajo describe otro backend. Ninguna de estas diferencias está
resuelta: registrarlas aquí no cambia ni el código ni la propuesta. Resolverlas exige un ADR.

| Tema                 | Propuesta (`braille-api`, ADR-0002 y ADR-0004 propuesto) | Código actual                                                   |
| -------------------- | -------------------------------------------------------- | --------------------------------------------------------------- |
| Framework            | Express + Zod                                            | NestJS 12 + Fastify (sin ADR que lo registre)                   |
| Gestor de paquetes   | npm                                                      | pnpm (`npm` no se usa)                                          |
| Organización         | Capas `domain/application/infrastructure/presentation`   | Módulos NestJS por dominio (`salud`, `config`…)                 |
| Casos de uso         | Una clase `*.use-case.ts` con `execute(input)`           | Servicios NestJS; aún no hay casos de uso                       |
| Prefijo de rutas     | `/api/v1`, recursos en inglés (`/students`)              | `/v1`, recursos en español (`/v1/salud`)                        |
| Validación y OpenAPI | Esquemas Zod que generan OpenAPI                         | Zod solo para configuración; OpenAPI con decoradores Swagger    |
| Errores              | Problem Details con `code` (`LETTER_NOT_FOUND`)          | Problem Details sin `code`; campo extra `errores`               |
| Base de datos        | Prisma + SQLite (dev y pruebas)                          | Prisma 7 + PostgreSQL 17 (Docker, puerto 5467)                  |
| Pruebas              | Integración con Supertest y SQLite                       | E2E con `app.inject` y Prisma simulado                          |
| Lint                 | `lint`, `format`, `typecheck` (sin herramienta fijada)   | oxlint + Prettier                                               |
| Comandos             | `npm run dev`, `openapi:export`, `prisma migrate dev`    | `pnpm start:dev`, `openapi:exportar`, `db:migrar`               |
| Variable CORS        | `CORS_ORIGINS`                                           | `ORIGENES_WEB`                                                  |
| Identificadores      | En inglés (CLAUDE.md raíz)                               | En español                                                      |
| Ramas                | `feature/RF-xx-…`, commits con `(RF-xx)`                 | `prototipo/…`, commits sin RF                                   |
| Alfabeto canónico    | Datos iniciales de letras en la API (ADR-0006)           | No hay contenidos; la tabla vive en `braille-core` del frontend |
| Despliegue           | Por decidir                                              | Dockerfile + Railway                                            |

## Problemas conocidos

- En la copia local, `.env.example` aparece **borrado sin confirmar** (`git status`); está en el
  último commit. Recuperarlo con `git restore .env.example` si no fue intencional.
