// Independent implementation of sections 81–82 supplied by the bug hunt: it must not share
// allocation helpers with src/engine. Covers Bader–Ofer and largest remainders with every optional
// semantic, two-list agreements (disjoint pairs only) and candidate caps; not Sainte-Laguë.
import type { AllocationInput } from '../src/engine/types.ts';

export function reference(x: AllocationInput): number[] {
  const { rules: r, lists: ls } = x;
  const total = ls.reduce((s, l) => s + (l.withdrawn ? 0n : l.votes), 0n);
  const live = ls.map((_, i) => i).filter(i => !ls[i].withdrawn && ls[i].votes > 0n && ls[i].votes * r.threshold.den >= total * r.threshold.num);
  const answer = ls.map(() => 0);
  if (!live.length) return answer;
  function initial(v: bigint[], n: number, caps: number[] = v.map(() => Infinity)): { seats: number[]; qnum: bigint; qden: bigint } {
    if (!n) return { seats: v.map(() => 0), qnum: 0n, qden: 1n };
    const sum = v.reduce((a, b) => a + b, 0n);
    let qden = r.quotaRounding === 'floor' ? 1n : BigInt(n + (r.quotaSeatOffset ?? 0));
    let qnum = r.quotaRounding === 'floor' ? sum / BigInt(n + (r.quotaSeatOffset ?? 0)) : sum;
    if (!qnum) { qnum = sum; qden = BigInt(n); }
    let seats = v.map(w => Number(w * qden / qnum));
    if (seats.reduce((a,b)=>a+b,0) > n) {
      qnum = sum; qden = BigInt(n); seats = v.map(w=>Number(w*qden/qnum));
    }
    return { seats: seats.map((s, i) => Math.min(s, caps[i])), qnum, qden };
  }
  // canFill (1977, decision 0095): a unit that cannot seat one more member is passed over while another unit can take
  // the seat; when none can, the passed-over units compete again and the check stops
  function finish(v: bigint[], start: ReturnType<typeof initial>, n: number, ids: string[], stage: string, caps: number[] = v.map(() => Infinity), canFill?: (i: number, seats: number) => boolean): number[] {
    const seats = [...start.seats];
    const used = new Set<number>();
    const passed = new Set<number>();
    let checking = !!canFill;
    const sum = v.reduce((a, b) => a + b, 0n);
    let step = 0;
    while (seats.reduce((a, b) => a + b, 0) < n) {
      step++;
      const capped = (i: number) => (r.majorityCap && 2n*v[i] <= sum && 2*seats[i] >= n) || passed.has(i);
      if (r.remainderMethod === 'largest-remainder' && r.largestRemainderRepeat !== false && v.every((_,i)=>used.has(i) || capped(i))) used.clear();
      const eligible = v.map((_, i) => i).filter(i => v[i] > 0n && !capped(i) && seats[i] < caps[i]
        && (!r.remainderRequiresInitialSeat || start.seats[i] > 0)
        && (r.remainderMethod !== 'largest-remainder' || !used.has(i)));
      const score = (i: number): [bigint,bigint] => {
        if (r.remainderMethod === 'largest-remainder') return [v[i]*start.qden-start.qnum*BigInt(seats[i]),start.qden];
        const d=BigInt(seats[i]+1); return r.quotientRounding === 'floor' ? [v[i]/d,1n] : [v[i],d];
      };
      const compare=(i:number,j:number)=>{const [a,b]=score(i),[c,d]=score(j);return a*d-c*b;};
      if (!eligible.length && checking && passed.size) { checking = false; passed.clear(); step--; continue; }
      if (!eligible.length) break;
      let best = eligible[0];
      for (const i of eligible) if (compare(i,best)>0n) best = i;
      const tied = eligible.filter(i => compare(i,best)===0n);
      const key = `${stage}:${step}:${tied.map(i => ids[i]).sort().join('|')}`;
      const forced = tied.find(i => ids[i] === x.lotteryWinners?.[key]);
      const winner = forced ?? best;
      if (checking && !canFill!(winner, seats[winner] + 1)) { passed.add(winner); step--; continue; }
      seats[winner]++; used.add(winner);
    }
    return seats;
  }
  const capacities = ls.map(l => r.seatsCappedAtCandidates ? l.candidateCount ?? Infinity : Infinity);
  const starting = initial(live.map(i => ls[i].votes), r.seats, live.map(i => capacities[i]));
  const pairs = x.agreements.filter(a => a.members.length === 2 && a.members.every(id => live.some((i,k) => ls[i].id === id && (!r.agreementRequiresInitialSeat || starting.seats[k] > 0)))).map(a => ({ id: a.id, ix: a.members.map(id => ls.findIndex(l => l.id === id)) }));
  const groups: number[][] = []; const unitIds: string[] = []; const claimed = new Set<number>();
  for (const i of live) {
    if (claimed.has(i)) continue;
    const pair = pairs.find(p => p.ix.includes(i));
    const group = pair ? pair.ix : [i];
    groups.push(group); unitIds.push(pair?.id ?? ls[i].id); group.forEach(j => claimed.add(j));
  }
  const votes = groups.map(g => g.reduce((sum, i) => sum + ls[i].votes, 0n));
  const seats = groups.map(g => g.reduce((sum, i) => sum + starting.seats[live.indexOf(i)], 0));
  const divide = (j: number, n: number) => {
    const g = groups[j], memberVotes = g.map(i => ls[i].votes), memberCaps = g.map(i => capacities[i]);
    return g.length === 1 ? [n] : finish(memberVotes, initial(memberVotes, n, memberCaps), n, g.map(i => ls[i].id), `internal:${unitIds[j]}`, memberCaps);
  };
  const canFill = (j: number, n: number) => groups[j].length === 1 || groups[j].every(i => capacities[i] === Infinity) || divide(j, n).reduce((a, b) => a + b, 0) === n;
  const final = finish(votes, { ...starting, seats }, r.seats, unitIds, 'national', groups.map(g => g.reduce((s, i) => s + capacities[i], 0)), r.seatsCappedAtCandidates ? canFill : undefined);
  groups.forEach((g, j) => {
    const division = divide(j, final[j]);
    g.forEach((i, k) => { answer[i] = division[k]; });
  });
  return answer;
}
