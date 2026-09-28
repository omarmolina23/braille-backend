# braille-backend

API del proyecto **Solución basada en tecnología para promover la lectoescritura del sistema
Braille** (proyecto de grado, Ingeniería de Sistemas, UFPS). Guarda usuarios, contenidos y el
progreso de los estudiantes. El aplicativo web y el firmware viven en el repositorio
`braille-frontend`.

El ciclo de práctica (acorde → evaluación → retroalimentación) **no pasa por aquí**: ocurre en el
navegador. Esta API recibe el progreso ya registrado, por eso el frontend sigue funcionando sin red.

## Stack

| Capa          | Tecnología                                                                      |
| ------------- | ------------------------------------------------------------------------------- |
| Framework     | NestJS 12 (ESM) con adaptador Fastify                                           |
| Base de datos | PostgreSQL 17 con Prisma 7 (adaptador `pg`)                                     |
| Validación    | Zod (configuración; en los módulos, validación por Standard Schema de NestJS)   |
| Contrato      | OpenAPI generado desde el código: `/docs` (interfaz) y `openapi.json` (archivo) |
| Errores       | RFC 9457 _Problem Details_, con mensajes en español claro                       |
| Pruebas       | Vitest (unitarias y e2e sobre Fastify)                                          |
| Calidad       | oxlint, Prettier, TypeScript estricto                                           |
| Despliegue    | Docker + Railway                                                                |

## Estructura

```text
braille-backend/
├─ src/
│  ├─ main.ts                 Arranque (Fastify en 0.0.0.0, puerto de PORT)
│  ├─ configurar-app.ts       Prefijo /v1, CORS, Problem Details y OpenAPI (común a todo)
│  ├─ app.module.ts           Monolito modular: un módulo por dominio
│  ├─ config/                 Variables de entorno validadas con Zod
│  ├─ prisma/                 PrismaService (cliente compartido)
│  ├─ comun/                  Filtro de errores Problem Details
│  ├─ salud/                  GET /v1/salud
│  └─ exportar-openapi.ts     Genera openapi.json
├─ prisma/schema.prisma       Modelo de datos (borrador: Usuario, Intento)
├─ test/                      Pruebas e2e
├─ openapi.json               Contrato que consume el frontend
├─ Dockerfile, docker-compose.yml
└─ .github/workflows/ci.yml
```

## Primera vez (Windows)

1. Node.js 22 LTS, `corepack enable` (PowerShell como administrador) y Docker Desktop.
2. Copiar `.env.example` como `.env`.
3. `pnpm install` (también genera el cliente de Prisma).
4. `docker compose up -d db` levanta PostgreSQL.
5. `pnpm db:migrar --name inicial` crea la primera migración a partir de `prisma/schema.prisma`.
   Suban la carpeta `prisma/migrations` al repositorio.
6. `pnpm start:dev` y abrir http://localhost:3000/v1/salud y http://localhost:3000/docs.

## Comandos

| Comando                          | Qué hace                                                          |
| -------------------------------- | ----------------------------------------------------------------- |
| `pnpm start:dev`                 | API con recarga automática                                        |
| `pnpm test` / `pnpm test:e2e`    | Pruebas unitarias / de extremo a extremo (sin base de datos real) |
| `pnpm lint` / `pnpm typecheck`   | oxlint / TypeScript                                               |
| `pnpm db:migrar --name <nombre>` | Crea y aplica una migración en desarrollo                         |
| `pnpm db:desplegar`              | Aplica migraciones pendientes (CI y producción)                   |
| `pnpm openapi:exportar`          | Regenera `openapi.json`                                           |
| `pnpm build` / `pnpm start:prod` | Compila / ejecuta la versión compilada                            |

## Contrato con el frontend

- `openapi.json` es la fuente de verdad de la API. Después de cambiar un endpoint, ejecuten
  `pnpm openapi:exportar` y suban el archivo en el mismo PR: el CI falla si quedó desactualizado.
- El frontend genera sus tipos desde ese archivo con `openapi-typescript`; así, un cambio que rompa
  al frontend aparece como error de compilación allá y no en producción.
- Un cambio incompatible (quitar un campo, cambiar su significado) va en una nueva versión de la
  ruta (`/v2/...`), no sobre `/v1`.

## Convenciones

- **Módulos por dominio:** `identidad`, `contenidos`, `progreso` y `reportes`. Cada uno expone un
  servicio; ninguno importa el repositorio ni las tablas de otro.
- **Errores:** siempre Problem Details. Los mensajes se escriben pensando en que un lector de
  pantalla los leerá tal cual.
- **Sincronización idempotente:** el `id` de cada intento lo genera el cliente (UUID) y la API hace
  _upsert_; reenviar un intento después de perder la red no lo duplica.
- **Privacidad:** datos mínimos (sin documento de identidad), seudónimos en los reportes de
  investigación y consentimiento informado (Ley 1581 de 2012).
- Ramas cortas, _Conventional Commits_ y PR revisado por el otro integrante, con el CI en verde.

## Despliegue en Railway

1. Crear un servicio desde este repositorio (Railway detecta el `Dockerfile`) y un servicio
   PostgreSQL.
2. Variables: `DATABASE_URL` (referencia a la base de Railway) y `ORIGENES_WEB` con la URL del
   frontend. `PORT` la asigna Railway.
3. Activar _Wait for CI_ para que solo se despliegue un commit con el CI en verde.
4. Al arrancar, el contenedor aplica las migraciones pendientes y luego inicia la API.

## Próximos pasos

- [ ] Primera migración (`pnpm db:migrar --name inicial`).
- [ ] Módulo `identidad`: registro, inicio de sesión accesible y roles (RF-18).
- [ ] Módulo `progreso`: `POST /v1/intentos` idempotente y metas (RF-14, RF-15).
- [ ] Módulo `contenidos` (RF-13) y `reportes` (RF-16, RF-20).
