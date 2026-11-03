import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { writeIfChanged } from '../scripts/lib/build/output.ts';
import { inKeyOrder } from '../scripts/lib/build/records.ts';

describe('dataset writer keeps unchanged files and their builtAt', () => {
  const dir = mkdtempSync(join(tmpdir(), 'build-output-'));
  const file = join(dir, 'k99.json');
  afterEach(() => rmSync(file, { force: true }));
  const ds = (votes: number, builtAt: string) => ({ id: 'k99', votes, buildInfo: { builtAt, rawSha256: { a: 'x' } } });

  it('writes a new file', () => {
    expect(writeIfChanged(file, ds(1, 'T1'))).toBe('written');
    expect(readFileSync(file, 'utf8')).toBe(JSON.stringify(ds(1, 'T1')));
  });
  it('leaves the file untouched when only builtAt would change', () => {
    writeFileSync(file, JSON.stringify(ds(1, 'T1')));
    const before = statSync(file).mtimeMs;
    expect(writeIfChanged(file, ds(1, 'T2'))).toBe('unchanged');
    expect(readFileSync(file, 'utf8')).toBe(JSON.stringify(ds(1, 'T1')));
    expect(statSync(file).mtimeMs).toBe(before);
  });
  it('rewrites with the new builtAt when any content changes', () => {
    writeFileSync(file, JSON.stringify(ds(1, 'T1')));
    expect(writeIfChanged(file, ds(2, 'T2'))).toBe('written');
    expect(JSON.parse(readFileSync(file, 'utf8')).buildInfo.builtAt).toBe('T2');
  });
  it('compares files without builtAt byte for byte, with their own serializer', () => {
    const pretty = (v: object) => JSON.stringify(v, null, 1);
    writeFileSync(file, pretty([{ id: 'a' }]));
    expect(writeIfChanged(file, [{ id: 'a' }], pretty)).toBe('unchanged');
    expect(writeIfChanged(file, [{ id: 'a' }])).toBe('written');
  });
});

describe('serialized key order', () => {
  it('follows the declared order and drops undefined values', () => {
    expect(JSON.stringify(inKeyOrder({ b: 2, a: 1, c: undefined }, ['a', 'b', 'c']))).toBe('{"a":1,"b":2}');
  });
  it('refuses a field with no declared position instead of dropping it', () => {
    expect(() => inKeyOrder({ a: 1, extra: true }, ['a'])).toThrow(/extra/);
  });
});
