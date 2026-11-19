/** Splits Hebrew text into its quoted English parts and the rest, so a view can isolate each English quotation as one
 *  left-to-right island inside the Hebrew. English text, or Hebrew with no quoted English, comes back whole. */
export function latinQuotesInHebrew(text: string): { text: string; latin: boolean }[] {
  const hebrew = text.match(/[א-ת]/g)?.length ?? 0, latin = text.match(/[A-Za-z]/g)?.length ?? 0;
  if (!hebrew || hebrew <= latin / 4) return [{ text, latin: false }];
  const parts = text.split(/("[^"א-ת]*[A-Za-z][^"א-ת]*"|“[^”א-ת]*[A-Za-z][^”א-ת]*”)/);
  // split() puts each captured quotation at an odd index
  return parts.map((p, i) => ({ text: p, latin: i % 2 === 1 })).filter((p) => p.text !== '');
}

/** Text with each English quotation inside Hebrew isolated left to right (a candidate note quoting "Yeushua Sagi"). */
export function IsolatedText({ text }: { text: string }) {
  const parts = latinQuotesInHebrew(text);
  return <>{parts.map((p, i) => p.latin ? <bdi key={i} dir="ltr">{p.text}</bdi> : p.text)}</>;
}
