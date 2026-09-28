import { cargarConfiguracion } from './configuracion.js';

const base = { DATABASE_URL: 'postgresql://braille:braille@localhost:5432/braille' };

describe('cargarConfiguracion', () => {
  it('aplica valores por defecto', () => {
    expect(cargarConfiguracion(base)).toEqual({
      entorno: 'development',
      puerto: 3000,
      urlBaseDeDatos: base.DATABASE_URL,
      origenesWeb: ['http://localhost:5173'],
    });
  });

  it('usa el puerto que asigna Railway y separa los orígenes', () => {
    const config = cargarConfiguracion({
      ...base,
      PORT: '8080',
      ORIGENES_WEB: 'https://braille.up.railway.app, http://localhost:5173',
    });
    expect(config.puerto).toBe(8080);
    expect(config.origenesWeb).toEqual(['https://braille.up.railway.app', 'http://localhost:5173']);
  });

  it('explica qué falta si no hay DATABASE_URL', () => {
    expect(() => cargarConfiguracion({})).toThrow(/DATABASE_URL/);
  });

  it('rechaza una URL que no es de PostgreSQL', () => {
    expect(() => cargarConfiguracion({ DATABASE_URL: 'mysql://x' })).toThrow(/PostgreSQL/);
  });
});
