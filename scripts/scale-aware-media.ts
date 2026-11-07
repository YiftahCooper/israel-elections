// Large text (Settings → Text size) scales the whole page with CSS zoom, but media queries still measure the real
// screen, so at a given screen the page would keep a layout meant for a wider one. This build step makes every width
// breakpoint follow the effective width instead: each width @media rule becomes two copies, one for normal text with
// the original breakpoints and one for large text with the breakpoints multiplied by the zoom. 760px under large text
// switches at 874px, so a 1024px screen gets the layout a 890px-wide page needs.
//
// Each copy's selectors gain a zero-specificity root condition (:where), so the cascade is unchanged. A selector is
// scoped both as a descendant of the root and on the root itself, since some (such as [dir="rtl"] .x) start at <html>.
import type { AtRule, Plugin, Rule } from 'postcss';

/** Must equal the zoom in styles.css (:root[data-text="large"]) and TEXT_ZOOM in src/app/textScale.ts. */
export const TEXT_ZOOM = 1.15;
const LARGE = '[data-text="large"]';
const WIDTH = /\((min|max)-width:\s*([\d.]+)px\)/g;

const px = (n: number) => `${Number(n.toFixed(2))}px`;
/** min-width X means "wider than X − 1"; under zoom that edge moves to (X − 1)·zoom, so adjacent ranges still meet. */
export const scaleQuery = (params: string, zoom = TEXT_ZOOM) =>
  params.replace(WIDTH, (_, kind: string, v: string) => kind === 'max' ? `(max-width: ${px(Number(v) * zoom)})` : `(min-width: ${px((Number(v) - 1) * zoom + 0.01)})`);

/** One selector, scoped to the root condition: as a descendant of the root and on the root itself. */
export function scopeSelector(sel: string, cond: string): string[] {
  const s = sel.trim();
  const type = /^([a-zA-Z][\w-]*|\*)/.exec(s)?.[1] ?? '';
  const rest = s.slice(type.length);
  const self = `${type === '*' ? '' : type}:where(:root${cond})${rest}`;
  // a selector that names the root (html, :root) is only ever the self form
  if (type === 'html' || /^:root(?![\w-])/.test(s)) return [type === 'html' ? self : `:root:where(${cond})${s.slice(5)}`];
  return [`:where(:root${cond}) ${s}`, self];
}

const scopeRules = (node: AtRule, cond: string) => node.walkRules((r: Rule) => {
  // keyframe steps (from, 50%) are not selectors
  if (r.parent?.type === 'atrule' && /keyframes$/.test((r.parent as AtRule).name)) return;
  r.selectors = r.selectors.flatMap((x) => scopeSelector(x, cond));
});

export function scaleAwareMedia(zoom = TEXT_ZOOM): Plugin {
  return {
    postcssPlugin: 'scale-aware-media',
    Once(root) {
      root.walkAtRules('media', (at) => {
        if (!WIDTH.test(at.params)) return;
        WIDTH.lastIndex = 0;
        if ((at as AtRule & { scaled?: boolean }).scaled) return;
        const large = at.clone({ params: scaleQuery(at.params, zoom) }) as AtRule & { scaled?: boolean };
        large.scaled = true;
        scopeRules(at, `:not(${LARGE})`);
        scopeRules(large, LARGE);
        (at as AtRule & { scaled?: boolean }).scaled = true;
        at.after(large);
      });
    },
  };
}
scaleAwareMedia.postcss = true;
