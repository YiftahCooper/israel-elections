// Wording rules from the 12 Nov audit (fx-copy): Hebrew prefixes, one name per idea, counts in the right number.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { hebrewPrefixName } from '../src/app/hebrewPrefix.ts';
import { METHODS, methodOf, referenceLabel } from '../src/app/derive.ts';
import { GLOSSARY_TERMS as GLOSSARY } from '../src/app/glossary-data.ts';
import { countOf, seatsText, votesText } from '../src/app/format.ts';

const files = (dir: string): string[] => readdirSync(dir).flatMap(f => { const p = join(dir, f); return statSync(p).isDirectory() ? files(p) : /\.tsx?$/.test(f) ? [p] : []; });
const SRC = files('src').map(p => [p, readFileSync(p, 'utf8')] as const);

describe('a Hebrew prefix takes the place of the article (c-hebrew-31)', () => {
  it('drops the article after ב, ל and כ for a list, party or bloc name', () => {
    expect(hebrewPrefixName('ל', 'הבית היהודי')).toBe('לבית היהודי');
    expect(hebrewPrefixName('ב', 'התוצאה הרשמית')).toBe('בתוצאה הרשמית');
    expect(hebrewPrefixName('ל', 'הקואליציה')).toBe('לקואליציה');
    expect(hebrewPrefixName('כ', 'המערך')).toBe('כמערך');
  });
  it('keeps it after מ, ו and ש, and keeps a ה that is part of the word', () => {
    expect(hebrewPrefixName('מ', 'הליכוד')).toBe('מהליכוד');
    expect(hebrewPrefixName('ו', 'העבודה')).toBe('והעבודה');
    expect(hebrewPrefixName('ל', 'הסתדרות הציונים הכלליים')).toBe('להסתדרות הציונים הכלליים');
    expect(hebrewPrefixName('ל', 'התאחדות הספרדים')).toBe('להתאחדות הספרדים');
    expect(hebrewPrefixName('ל', 'Unity')).toBe('ל־Unity');
    expect(hebrewPrefixName('ל', 'ש״ס')).toBe('לש״ס');
  });
  it('says "בתוצאה הרשמית" on a changed list row, and leaves a saved scenario’s own name alone', () => {
    expect(referenceLabel(null, 'he').more).toBe(' יותר מאשר בתוצאה הרשמית');
    expect(referenceLabel(null, 'he').fewer).toBe(' פחות מאשר בתוצאה הרשמית');
    expect(referenceLabel({ name: 'הסכם חדש' }, 'he').more).toBe(' יותר מאשר בהסכם חדש');
  });
});

describe('one Hebrew name per allocation method (c-hebrew-16)', () => {
  const name = (term: string) => GLOSSARY.find(g => g.id === term)!.nameHe.replace(/^שיטת /, '');
  it.each(Object.entries(METHODS))('%s: the method’s name contains its glossary entry’s name', (_, m) => {
    expect(m.he).toContain(name(m.term));
  });
  it('1949’s highest averages too', () => {
    const m = methodOf({ remainderMethod: 'bader-ofer', remainderRequiresInitialSeat: true });
    expect(m.he).toBe(name(m.term));
  });
});

