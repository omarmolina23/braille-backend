# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versionado semántico.
Cada `release/*` mueve lo de "Sin publicar" a su versión.

## [Sin publicar]

### Agregado

- Flujo `.github/workflows/seguridad.yml`: Gitleaks revisa secretos en el historial y `pnpm audit --audit-level high` revisa vulnerabilidades en dependencias, en cada PR y en cada push a `main`.

### Cambiado

- `CLAUDE.md`: las ramas siguen Git Flow desde `develop` (`feature/RF-xx-…`) en lugar de ramas `prototipo/` desde `main`. La etiqueta `prototipo` se mantiene.

### Corregido

- El check "Conventional Commits" no corría en ningún PR: `.github/workflows/pr-title.yml` usaba `pull_request_target`, que GitHub toma de la rama por defecto (`main`), donde el flujo no existe. Ahora usa `pull_request`.

### Seguridad

- Sin vulnerabilidades altas en `pnpm audit`, todo con versiones de parche: `zod` 4.6.5 → 4.6.7 (GHSA-mrhx-c7xc-m3w5); `prisma`, `@prisma/client` y `@prisma/adapter-pg` 7.10.0 → 7.10.1 (traen `deepmerge-ts` 8 y `mysql2` 3.24); `vitest` y `@vitest/coverage-v8` 4.1.11 → 4.1.12; `source-map-js` 1.2.2 en el lockfile. `vite` 8.3.7 queda declarado como `devDependency`: era un peer de `vitest` instalado automáticamente y fijado en 8.3.1.
