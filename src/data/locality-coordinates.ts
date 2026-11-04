import proj4 from 'proj4';

// EPSG:2039, preferred EPSG:9676 seven-parameter transformation (position-vector convention).
export const ITM = '+proj=tmerc +lat_0=31.7343936111111 +lon_0=35.2045169444444 +k=1.0000067 +x_0=219529.584 +y_0=626907.39 +ellps=GRS80 +towgs84=23.772,17.49,17.859,-0.3132,-1.85274,1.67299,-5.4262 +units=m +no_defs';
export interface Coordinate { lat: number; lon: number }
export interface LocalityLocation extends Coordinate { code: number; nameHe: string; nameEn: string; aliases: string[]; year: number }
export type LocalityLocations = Record<string, LocalityLocation>;
export function decodeCBSGrid(value: unknown): [number, number] | null {
  const text = String(value ?? '').trim().replace(/\.0$/, '');
  if (!/^\d{8}$|^\d{10}$|^\d{12}$/.test(text)) return null;
  const half = text.length / 2, scale = 10 ** (6 - half);
  return [Number(text.slice(0, half)) * scale, Number(text.slice(half)) * scale];
}
export function itmToWgs84(easting: number, northing: number): Coordinate {
  if (!Number.isFinite(easting) || !Number.isFinite(northing) || easting < 100000 || easting > 300000 || northing < 370000 || northing > 810000) throw new Error('Outside locality ITM bounds');
  const [lon, lat] = proj4(ITM, 'EPSG:4326', [easting, northing]);
  return { lat, lon };
}
