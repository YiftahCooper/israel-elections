import Leaflet from 'leaflet';
import '@maplibre/maplibre-gl-leaflet';
import 'maplibre-gl/dist/maplibre-gl.css';
import { basemapStyleUrl, localityBasemapStyle } from './locality-basemap-style.ts';

/** Loaded only when the map is mounted. Abort and remove on theme change/unmount. */
export async function addLocalityBasemap(map: Leaflet.Map, dark: boolean, signal: AbortSignal, status: (failed: boolean) => void) {
  const response = await fetch(basemapStyleUrl(dark), { signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]) });
  if (!response.ok) throw new Error(`Basemap style: ${response.status}`);
  const style = localityBasemapStyle(await response.json());
  if (signal.aborted) return;
  const layer = Leaflet.maplibreGL({ style, attributionControl: false });
  try { layer.addTo(map); }
  catch (error) {
    // The adapter registers with Leaflet before WebGL initialization. Its normal cleanup assumes a GL map.
    if (!layer.getMaplibreMap()) layer.onRemove = () => { layer.getContainer()?.remove(); return layer; };
    layer.remove();
    throw error;
  }
  const gl = layer.getMaplibreMap();
  const timeout = window.setTimeout(() => status(true), 20000);
  gl.on('load', () => { clearTimeout(timeout); if (!signal.aborted) status(false); });
  gl.on('error', () => { if (!signal.aborted) status(true); });
  signal.addEventListener('abort', () => { clearTimeout(timeout); layer.remove(); }, { once: true });
}
