// Runs analysis tasks off the main thread, one task per message, so the page stays responsive
// while an exact search (up to several seconds each on a slow device) runs.
import { runTask, type AnalysisTask } from './analysisTasks.ts';

const scope = self as unknown as { onmessage: ((e: MessageEvent<AnalysisTask>) => void) | null; postMessage: (m: unknown) => void };
scope.onmessage = (e) => scope.postMessage(runTask(e.data));
