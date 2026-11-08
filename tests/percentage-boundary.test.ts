import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from 'vitest';

// Every rounded percentage on screen goes through src/app/components/Percentage.tsx, which gives it the exact-value
// disclosure (hover, focus, tap). A direct fmtPct / fmtPctNum / toFixed in a component would render a rounded value
// without it. The only exceptions are listed here, each with why it is not an on-screen rounded share.
const ALLOWED: { file: string; has: string; why: string }[] = [
  { file: 'TopBar.tsx', has: '.toFixed(6)', why: 'CSV export: raw data, not on screen' },
  { file: 'ui.tsx', has: 'value.toFixed(digits)', why: 'the editable text of a number input' },
  { file: 'Families.tsx', has: ".toFixed(digits):'10')", why: 'the editable text of a number input' },
  { file: 'FamilyCharts.tsx', has: '+v.toFixed(1)}%', why: 'axis ticks: round values, shown in full' },
  { file: 'FamilyCharts.tsx', has: "fmtPct(v,e.totals.valid,digits)+' · '", why: 'aria-label text for a chart point; its tooltip uses Percentage' },
  { file: 'LocalityMap.tsx', has: 'near.km.toFixed(1)', why: 'a distance, not a percentage' },
  { file: 'LocalityMap.tsx', has: 'p.row.valid) * 100).toFixed(digits))', why: 'a map hover tooltip (not interactive); selecting the dot shows the margin with Percentage' },
  { file: 'Turnout.tsx', has: 'Math.abs(d.change).toFixed(digits)', why: 'an entered change in the action label, shown in full' },
  { file: 'Turnout.tsx', has: 'aria-valuetext={`${fmtPctNum(', why: 'slider value text for assistive technology' },
  { file: 'Turnout.tsx', has: 'aria-label={lists.filter', why: 'aria-label of the mix bar; its legend uses Percentage' },
  { file: 'Turnout.tsx', has: 'title={`${listLabel(s.lists[i], lang)} ${fmtPctNum(', why: 'segment title; the legend beside it uses Percentage' },
  { file: 'Turnout.tsx', has: "title={`${L('Other lists', 'רשימות אחרות')} ${fmtPctNum(", why: 'segment title; the legend beside it uses Percentage' },
  { file: 'ListBars.tsx', has: 'id={`lbd-${l.id}`}', why: 'screen-reader description of the row; the visible value uses Percentage' },
  { file: 'PartyHistory.tsx', has: 'fmtPct(p.votes, p.valid, digits)}${own}`', why: 'aria-label and title of a history bar; the selected-election card and the table use Percentage' },
  { file: 'TurnoutFacts.tsx', has: "${L('turnout', 'הצבעה')} ${fmtPct(", why: 'aria-label of a chart column; the readout and the table beside it use Percentage' },
  { file: 'Figures.tsx', has: 'd={fmtPct(cast, s.registered, digits) === fmtPct(', why: 'a comparison of two rounded strings, not output' },
];
const TOKEN = /\bfmtPct\(|\bfmtPctNum\(|\.toFixed\(/;

const files = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)]);

test('rounded percentages in components go through the shared Percentage component', () => {
  const offenders: string[] = [], used = new Set<number>();
  for (const file of files('src/app').filter(f => f.endsWith('.tsx') && !f.endsWith('/Percentage.tsx'))) {
    readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
      if (!TOKEN.test(line)) return;
      const k = ALLOWED.findIndex(a => file.endsWith(`/${a.file}`) && line.includes(a.has));
      if (k < 0) offenders.push(`${file}:${i + 1}`); else used.add(k);
    });
  }
  expect(offenders).toEqual([]);
  // an exception that no longer matches anything must be removed, so the list stays exact
  expect(ALLOWED.filter((_, k) => !used.has(k)).map(a => `${a.file}: ${a.has}`)).toEqual([]);
});
