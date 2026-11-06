/** Code keys for coded results; row-index keys keep inferred 2006 identities out of the official result rows. */
export function localityLocationKey(row: { code: number | null }, index: number): string {
  return row.code === null ? `row:${index}` : String(row.code);
}
