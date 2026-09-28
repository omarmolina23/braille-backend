import { Test } from '@nestjs/testing';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '../src/app.module.js';
import { CONFIGURACION, type Configuracion } from '../src/config/configuracion.js';
import { configurarApp } from '../src/configurar-app.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

/** Levanta la API completa con Fastify, pero con una base de datos simulada. */
async function crearApp(baseResponde: boolean): Promise<NestFastifyApplication> {
  process.env.DATABASE_URL ??= 'postgresql://prueba:prueba@localhost:5432/prueba';
  const modulo = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(PrismaService)
    .useValue({
      $queryRaw: () => (baseResponde ? Promise.resolve([1]) : Promise.reject(new Error('caída'))),
      $disconnect: () => Promise.resolve(),
    })
    .compile();
  const app = modulo.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
  configurarApp(app, app.get<Configuracion>(CONFIGURACION));
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
  return app;
}

describe('API (e2e)', () => {
  let app: NestFastifyApplication;

  afterEach(async () => {
    await app?.close();
  });

  it('GET /v1/salud responde 200 cuando la base de datos responde', async () => {
    app = await crearApp(true);
    const r = await app.inject({ method: 'GET', url: '/v1/salud' });
    expect(r.statusCode).toBe(200);
    expect(r.json()).toEqual({ estado: 'ok', baseDeDatos: 'ok', version: expect.any(String) });
  });

  it('GET /v1/salud responde 503 en formato Problem Details si la base no responde', async () => {
    app = await crearApp(false);
    const r = await app.inject({ method: 'GET', url: '/v1/salud' });
    expect(r.statusCode).toBe(503);
    expect(r.headers['content-type']).toContain('application/problem+json');
    expect(r.json()).toEqual({
      type: 'about:blank',
      title: 'Servicio no disponible',
      status: 503,
      detail: 'La base de datos no responde.',
      instance: '/v1/salud',
    });
  });

  it('una ruta inexistente responde 404 con el detalle en español', async () => {
    app = await crearApp(true);
    const r = await app.inject({ method: 'GET', url: '/v1/no-existe' });
    expect(r.statusCode).toBe(404);
    expect(r.json()).toMatchObject({
      title: 'Recurso no encontrado',
      detail: 'No existe la ruta GET /v1/no-existe',
    });
  });

  it('permite peticiones del frontend (CORS)', async () => {
    app = await crearApp(true);
    const r = await app.inject({
      method: 'GET',
      url: '/v1/salud',
      headers: { origin: 'http://localhost:5173' },
    });
    expect(r.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });

  it('publica el contrato OpenAPI en /docs-json', async () => {
    app = await crearApp(true);
    const r = await app.inject({ method: 'GET', url: '/docs-json' });
    expect(r.statusCode).toBe(200);
    expect(Object.keys(r.json().paths)).toContain('/v1/salud');
  });
});
