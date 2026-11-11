// Build-tool compatibility only. No database or in-memory storage fallback.
export class WorkerEntrypoint {}
export class DurableObject {}
export class WorkflowEntrypoint {}
export const env: Record<string, string | undefined> = process.env;
