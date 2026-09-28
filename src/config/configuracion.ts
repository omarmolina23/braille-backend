import { z } from 'zod';

/** Token de inyección de la configuración validada. */
export const CONFIGURACION = Symbol('CONFIGURACION');

export interface Configuracion {
  entorno: 'development' | 'test' | 'production';
  puerto: number;
  urlBaseDeDatos: string;
  /** Orígenes a los que se permite llamar la API (CORS): el frontend. */
  origenesWeb: string[];
}

const esquema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z
    .string({ error: 'Falta DATABASE_URL (ver .env.example).' })
    .regex(/^postgres(ql)?:\/\//, 'DATABASE_URL debe ser una URL de PostgreSQL.'),
  ORIGENES_WEB: z.string().default('http://localhost:5173'),
});

/**
 * Lee y valida las variables de entorno una sola vez, al arrancar.
 * Si falta algo, la API no arranca y el mensaje dice qué variable corregir.
 */
export function cargarConfiguracion(entorno: NodeJS.ProcessEnv = process.env): Configuracion {
  const resultado = esquema.safeParse(entorno);
  if (!resultado.success) {
    throw new Error(`Configuración inválida:\n${z.prettifyError(resultado.error)}`);
  }
  const v = resultado.data;
  return {
    entorno: v.NODE_ENV,
    puerto: v.PORT,
    urlBaseDeDatos: v.DATABASE_URL,
    origenesWeb: v.ORIGENES_WEB.split(',')
      .map((o) => o.trim())
      .filter((o) => o.length > 0),
  };
}
