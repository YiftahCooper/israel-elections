// The Knesset on a date names factions as every other screen does (audit 12 Nov 2026, c-screens-people-04 and
// c-famous-late-09: "National Camp" on the timeline, "National Unity" on the seat cards and in MK history). A faction
// move's line is written from its faction ids; a split, merger or rename carries its factions as {f:id}; the names are
// the ones scripts/mk-history-runtime.ts compiles, through the same rule MK history uses.
import { describe, expect, test } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { compileMkHistory } from '../scripts/mk-history-runtime.ts';
import { compileTermTimeline, type TimelineItem } from '../scripts/term-timeline-runtime.ts';
import { eventLine, fillFactions } from '../src/history/termTimeline.ts';
import { factionLabel, factionMove, mkView } from '../src/history/mk.ts';
import { englishLabel } from '../src/data/names.ts';

const mk = compileMkHistory();
const rt = compileTermTimeline();
type Ev = { id: string; date: string; kind: string; who: { personIds?: number[]; factionIds?: number[] }; summary: { en: string; he: string }; line?: { en?: string; he?: string } };
const K = Array.from({ length: 26 }, (_, i) => i + 1);
const events = (k: number): Ev[] => existsSync(`data/research/knesset-events/k${k}.json`) ? JSON.parse(readFileSync(`data/research/knesset-events/k${k}.json`, 'utf8')).events : [];
const registry = (k: number) => new Set((JSON.parse(readFileSync(`data/research/knesset-member-changes/k${k}.json`, 'utf8')) as { factionRegistry: { id: number }[] }).factionRegistry.map((f) => f.id));
const name = (x: { he: string; en: string | null }, lang: 'he' | 'en') => lang === 'he' ? x.he : englishLabel(x.en, x.he);
const items = (k: number): TimelineItem[] => rt.terms[k]?.timeline?.steps.flatMap((s) => s.items) ?? [];
const LANGS = ['en', 'he'] as const;

