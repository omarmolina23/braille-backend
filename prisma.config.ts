import { defineConfig } from 'prisma/config';

// Carga .env si existe (en CI y en Railway las variables llegan por el entorno).
try {
  process.loadEnvFile();
} catch {
  // sin archivo .env
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: {
    // `prisma generate` (se ejecuta al instalar) no se conecta, así que no exige la variable.
    // Si falta al migrar, el error mostrará "falta-DATABASE_URL" como nombre de la base.
    url:
      process.env.DATABASE_URL ??
      'postgresql://falta-DATABASE_URL@localhost:5432/falta-DATABASE_URL',
  },
});
