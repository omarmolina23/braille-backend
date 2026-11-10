# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y versionado semántico.
Cada `release/*` mueve lo de "Sin publicar" a su versión.

## [Sin publicar]

### Corregido

- El check "Conventional Commits" no corría en ningún PR: `.github/workflows/pr-title.yml` usaba `pull_request_target`, que GitHub toma de la rama por defecto (`main`), donde el flujo no existe. Ahora usa `pull_request`.
