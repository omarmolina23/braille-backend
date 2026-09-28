import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module.js';
import { CONFIGURACION, type Configuracion } from './config/configuracion.js';
import { configurarApp } from './configurar-app.js';

// En desarrollo las variables vienen de .env; en Railway y en CI, del entorno.
try {
  process.loadEnvFile();
} catch {
  // sin archivo .env
}

const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
const config = app.get<Configuracion>(CONFIGURACION);
configurarApp(app, config);
app.enableShutdownHooks();

// 0.0.0.0 es necesario dentro de Docker y en Railway.
await app.listen(config.puerto, '0.0.0.0');
