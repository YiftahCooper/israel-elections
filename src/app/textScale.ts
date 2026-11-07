// Large text zooms the page (styles.css); width breakpoints follow the effective width (scripts/scale-aware-media.ts).
// The same rule for breakpoints checked in script.
export const TEXT_ZOOM = 1.15;
export const textZoom = () => typeof document !== 'undefined' && document.documentElement.dataset.text === 'large' ? TEXT_ZOOM : 1;
/** True when the page is at most `px` wide in its own (zoomed) pixels, as a CSS (max-width: px) breakpoint sees it. */
export const narrowerThan = (px: number) => typeof matchMedia === 'function' && matchMedia(`(max-width: ${px * textZoom()}px)`).matches;
