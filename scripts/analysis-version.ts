// The analysis cache's version (src/app/analysisCache.ts): a hash of every source file whose code decides an analysis
// result, so a result worked out by other code is never read again. The engine input and the task are already part of
// each cache key; what is hashed here is the code that turns them into a result. Used by vite.config.ts at build time.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

export const ANALYSIS_SOURCES = ['src/engine', 'src/app/analysisTasks.ts'];

const filesOf = (path: string): string[] => statSync(path).isDirectory()
  ? readdirSync(path).sort().flatMap((f) => filesOf(join(path, f)))
  : /\.tsx?$/.test(path) ? [path] : [];

/** A short hash of the analysis sources under `root` (paths and contents). */
export function analysisVersion(root = '.'): string {
  const hash = createHash('sha256');
  for (const file of ANALYSIS_SOURCES.flatMap((s) => filesOf(join(root, s)))) hash.update(`${relative(root, file)}\0${readFileSync(file, 'utf8')}\0`);
  return hash.digest('hex').slice(0, 16);
}