describe('one name per faction: the timeline and MK history', () => {
  test('a faction’s shown name is the one MK history gives it, for every faction of every member in all 26 Knessets', () => {
    let n = 0;
    for (const id of Object.keys(mk.people)) for (const r of mkView(mk, Number(id))!.rows) for (const t of r.terms) for (const s of t.segments) for (const lang of LANGS) {
      expect(factionLabel(mk, s.faction, lang), `${id} k${r.k} ${s.faction}`).toBe(name(s, lang)); n++;
    }
    expect(n).toBeGreaterThan(8000);
  });

  test('every faction move in all 26 Knessets reads from its faction ids, with the names MK history shows for the same move', () => {
    let moves = 0, crossChecked = 0;
    for (const k of K) for (const e of events(k).filter((x) => x.kind === 'faction-membership-change')) {
      moves++;
      const ids = e.who.factionIds!; const count = e.who.personIds!.length;
      expect(ids, e.id).toHaveLength(2);
      const m = factionMove(mk, ids[0], ids[1]);
      for (const lang of LANGS) {
        const line = eventLine({ factions: [ids[0], ids[1]], count, en: null, he: null }, mk, lang);
        expect(line, `${e.id} ${lang}`).toBe(lang === 'he'
          ? `רישום החברות עבר מסיעת ${m.was.he} לסיעת ${m.now.he} (${count === 1 ? 'ח״כ אחד' : `${count} ח״כים`}).`
          : `${count} ${count === 1 ? 'MK' : 'MKs'} recorded moving from ${name(m.was, 'en')} to ${name(m.now, 'en')}.`);
      }
      // the same move on a moved member's MK history: the same two names (MK history leaves out records the Knesset
      // keeps but the app does not show, so not every move has a line there)
      const seen = e.who.personIds!.flatMap((p) => mk.people[p] ? mkView(mk, p)!.rows.filter((r) => r.k === k).flatMap((r) => r.events) : [])
        .find((x) => x.kind === 'faction' && x.date === e.date && x.faction!.was.faction === ids[0] && x.faction!.now.faction === ids[1]);
      if (seen) {
        crossChecked++;
        for (const lang of LANGS) expect([name(m.was, lang), name(m.now, lang)], `${e.id} ${lang}`).toEqual([name(seen.faction!.was, lang), name(seen.faction!.now, lang)]);
      }
    }
    expect(moves).toBe(293);
    expect(crossChecked).toBeGreaterThanOrEqual(280);
  });

  test('a faction move on a timeline carries its factions and head count, and no research wording', () => {
    for (const k of K) {
      const byId = new Map(events(k).map((e) => [e.id, e]));
      for (const it of items(k).filter((x) => x.kind === 'faction-membership-change')) {
        const e = byId.get(it.id)!;
        expect(it.factions, it.id).toEqual(e.who.factionIds);
        expect(it.count, it.id).toBe(e.who.personIds!.length);
        expect([it.en, it.he], it.id).toEqual([null, null]);
      }
    }
  });

  test('every split, merger, rename or exit from a faction on a timeline names its factions by id, never in free text', () => {
    let n = 0;
    for (const k of K) for (const it of items(k)) {
      if (!/^faction-|left-faction/.test(it.kind) || it.kind === 'faction-membership-change') continue;
      n++;
      for (const lang of LANGS) expect(it[lang], `${it.id} ${lang}`).toMatch(/\{f:\d+\}/);
    }
    expect(n).toBeGreaterThanOrEqual(9);
  });

  test('every line written with faction ids names factions of its own Knesset, in English and Hebrew', () => {
    for (const k of K) {
      const own = registry(k);
      for (const e of events(k).filter((x) => x.line)) for (const lang of LANGS) {
        const text = e.line![lang]!;
        const ids = [...text.matchAll(/\{f:(\d+)\}/g)].map((m) => Number(m[1]));
        expect(ids.length, `${e.id} ${lang}`).toBeGreaterThan(0);
        for (const id of ids) { expect(own.has(id), `${e.id} ${id}`).toBe(true); expect(factionLabel(mk, id, lang), `${e.id} ${id}`).not.toBe(''); }
        const shown = fillFactions(mk, text, lang);
        expect(shown).not.toMatch(/[{}]/);
        // a Hebrew prefix letter written before a name: never before the article (ל + הרשימה reads לרשימה)
        if (lang === 'he') for (const m of text.matchAll(/([למבכ])\{f:(\d+)\}/g)) expect(factionLabel(mk, Number(m[2]), 'he').startsWith('ה'), `${e.id} ${m[0]}`).toBe(false);
      }
    }
  });
});

describe('the steps the audit named', () => {
  const line = (k: number, id: string, lang: 'en' | 'he') => eventLine(items(k).find((x) => x.id === id)!, mk, lang);
  test('25th Knesset, 13 Mar 2024: the faction is named as on the seat cards and in MK history', () => {
    expect(line(25, 'k25-faction-3', 'en')).toBe('4 MKs recorded moving from National Unity to National Right.');
    expect(line(25, 'k25-faction-3', 'he')).toBe('רישום החברות עבר מסיעת המחנה הממלכתי לסיעת הימין הממלכתי (4 ח״כים).');
  });
  test('24th Knesset, 15 Aug 2022: the splits name National Unity and Beyahad, as the seat cards do', () => {
    expect(line(24, 'k24-committee-2022-08-15-18', 'en')).toBe('Yamina splits into Yamina and National Unity; National Unity then splits into National Unity and Beyahad (Bennett); New Hope splits into New Hope – Unity for Israel and Derekh Eretz.');
    expect(line(24, 'k24-committee-2022-08-15-18', 'he')).toBe('אושרו התפלגויות ימינה, המחנה הממלכתי ותקווה חדשה.');
    expect(line(24, 'k24-committee-2022-08-15-16', 'en')).toBe('United Torah Judaism faction splits into Degel HaTorah and Agudat Yisrael.');
  });
  test('21st Knesset, 4 Sep 2019: the faction formed by the list is named as the list', () => {
    expect(line(21, 'k21-observed-faction-7', 'en')).toBe('1 MK recorded moving from Ahi to Union of Right-Wing Parties.');
  });
});
