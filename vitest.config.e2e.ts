import { defineConfig } from 'vitest/config';

// Pruebas e2e: la API completa sobre Fastify, con la base de datos simulada.
export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['test/**/*.e2e-spec.ts'],
  },
});
