## Qué cambia

<!-- Una o dos frases. Título del PR en Conventional Commits: tipo(alcance): descripción (RF-xx) -->

## Requerimiento

- RF: RF-
- Etapa de prueba: <!-- Si es de la versión de prueba, agregar la etiqueta `prototipo` -->

## Criterios de aceptación

- [ ] Cada criterio tiene al menos una prueba automatizada que pasa

## Verificación local

- [ ] `pnpm format:check`
- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm test:e2e`
- [ ] `pnpm openapi:exportar` si cambió un endpoint o DTO (y `openapi.json` está en el PR)
- [ ] Migración nueva (nunca editada) si cambió `prisma/schema.prisma`

## Documentación

- [ ] Matriz de trazabilidad de `PLAN-DESARROLLO.md` actualizada
- [ ] `CHANGELOG.md` actualizado (sección "Sin publicar")
- [ ] ADR creado si hay decisión de arquitectura; contrato actualizado si cambió

## Seguridad y datos

- [ ] Sin secretos ni datos reales de participantes
- [ ] Cambio incompatible marcado con `!` y nota `BREAKING CHANGE:`

## Notas para quien revisa

<!-- Qué mirar con más atención; lo que quedó fuera a propósito -->
