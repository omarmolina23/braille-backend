import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule, type OpenAPIObject } from '@nestjs/swagger';
import { FiltroProblemDetails } from './comun/problem-details.filter.js';
import type { Configuracion } from './config/configuracion.js';
import { VERSION_API } from './version.js';

/**
 * Configuración común a main.ts, a las pruebas e2e y a la exportación del contrato OpenAPI,
 * para que las tres vean exactamente la misma API.
 */
export function configurarApp(app: NestFastifyApplication, config: Configuracion): OpenAPIObject {
  app.setGlobalPrefix('v1');
  app.useGlobalFilters(new FiltroProblemDetails());
  app.enableCors({ origin: config.origenesWeb });

  const documento = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('API Braille')
      .setDescription(
        'Usuarios, contenidos y progreso del aplicativo de lectoescritura Braille. ' +
          'Los errores siguen RFC 9457 (application/problem+json).',
      )
      .setVersion(VERSION_API)
      .build(),
  );
  // Interfaz en /docs y contrato JSON en /docs-json.
  SwaggerModule.setup('docs', app, documento);
  return documento;
}
