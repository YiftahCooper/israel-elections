import { describe, expect, test } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { logoCredit, logoCreditLine, logoLicence } from '../src/app/logoCredit.ts';
import type { ElectionDataset, LogoRef } from '../src/data/schema.ts';

// Review faults S1/S2 (19 Nov): on the Hebrew Sources tab every source description, publisher and logo licence was
// English, and several descriptions were the project's fetch notes ("gov.il returns HTTP 403 to scripted clients",
// "Refuses connections from outside Israel; a cached early-count snapshot …"). What the tab shows is now display text
// in both languages; the research record stays in the download.
const datasets = readdirSync('public/data').filter(f => /^k\d+\.json$/.test(f)).map(f => JSON.parse(readFileSync(`public/data/${f}`, 'utf8')) as ElectionDataset);
const sources = JSON.parse(readFileSync('public/data/sources.json', 'utf8')) as { id: string; own?: boolean; publisher: string; publisherHe?: string; shownEn?: string; shownHe?: string }[];
const byId = new Map(sources.map(s => [s.id, s]));
const shownIds = [...new Set(datasets.flatMap(d => d.sourceIds))].filter(id => byId.get(id) && !byId.get(id)!.own);
// words that belong to how the project fetched or checked a page, never to what the source is
const INTERNAL = /HTTP|\b40[34]\b|JSON|scripted|Exa\b|reconcil|cached|captured|cross-check|visually|pixel|\bSHA\b|search-index|elected-prefix|not independent|fetch/i;
const hebrew = /[א-ת]/;

describe('Sources tab text', () => {
  test('every official or secondary source shown has display text in both languages, with no fetch notes', () => {
    expect(shownIds.length).toBeGreaterThan(100);
    for (const id of shownIds) {
      const s = byId.get(id)!;
      expect(s.shownEn, id).toBeTruthy();
      expect(s.shownHe, id).toMatch(hebrew);
      expect(s.shownEn, id).not.toMatch(INTERNAL);
      expect(s.shownHe, id).not.toMatch(INTERNAL);
    }
  });
  test('every publisher shown on the Hebrew tab is in Hebrew (a byline name excepted)', () => {
    for (const id of shownIds) {
      const s = byId.get(id)!, he = s.publisherHe ?? s.publisher;
      if (he === 'Ynet / Hanan Greenberg') continue;
      expect(he, id).toMatch(hebrew);
    }
  });
  test('the tab no longer renders research notes or words after an address', () => {
    const panels = readFileSync('src/app/components/Panels.tsx', 'utf8');
    expect(panels).not.toMatch(/x\.note\b/);
    expect(panels).not.toMatch(/rest\.join\(' '\)/);
    expect(readFileSync('src/app/components/AfterElection.tsx', 'utf8')).not.toMatch(/candidatesPending\.map/);
  });
});

describe('logo credits and licences', () => {
  const logos = new Map<string, LogoRef>();
  for (const d of datasets) for (const l of d.lists) for (const x of [l.logo, ...(l.parties ?? []).map(p => p.logo)]) if (x) logos.set(x.file, x);
  test('every logo has a Hebrew licence and credit, with no project id or processing note', () => {
    expect(logos.size).toBeGreaterThan(100);
    for (const [file, x] of logos) {
      const he = logoCreditLine(x, 'he'), en = logoCreditLine(x, 'en');
      expect(logoLicence(x, 'he'), file).toMatch(hebrew);
      expect(he, file).toMatch(hebrew);
      for (const t of [he, en]) {
        expect(t, file).not.toMatch(/^[a-z]+(-[a-z]+)* —/);
        expect(t, file).not.toMatch(/Resized|resize|crop|File:|PD-|uploader|not recorded/i);
      }
      expect(logoLicence(x, 'en'), file).not.toMatch(/PD-|cc-zero|Copyright retained by/);
    }
  });
  test('licences and credits read as a visitor expects', () => {
    const fair = { rights: 'fair-use-identification', licence: 'Copyright retained by rights holder; fair-use identification', attribution: 'yesh-atid — official campaign website logo; proportionally resized only.', sourceUrl: 'https://www.yeshatid.org.il/', file: 'x.png' } as const;
    expect(logoLicence(fair, 'he')).toBe('שימוש הוגן לזיהוי; הזכויות שמורות לבעליהן');
    expect(logoCreditLine(fair, 'en')).toBe('Official mark · the party’s website');
    const commons = { rights: 'free-licence', licence: 'CC BY-SA 4.0', attribution: 'הספרייה הלאומית; File:Logo Tehiya.png; CC BY-SA 4.0. Resized to at most 256 px.', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Logo_Tehiya.png', file: 'y.png' } as const;
    expect(logoCredit(commons, 'en')).toEqual({ by: 'National Library of Israel', where: 'Wikimedia Commons' });
    expect(logoCredit(commons, 'he')).toEqual({ by: 'הספרייה הלאומית', where: 'ויקישיתוף' });
    expect(logoLicence(commons, 'he')).toBe('רישיון CC BY-SA 4.0');
    expect(logoLicence({ rights: 'free-licence', licence: 'Public domain (PD-textlogo)' }, 'en')).toBe('Public domain');
  });
});
