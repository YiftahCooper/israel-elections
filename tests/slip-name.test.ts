// A list's slip and name, as the seat card heads it. Review V3 F5, 19 Nov 2026: where the slip already shows the ballot
// letters, "(letters)" followed the name again ("[ב] Yamina (ב)"); they are written only where the slip shows a logo
// instead (or a merged list's icon, which shows the letters of the lists merged, not its own).
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { SlipName } from '../src/app/components/ui.tsx';
import { scenarioFromDataset } from '../src/model/scenario.ts';

const lists = scenarioFromDataset(JSON.parse(readFileSync('public/data/k24.json', 'utf8'))).lists;
const text = (html: string) => html.replace(/<[^>]+>/g, '');

it('the ballot letters are written once: in the slip, or after the name when the slip shows a logo', () => {
  const yamina = lists.find((l) => l.id === '24-ב')!, likud = lists.find((l) => l.id === '24-מחל')!;
  expect(yamina.logo).toBeFalsy();
  expect(likud.logo).toBeTruthy();
  const y = renderToStaticMarkup(createElement(SlipName, { list: yamina, name: 'Yamina' }));
  expect(text(y).match(/ב/g)?.length, y).toBe(1);
  expect(text(y)).not.toContain('(ב)');
  const l = renderToStaticMarkup(createElement(SlipName, { list: likud, name: 'Likud' }));
  expect(text(l)).toContain('(מחל)');
});
