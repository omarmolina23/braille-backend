import {
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

/** Cuerpo de error según RFC 9457 (Problem Details for HTTP APIs). */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  /** Lista de errores de validación, cuando los hay. */
  errores?: unknown[];
}

const TITULOS: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'Solicitud inválida',
  [HttpStatus.UNAUTHORIZED]: 'No autenticado',
  [HttpStatus.FORBIDDEN]: 'Sin permiso',
  [HttpStatus.NOT_FOUND]: 'Recurso no encontrado',
  [HttpStatus.CONFLICT]: 'Conflicto',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'Datos no procesables',
  [HttpStatus.TOO_MANY_REQUESTS]: 'Demasiadas solicitudes',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'Error interno',
  [HttpStatus.SERVICE_UNAVAILABLE]: 'Servicio no disponible',
};

/**
 * Convierte cualquier error en Problem Details con mensajes en español claro:
 * el frontend los muestra y el lector de pantalla los lee tal cual.
 * Los errores inesperados (500) se registran, pero su detalle nunca se envía al cliente.
 */
@Catch()
export class FiltroProblemDetails implements ExceptionFilter {
  private readonly registro = new Logger('Errores');

  catch(excepcion: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const respuesta = http.getResponse<FastifyReply>();
    const solicitud = http.getRequest<FastifyRequest>();

    const status =
      excepcion instanceof HttpException ? excepcion.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const cuerpo: ProblemDetails = {
      type: 'about:blank',
      title: TITULOS[status] ?? 'Error',
      status,
      instance: solicitud.url,
    };

    if (excepcion instanceof HttpException) {
      const contenido = excepcion.getResponse();
      const mensaje =
        typeof contenido === 'string' ? contenido : (contenido as { message?: unknown }).message;
      if (Array.isArray(mensaje)) cuerpo.errores = mensaje;
      else if (typeof mensaje === 'string') cuerpo.detail = traducir(mensaje, solicitud);
    } else {
      this.registro.error(excepcion);
    }

    void respuesta
      .status(status)
      .header('content-type', 'application/problem+json; charset=utf-8')
      .send(cuerpo);
  }
}

/** Nest responde "Cannot GET /ruta" a las rutas inexistentes; se reemplaza por un texto en español. */
function traducir(mensaje: string, solicitud: FastifyRequest): string {
  if (/^Cannot [A-Z]+ /.test(mensaje))
    return `No existe la ruta ${solicitud.method} ${solicitud.url}`;
  return mensaje;
}
