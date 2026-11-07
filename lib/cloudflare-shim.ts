// Safe shim for cloudflare:workers on non-Cloudflare platforms (Vercel, Node.js, local).

export interface D1PreparedStatementLike {
  bind(...values: any[]): D1PreparedStatementLike;
  first<T = unknown>(colName?: string): Promise<T | null>;
  all<T = unknown>(): Promise<{ results: T[]; success: boolean; meta?: any }>;
  raw<T = unknown>(): Promise<T[]>;
  run(): Promise<{ success: boolean; meta: any }>;
}

export interface D1DatabaseLike {
  prepare(query: string): D1PreparedStatementLike;
  batch<T = unknown>(statements: D1PreparedStatementLike[]): Promise<any[]>;
  exec(query: string): Promise<{ count: number; duration: number }>;
}

class MockStatement implements D1PreparedStatementLike {
  private query: string;
  private bindings: any[];

  constructor(query: string, bindings: any[] = []) {
    this.query = query;
    this.bindings = bindings;
  }

  bind(...args: any[]): D1PreparedStatementLike {
    return new MockStatement(this.query, args);
  }

  async first<T = unknown>(_colName?: string): Promise<T | null> {
    return null;
  }

  async all<T = unknown>(): Promise<{ results: T[]; success: boolean; meta?: any }> {
    return { results: [], success: true };
  }

  async raw<T = unknown>(): Promise<T[]> {
    return [];
  }

  async run() {
    return { success: true, meta: {} };
  }
}

export const mockDb: D1DatabaseLike = {
  prepare: (query: string) => new MockStatement(query),
  batch: async (_statements: D1PreparedStatementLike[]) => [],
  exec: async (_query: string) => ({ count: 0, duration: 0 }),
};

export class WorkerEntrypoint {}
export class DurableObject {}
export class WorkflowEntrypoint {}

export interface CloudflareWorkersEnv {
  DB?: D1DatabaseLike;
  [key: string]: any;
}

export const env: CloudflareWorkersEnv = new Proxy(
  {},
  {
    get(_target, prop: string) {
      if (prop === 'DB') {
        return (globalThis as any)?.__CF_ENV__?.DB || (globalThis as any)?.env?.DB || mockDb;
      }
      return process.env[prop] ?? (globalThis as any)?.__CF_ENV__?.[prop];
    },
  }
);
