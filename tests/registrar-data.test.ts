/** Retained official-source integrity and the limits of the resulting lineage claims. */
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

const snapshot = JSON.parse(readFileSync('data/raw/registrar/parties-2026-11-08.json', 'utf8'));
const manifest = JSON.parse(readFileSync('data/raw/SOURCES.json', 'utf8'));
const lineage = JSON.parse(readFileSync('data/meta/party-lineage.json', 'utf8'));
const rows = snapshot.records as Record<string, string>[];
const row = (number: string) => rows.find(r => r['מספר מפלגה'] === number)!;
const edge = (id: string) => lineage.edges.find((e: { id: string }) => e.id === id);

describe('retained Registrar snapshot', () => {
  it('retains every registration with only the four permitted columns', () => {
    expect(rows).toHaveLength(snapshot.metadata.total);
    expect(rows).toHaveLength(170);
    expect(new Set(rows.map(r => r['מספר מפלגה'])).size).toBe(rows.length);
    for (const r of rows) expect(Object.keys(r)).toEqual(['שם מפלגה', 'מספר מפלגה', 'תאריך רישום', 'מטרות']);
  });
  it.each(['json', 'csv'])('pins the retained %s bytes in the provenance manifest', ext => {
    const entry = manifest.find((s: { id: string }) => s.id === `registrar-parties-2026-11-08-${ext}`);
    const bytes = readFileSync(`data/raw/${entry.file}`);
    expect(bytes.length).toBe(entry.bytes);
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(entry.sha256);
    expect(entry.official).toBe(true);
  });
  it('excludes contact details, including the embedded objectives prefix', () => {
    const text = JSON.stringify(rows);
    expect(text).not.toMatch(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i);
    expect(text).not.toMatch(/\b0[2-9][\d -]{7,10}\b/);
    expect(row('59-900147-6')['מטרות'].startsWith('מטרות המפלגה:')).toBe(true);
    // Recreate the documented CSV projection without normalising source text.
    const cell = (s: string) => /[",\r\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
    const csv = [snapshot.metadata.retainedFields, ...rows.map(r => snapshot.metadata.retainedFields.map((k: string) => r[k]))]
      .map((r: string[]) => r.map(cell).join(',')).join('\r\n') + '\r\n';
    expect(readFileSync('data/raw/registrar/parties-2026-11-08.csv', 'utf8')).toBe(csv);
  });
  it('records the Labor name conflict (disputed name, probable continuity) and separate Meretz registration', () => {
    expect(row('59-900001-5')['שם מפלגה']).toBe('מפלגת העבודה הישראלית');
    expect(row('59-900065-0')['שם מפלגה']).toBe('מרצ');
    expect(edge('labor-democrats-rename').certainty).toBe('probable');
    expect(lineage.pending.find((p: { id: string }) => p.id === 'democrats-registrar-date').certainty).toBe('disputed');
    expect(edge('partners-26-אמת')).toMatchObject({ relation: 'electoral-partner', certainty: 'confirmed' });
    expect(edge('nrp-jewish-home-2008').certainty).toBe('confirmed');
    // A current register is not primary proof of these historical merger dates.
    expect(edge('meretz-legal-2003').certainty).toBe('probable');
    expect(edge('baaliyah-likud-2003').certainty).toBe('probable');
    expect(row('59-900008-0')['שם מפלגה']).toContain('מיסודה של המפד~ל');
  });
  it('keeps missing identity and historical-date evidence open', () => {
    for (const id of ['koach-distinct-registration', 'achi-distinct-registration', 'nrp-registrar-date']) {
      expect(lineage.pending.find((p: { id: string }) => p.id === id).certainty).toBe('unknown');
    }
    expect(rows.filter(r => r['תאריך רישום'])).toHaveLength(10);
    expect(row('59-900008-0')['תאריך רישום']).toBe('');
  });
});
