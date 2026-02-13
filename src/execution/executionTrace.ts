export type TraceStatus = 'start' | 'success' | 'error';

export interface ExecutionTraceEntry {
  step: string;
  status: TraceStatus;
  detail: string;
  timestamp: number;
}

export class ExecutionTraceStore {
  private entries: ExecutionTraceEntry[] = [];

  push(step: string, status: TraceStatus, detail: string): ExecutionTraceEntry {
    const entry: ExecutionTraceEntry = { step, status, detail, timestamp: Date.now() };
    this.entries.push(entry);
    return entry;
  }

  all(): ExecutionTraceEntry[] {
    return [...this.entries];
  }

  clear(): void {
    this.entries = [];
  }
}
