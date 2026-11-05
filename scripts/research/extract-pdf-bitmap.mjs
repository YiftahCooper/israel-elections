// Decode an existing RGB image XObject; do not render or reconstruct a PDF page.
// node scripts/research/extract-pdf-bitmap.mjs input.pdf page imageId output.png
import { createCanvas, DOMMatrix, ImageData, Path2D } from '@napi-rs/canvas';
import { readFileSync, writeFileSync } from 'node:fs';
Object.assign(globalThis, { DOMMatrix, ImageData, Path2D });
const { getDocument, OPS } = await import('pdfjs-dist/legacy/build/pdf.mjs');
const task = getDocument({ data: new Uint8Array(readFileSync(process.argv[2])),
  wasmUrl: new URL('../../node_modules/pdfjs-dist/wasm/', import.meta.url).pathname });
try {
  const document = await task.promise;
  const page = await document.getPage(Number(process.argv[3]));
  const ops = await page.getOperatorList();
  const id = process.argv[4];
  if (!ops.fnArray.some((op, i) => op === OPS.paintImageXObject && ops.argsArray[i][0] === id))
    throw new Error('Requested image is not painted on this page');
  const im = await new Promise(resolve => page.objs.get(id, resolve));
  if (im.kind !== 2 || im.data.length !== im.width * im.height * 3)
    throw new Error('Only original RGB image XObjects are supported');
  const rgba = new Uint8ClampedArray(im.width * im.height * 4);
  for (let i = 0; i < im.width * im.height; i++) {
    rgba.set(im.data.subarray(i * 3, i * 3 + 3), i * 4);
    rgba[i * 4 + 3] = 255;
  }
  const canvas = createCanvas(im.width, im.height);
  canvas.getContext('2d').putImageData(new ImageData(rgba, im.width, im.height), 0, 0);
  writeFileSync(process.argv[5], canvas.toBuffer('image/png'));
  console.log(`Decoded original RGB bitmap ${id}: ${im.width}x${im.height}`);
} finally {
  await task.destroy();
}
