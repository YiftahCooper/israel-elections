/** Minimal winning coalitions: sets of lists with at least `majority` seats in which every member is
 *  needed (removing the smallest member drops below the majority). Every set must contain `required`.
 *
 *  Depth-first over the lists in their given order. A set that reaches the majority is never extended,
 *  because any superset of a winning set has a superfluous member; a branch stops when even all the
 *  remaining lists could not reach the majority. Results are ordered as the former exhaustive
 *  enumeration ordered them: by size, then seats, then by the bitmask of positions (first list = bit 0). */
export function minimalWinning<T extends { id: string; n: number }>(items: readonly T[], majority: number, required: readonly string[] = [], limit = 100_000) {
  const N = items.length;
  const suffix = new Array<number>(N + 1).fill(0);
  for (let i = N - 1; i >= 0; i--) suffix[i] = suffix[i + 1] + items[i].n;
  const need = new Set(required);
  const out: { ids: string[]; n: number; key: bigint }[] = [];
  const chosen: number[] = [];
  let truncated = false;
  const visit = (i: number, sum: number, min: number, missing: number) => {
    if (out.length >= limit) { truncated = true; return; }
    if (sum >= majority) {
      if (missing === 0 && sum - min < majority) {
        let key = 0n; for (const k of chosen) key |= 1n << BigInt(k);
        out.push({ ids: chosen.map((k) => items[k].id), n: sum, key });
      }
      return;
    }
    if (i >= N || sum + suffix[i] < majority) return;
    // with: required lists must be taken, so their "without" branch is skipped
    chosen.push(i);
    visit(i + 1, sum + items[i].n, Math.min(min, items[i].n), missing - (need.has(items[i].id) ? 1 : 0));
    chosen.pop();
    if (!need.has(items[i].id)) visit(i + 1, sum, min, missing);
  };
  const missing = required.filter((id) => items.some((x) => x.id === id)).length;
  if (missing === required.length) visit(0, 0, Infinity, missing);
  out.sort((a, b) => a.ids.length - b.ids.length || a.n - b.n || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  return { coalitions: out.map(({ ids, n }) => ({ ids, n })), truncated };
}
