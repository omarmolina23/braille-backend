import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SaludService {
  constructor(private readonly prisma: PrismaService) {}

  /** true si la base de datos responde a una consulta mínima. */
  async baseDeDatosResponde(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
