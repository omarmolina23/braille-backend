import { Inject, Injectable, type OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import { CONFIGURACION, type Configuracion } from '../config/configuracion.js';

/**
 * Cliente de base de datos compartido por todos los módulos.
 * Se conecta de forma perezosa en la primera consulta: la API arranca aunque la base tarde.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(@Inject(CONFIGURACION) config: Configuracion) {
    super({ adapter: new PrismaPg({ connectionString: config.urlBaseDeDatos }) });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