describe('retired Hebrew wording stays out of the app', () => {
  const RETIRED: [RegExp, string][] = [
    [/באדר/, 'Bader is בדר'], [/ד'הונט|ד׳הונט\b/, 'D’Hondt is ד׳הונדט'], [/מודדי? דרופ|מודד הייר/, 'Droop and Hare quotas are מכסה'],
    [/סנט-לגה|סנט־לגה מתוקנת/, 'סנט־לגה (המשופרת)'], [/יישומון|היישום\b|ביישום/, 'the app is האפליקציה'], [/כשבבים/, 'chips are תגיות'],
    [/: אופס[`']/, 'reset is "ההגדרות אופסו"'], [/בבנייה זו/, 'build is גרסה'], [/ריצה ב[־-]?\$\{|ריצה בנפרד/, 'running as lists is התמודדות'],
    [/נקודת הייחוס|נקודת השוואה:|'מושווה (עם|ל)'|השוואה מול/, 'one word for reference / compared with'],
    [/'חזרה'|'חזרה: '/, 'Redo is ביצוע מחדש'], [/'גושים'\) ?\}\]|o\('blocks', 'Blocks', 'גושים'\)/, 'the Blocks layout is משבצות, not blocs'],
    [/מצביעים חדשים \/ נמנעים|הנמנעים`|\(או נמנעים\)/, 'people who did not vote are not נמנעים'],
    [/'ראשוני'/, 'Provisional is זמני'], [/בבחירות אחת/, 'one election is מערכת בחירות אחת'], [/מגיעים מ־'/, 'no label ends in a bare prefix'],
  ];
  it.each(RETIRED)('%s (%s)', (re) => {
    expect(SRC.filter(([, t]) => re.test(t)).map(([p]) => p)).toEqual([]);
  });
  it('a Hebrew prefix before a number takes a maqaf, not a hyphen (c-hebrew-24)', () => {
    // quoted law and source titles keep their published form
    const keep = /תש"ט-1948|התשכ"ט-1969|התשנ"ד-1994|title: 'תוצאות הבחירות לכנסת ה-25|יום הבחירות לכנסת ה-26|nameHe: 'הבחירות לכנסת ה-2[56]'/;
    const bad = SRC.flatMap(([p, t]) => t.split('\n').filter(l => /(?<![א-ת])[א-ת]{1,2}-(?=[0-9$(%])/.test(l.replace(new RegExp(keep, 'g'), ''))).map(l => `${p}: ${l.trim().slice(0, 80)}`));
    expect(bad).toEqual([]);
  });
});

describe('counts are singular for one (c-english-02)', () => {
  it('seat and vote counts', () => {
    expect(seatsText(1, 'en')).toBe('1 seat');
    expect(seatsText(2, 'en')).toBe('2 seats');
    expect(seatsText(1, 'he')).toBe('מנדט אחד');
    expect(seatsText(12, 'he')).toBe('12 מנדטים');
    expect(votesText(1, 'en')).toBe('1 vote');
    expect(votesText(1234n, 'he')).toBe('1,234 קולות');
    expect(countOf(1, 'he', ['list', 'lists'], ['רשימה אחת', 'רשימות'])).toBe('רשימה אחת');
  });
  it('no template writes "(s)"', () => {
    expect(SRC.filter(([p, t]) => !p.includes('relations.ts') && /\b(seat|member|candidate|change|vote|list|locality|election)\(s\)/.test(t)).map(([p]) => p)).toEqual([]);
  });
});

describe('a share short of the whole is never shown as the whole (c-docs-numbers-01/05)', () => {
  it('fmtPct keeps "<" at the bottom and adds ">" at the top', async () => {
    const { fmtPct, fmtPoints, pctExactNote } = await import('../src/app/format.ts');
    expect(fmtPct(9997n, 10000n, 1)).toBe('>99.9%');
    expect(fmtPct(9996n, 10000n, 0)).toBe('>99%');
    expect(fmtPct(10000n, 10000n, 1)).toBe('100%');
    expect(fmtPct(9990n, 10000n, 1)).toBe('99.9%');
    expect(fmtPct(1n, 100000n, 1)).toBe('<0.1%');
    expect(fmtPoints(99.97, 1)).toBe('+>99.9');
    expect(fmtPoints(100, 1)).toBe('+100');
    expect(pctExactNote(9997n, 10000n, 1, undefined, 'en')).not.toMatch(/^>/);
  });
});

describe('a one-member faction is named as one (fx-copy, also-yours 1)', () => {
  it('the timeline and MK history say "single-member faction of Idan Roll", not "to MK Idan Roll"', async () => {
    const { factionMoveLine } = await import('../src/history/termTimeline.ts');
    const { soloFactionMember } = await import('../src/history/mk.ts');
    const rt = { factions: { 1102: ['יש עתיד', 'Yesh Atid', '#00f'], 1109: ['חה״כ עידן רול', 'MK Idan Roll', null] } } as never;
    expect(factionMoveLine(rt, [1102, 1109], 1, 'en')).toBe('1 MK recorded moving from Yesh Atid to the single-member faction of Idan Roll.');
    expect(factionMoveLine(rt, [1102, 1109], 1, 'he')).toBe('רישום החברות עבר מסיעת יש עתיד לסיעת היחיד של עידן רול (ח״כ אחד).');
    expect(factionMoveLine(rt, [1109, 1102], 1, 'en')).toBe('1 MK recorded moving from the single-member faction of Idan Roll to Yesh Atid.');
    expect(soloFactionMember({ he: 'יש עתיד', en: 'Yesh Atid' }, 'en')).toBeNull();
  });
});
