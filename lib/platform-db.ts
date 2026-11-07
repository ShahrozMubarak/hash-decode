import { env } from 'cloudflare:workers';
import { DatabaseSync } from 'node:sqlite';

let fallbackInstance: any = null;

function initSqliteDb(): any {
  const sql = new DatabaseSync(':memory:');

  // Schema DDL for all studio tables
  sql.exec(`
    CREATE TABLE IF NOT EXISTS inquiries (
      id text PRIMARY KEY NOT NULL,
      name text NOT NULL,
      email text NOT NULL,
      topic text NOT NULL,
      budget text DEFAULT 'Not specified' NOT NULL,
      brief text NOT NULL,
      status text NOT NULL,
      mail text DEFAULT 'not configured' NOT NULL,
      created integer NOT NULL
    );
    CREATE TABLE IF NOT EXISTS submission_limits (
      key text PRIMARY KEY NOT NULL,
      expires integer NOT NULL,
      count integer NOT NULL
    );
    CREATE TABLE IF NOT EXISTS projects (
      slug text PRIMARY KEY NOT NULL,
      title text NOT NULL,
      category text NOT NULL,
      summary text NOT NULL,
      challenge text NOT NULL,
      solution text NOT NULL,
      tech text DEFAULT '' NOT NULL,
      result text DEFAULT '' NOT NULL,
      url text NOT NULL,
      image text NOT NULL,
      art text NOT NULL,
      status text NOT NULL,
      position integer NOT NULL,
      kind text NOT NULL
    );
    CREATE TABLE IF NOT EXISTS settings (
      id text PRIMARY KEY NOT NULL,
      value text NOT NULL
    );
    CREATE TABLE IF NOT EXISTS human_challenges (
      id text PRIMARY KEY NOT NULL,
      answer text NOT NULL,
      expires integer NOT NULL
    );
    CREATE TABLE IF NOT EXISTS studio_content (
      id text PRIMARY KEY NOT NULL,
      kind text NOT NULL,
      title text NOT NULL,
      label text NOT NULL,
      body text NOT NULL,
      url text NOT NULL,
      image text NOT NULL,
      status text NOT NULL,
      updated integer NOT NULL
    );
    CREATE TABLE IF NOT EXISTS traffic_totals (
      key text PRIMARY KEY NOT NULL,
      day text NOT NULL,
      page text NOT NULL,
      source text NOT NULL,
      views integer NOT NULL
    );
    CREATE TABLE IF NOT EXISTS chat_messages (
      id text PRIMARY KEY NOT NULL,
      thread text NOT NULL,
      role text NOT NULL,
      body text NOT NULL,
      created integer NOT NULL
    );
    CREATE TABLE IF NOT EXISTS chat_threads (
      id text PRIMARY KEY NOT NULL,
      secret text NOT NULL,
      name text NOT NULL,
      email text NOT NULL,
      updated integer NOT NULL
    );
    CREATE TABLE IF NOT EXISTS owner_sessions (
      token_hash text PRIMARY KEY NOT NULL,
      credential_id text NOT NULL,
      expires integer NOT NULL
    );
  `);

  class Statement {
    private query: string;
    private bindings: any[];

    constructor(query: string, bindings: any[] = []) {
      this.query = query;
      this.bindings = bindings;
    }

    bind(...args: any[]) {
      return new Statement(this.query, args);
    }

    async first<T = unknown>(): Promise<T | null> {
      try {
        const stmt = sql.prepare(this.query);
        const res = stmt.get(...this.bindings);
        return (res ?? null) as T | null;
      } catch (e) {
        console.warn('[SQLite fallback first error]:', e);
        return null;
      }
    }

    async all<T = unknown>(): Promise<{ results: T[]; success: boolean }> {
      try {
        const stmt = sql.prepare(this.query);
        const results = stmt.all(...this.bindings) as T[];
        return { results, success: true };
      } catch (e) {
        console.warn('[SQLite fallback all error]:', e);
        return { results: [], success: false };
      }
    }

    async raw<T = unknown>(): Promise<T[]> {
      try {
        const stmt = sql.prepare(this.query);
        stmt.setReturnArrays(true);
        return stmt.all(...this.bindings) as unknown as T[];
      } catch (e) {
        console.warn('[SQLite fallback raw error]:', e);
        return [];
      }
    }

    async run(): Promise<{ success: boolean; meta: any }> {
      try {
        const stmt = sql.prepare(this.query);
        const meta = stmt.run(...this.bindings);
        return { success: true, meta };
      } catch (e) {
        console.warn('[SQLite fallback run error]:', e);
        return { success: false, meta: null };
      }
    }
  }

  return {
    prepare: (query: string) => new Statement(query),
    batch: async (stmts: Statement[]) => {
      sql.exec('BEGIN');
      try {
        const results = [];
        for (const s of stmts) {
          results.push(await s.run());
        }
        sql.exec('COMMIT');
        return results;
      } catch (e) {
        sql.exec('ROLLBACK');
        throw e;
      }
    },
  };
}

export interface PlatformStatement {
  bind(...args: any[]): PlatformStatement;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<{ results: T[]; success: boolean }>;
  raw<T = unknown>(): Promise<T[]>;
  run(): Promise<{ success: boolean; meta: any }>;
}

export interface PlatformDb {
  prepare(query: string): PlatformStatement;
  batch(stmts: PlatformStatement[]): Promise<any[]>;
}

export function getPlatformDb(): PlatformDb {
  if (typeof env !== 'undefined' && env && (env as any).DB) {
    return (env as any).DB;
  }
  if (!fallbackInstance) {
    fallbackInstance = initSqliteDb();
  }
  return fallbackInstance;
}
