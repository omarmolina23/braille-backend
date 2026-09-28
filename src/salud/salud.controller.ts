import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { VERSION_API } from '../version.js';
import { SaludService } from './salud.service.js';

export class EstadoSalud {
  @ApiProperty({ enum: ['ok'], example: 'ok' })
  estado!: 'ok';

  @ApiProperty({ enum: ['ok'], example: 'ok' })
  baseDeDatos!: 'ok';

  @ApiProperty({ example: VERSION_API })
  version!: string;
}

@ApiTags('salud')
@Controller('salud')
export class SaludController {
  constructor(private readonly salud: SaludService) {}

  @Get()
  @ApiOperation({ summary: 'Comprueba que la API y la base de datos responden' })
  @ApiOkResponse({ type: EstadoSalud })
  @ApiServiceUnavailableResponse({ description: 'La base de datos no responde (Problem Details).' })
  async obtener(): Promise<EstadoSalud> {
    if (!(await this.salud.baseDeDatosResponde())) {
      throw new ServiceUnavailableException('La base de datos no responde.');
    }
    return { estado: 'ok', baseDeDatos: 'ok', version: VERSION_API };
  }
}
