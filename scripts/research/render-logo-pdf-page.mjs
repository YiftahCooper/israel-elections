// Render an original archival PDF page for a separately recorded rectangular crop.
// node scripts/research/render-logo-pdf-page.mjs input.pdf page scale output.png
import { createCanvas, DOMMatrix, ImageData, Path2D } from '@napi-rs/canvas';
import { readFileSync, writeFileSync } from 'node:fs';
Object.assign(globalThis, { DOMMatrix, ImageData, Path2D });
const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
const task = getDocument({ data: new Uint8Array(readFileSync(process.argv[2])),
  wasmUrl: new URL('../../node_modules/pdfjs-dist/wasm/', import.meta.url).pathname,
  useSystemFonts: true });
try {
  const document = await task.promise;
  const page = await document.getPage(Number(process.argv[3]));
  const viewport = page.getViewport({ scale: Number(process.argv[4]) });
  const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
  await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
  writeFileSync(process.argv[5], canvas.toBuffer('image/png'));
  console.log(`Rendered original page: ${canvas.width}x${canvas.height}`);
} finally {
  await task.destroy();
}
