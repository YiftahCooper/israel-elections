import type { Aftermath } from './aftermath-model.ts';
import type { ElectionId } from './schema.ts';
export * from './aftermath-model.ts';
const files = import.meta.glob('../../data/meta/aftermath/k*.json', { eager: true, import: 'default' });
export const aftermathRecords = Object.fromEntries(Object.values(files).map(d => { const record = d as Aftermath; return [record.electionId, record]; })) as Partial<Record<ElectionId, Aftermath>>;
export const reviewedAftermath = (id: ElectionId) => aftermathRecords[id]?.status === 'reviewed' ? aftermathRecords[id] : undefined;
