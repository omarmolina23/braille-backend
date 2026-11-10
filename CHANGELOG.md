# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versionado semántico.
Cada `release/*` mueve lo de "Sin publicar" a su versión.

## [Sin publicar]

### Agregado

- Flujo `.github/workflows/seguridad.yml`: Gitleaks revisa secretos en el historial y `pnpm audit --audit-level high` revisa vulnerabilidades en dependencias, en cada PR y en cada push a `main`.

### Cambiado

- `CLAUDE.md`: las ramas siguen Git Flow desde `develop` (`feature/RF-xx-…`) en lugar de ramas `prototipo/` desde `main`. La etiqueta `prototipo` se mantiene.
