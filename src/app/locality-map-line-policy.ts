/** Limit line detail to its source uncertainty, independently of locality-dot zoom. */
export function lineVisibleAtZoom(properties: Record<string,unknown> | null, zoom:number):boolean {
  return typeof properties?.maxZoom==='number' && zoom<=properties.maxZoom;
}
export const LINE_STROKE = {width:2,cap:'butt' as const,hatchWidth:1.4};
