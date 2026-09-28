import { Module } from '@nestjs/common';
import { ConfiguracionModule } from './config/configuracion.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { SaludModule } from './salud/salud.module.js';

/**
 * Monolito modular: un módulo por dominio. Módulos previstos (ver README):
 * identidad, contenidos, progreso y reportes. Ningún módulo importa repositorios de otro.
 */
@Module({
  imports: [ConfiguracionModule, PrismaModule, SaludModule],
})
export class AppModule {}
