// Runs analysis tasks on a small pool of workers (in parallel on multi-core devices), falling back
// to the main thread, one task per macrotask, when workers are unavailable or fail.
import { encodeAnalysis, readAnalysis, retainAnalysis } from './analysisCache.ts';
import { runTask, type AnalysisTask, type TaskResult } from './analysisTasks.ts';

const poolSize = () => Math.max(1, Math.min(4, (globalThis.navigator?.hardwareConcurrency || 2) - 1));

/** Calls `done` once per task, in completion order; returns a function that stops all work. */
function executeTasks<T extends AnalysisTask>(tasks: T[], done: (index: number, value: TaskResult<T>) => void): () => void {
  let stopped = false;
  let next = 0;
  const remaining = new Set(tasks.map((_, i) => i));
  const finish = (i: number, value: TaskResult<T>) => { if (!stopped && remaining.delete(i)) done(i, value); };
  const workers: Worker[] = [];
  let timer: ReturnType<typeof setTimeout> | undefined;

  let onMain = false;
  const mainThread = () => {
    if (onMain || stopped) return;
    onMain = true;
    const queue = [...remaining];
    const step = () => {
      if (stopped) return;
      const i = queue.shift();
      if (i === undefined) return;
      finish(i, runTask(tasks[i]));
      timer = setTimeout(step, 0);
    };
    timer = setTimeout(step, 0);
  };
  const failed = () => {
    for (const w of workers.splice(0)) w.terminate();
    mainThread();
  };

  if (typeof Worker === 'undefined') mainThread();
  else {
    try {
      for (let k = 0; k < Math.min(poolSize(), tasks.length); k++) {
        const w = new Worker(new URL('./analysis.worker.ts', import.meta.url), { type: 'module' });
        let busy = -1;
        const assign = () => {
          if (stopped) return;
          if (next >= tasks.length) { w.terminate(); return; }
          busy = next++;
          w.postMessage(tasks[busy]);
        };
        w.onmessage = (e: MessageEvent<TaskResult<T>>) => { finish(busy, e.data); assign(); };
        w.onerror = (e) => { e.preventDefault(); failed(); };
        w.onmessageerror = failed;
        workers.push(w);
        assign();
      }
    } catch { failed(); }
  }
  return () => { stopped = true; clearTimeout(timer); for (const w of workers.splice(0)) w.terminate(); };
}

/** Retain whole batches: the many bloc searches share one stored engine input/result entry. */
export function runTasks<T extends AnalysisTask>(tasks: T[], done: (index: number, value: TaskResult<T>) => void): () => void {
  const inputs: unknown[] = [], seen = new Map<string, number>();
  const compact = tasks.map(({ input, ...task }) => {
    const source = encodeAnalysis(input);
    let index = seen.get(source);
    if (index === undefined) { index = inputs.length; inputs.push(input); seen.set(source, index); }
    return { ...task, input: index };
  });
  const key = { inputs, tasks: compact };
  const cached = readAnalysis<TaskResult<T>[]>(key);
  if (cached) {
    let stopped = false;
    queueMicrotask(() => { cached.forEach((value, i) => { if (!stopped) done(i, value); }); });
    return () => { stopped = true; };
  }
  const results: TaskResult<T>[] = new Array(tasks.length);
  let count = 0;
  return executeTasks(tasks, (i, value) => {
    results[i] = value;
    if (++count === tasks.length) retainAnalysis(key, results);
    done(i, value);
  });
}
