import type { SimList } from '../model/scenario.ts';
const xml = (s: string) => s.replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]!));
const colour = (c: string) => /^#[\da-f]{3}(?:[\da-f]{3})?$/i.test(c) ? c : '#64748b';
/** One self-contained drawing for Slip and SVG/PNG exports; no borrowed election marks. */
export function syntheticIconSvg(l: Pick<SimList, 'letters' | 'color' | 'synthetic'>): string | null {
 const id = l.synthetic;
 if (!id) return null;
 const parts = id.kind === 'merge' && id.parts.length ? id.parts : [{letters:l.letters,color:l.color}];
 // At most four cells; the last cell states how many further inputs were combined.
 const shown = parts.length > 4 ? [...parts.slice(0,3),{letters:`+${parts.length-3}`,color:l.color}] : parts;
 const rows = shown.length > 2 ? 2 : 1, cols = shown.length > 1 ? 2 : 1;
 const w = 58 / cols, h = 32 / rows;
 const cells = shown.map((p,i)=>{
  const x=(i%cols)*w,y=Math.floor(i/cols)*h;
  const letters=p.letters || '+';
  const font=Math.min(rows===2?10:15,(w-4)/Math.max(1,Array.from(letters).length)*1.5);
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff"/><path d="M${x} ${y+h-2}h${w}" stroke="${colour(p.color)}" stroke-width="4"/><text x="${x+w/2}" y="${y+(h-3)/2}" text-anchor="middle" dominant-baseline="central" direction="rtl" fill="#111" font-family="Arial,sans-serif" font-weight="700" font-size="${font}">${xml(letters)}</text>`;
 }).join('');
 const split=id.kind==='split'?`<path d="M46 0H58V12Z" fill="${colour(l.color)}"/><path d="M49 2l7 7" stroke="#111" stroke-width="1.5"/>`:'';
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 32" data-kind="${id.kind}"><defs><clipPath id="tile"><rect width="58" height="32" rx="3"/></clipPath></defs><g clip-path="url(#tile)">${cells}${cols>1?'<path d="M29 0v32" stroke="#c4cbd3"/>':''}${rows>1?'<path d="M0 16h58" stroke="#c4cbd3"/>':''}${split}</g></svg>`;
}
export const syntheticIconUrl = (l: Pick<SimList, 'letters' | 'color' | 'synthetic'>) => {
 const svg=syntheticIconSvg(l); return svg ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` : null;
};
