// Writes generated files under public/data without churning unchanged ones.
//
// A dataset's buildInfo.builtAt records when its *content* last changed. Before writing, the new
// dataset is serialized with the previous file's builtAt; if that is byte-identical to the file on
// disk, nothing is written and the old timestamp stands. Any other difference (a value, note, order
// or formatting) writes the file with the new builtAt. Files without builtAt (localities,
// sources.json) are written only when their bytes differ.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

type WithBuildInfo = { buildInfo?: { builtAt: string } };

export function writeIfChanged(path: string, value: object, serialize: (v: object) => string = v => JSON.stringify(v)): 'written' | 'unchanged' {
  const previous = existsSync(path) ? readFileSync(path, 'utf8') : null;
  const next = serialize(value);
  if (previous !== null) {
    if (previous === next) return 'unchanged';
    const built = (value as WithBuildInfo).buildInfo;
    if (built) {
      let oldBuiltAt: unknown;
      try { oldBuiltAt = (JSON.parse(previous) as WithBuildInfo).buildInfo?.builtAt; } catch { /* unreadable: rewrite */ }
      if (typeof oldBuiltAt === 'string' && serialize({ ...value, buildInfo: { ...built, builtAt: oldBuiltAt } }) === previous) return 'unchanged';
    }
  }
  writeFileSync(path, next);
  return 'written';
}
