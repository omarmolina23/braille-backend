/**
 * Genera openapi.json: el contrato que consume el frontend (braille-frontend).
 * No necesita base de datos: la conexión de Prisma es perezosa y aquí nunca se usa.
 * Uso: pnpm openapi:exportar
 */
import { writeFile } from 'node:fs/promises';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module.js';
import { CONFIGURACION, type Configuracion } from './config/configuracion.js';
import { configurarApp } from './configurar-app.js';

process.env.DATABASE_URL ??= 'postgresql://openapi:openapi@localhost:5432/openapi';

const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
  logger: false,
});
const documento = configurarApp(app, app.get<Configuracion>(CONFIGURACION));
await writeFile('openapi.json', `${JSON.stringify(documento, null, 2)}\n`);
await app.close();
console.log('openapi.json actualizado');
