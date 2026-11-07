import type { StyleSpecification } from 'maplibre-gl';

export const basemapStyleUrl = (dark: boolean) => `https://tiles.openfreemap.org/styles/${dark ? 'dark' : 'positron'}`;
export const basemapAttribution = '<a href="https://openfreemap.org/">OpenFreeMap</a> · <a href="https://openmaptiles.org/">OpenMapTiles</a> · © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>';

/** Fail closed: no provider text/icons or administrative boundaries. CBS labels are separate DOM layers.
 * Keep roads, water and land cover. Removing every symbol also covers future provider POI/label layers. */
export function localityBasemapStyle(style: StyleSpecification, dark = false): StyleSpecification {
  return { ...style, layers: style.layers.filter(layer => layer.type !== 'symbol'
    && !('source-layer' in layer && /boundar/i.test(layer['source-layer'] ?? ''))
    && !/boundar/i.test(layer.id)).map(layer => dark && layer.type === 'line'
      && ['highway_motorway_inner','highway_motorway_bridge_inner','aeroway-runway'].includes(layer.id)
      ? { ...layer, paint: { ...layer.paint, 'line-color':'#343b43' } } : layer) };
}
