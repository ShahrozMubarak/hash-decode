export interface PlatformStatement {
  bind(...args: unknown[]): PlatformStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  all<T = unknown>(): Promise<{ results: T[]; success: boolean }>;
  raw<T = unknown>(): Promise<T[]>;
  run(): Promise<{ success: boolean; meta: unknown }>;
}

export interface PlatformDb {
  prepare(query: string): PlatformStatement;
  batch(stmts: PlatformStatement[]): Promise<unknown[]>;
}

// Retained adapter interface. Temporary databases are deliberately disabled.
export function getPlatformDb(): PlatformDb { throw new Error('Legacy D1/SQLite access is disabled. Use lib/db.'); }
export const createFallbackDb = getPlatformDb;
