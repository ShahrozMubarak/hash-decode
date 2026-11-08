import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { webcrypto } from 'node:crypto';
import { createFallbackDb } from '../lib/platform-db.ts';

if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = webcrypto;
}

function createTestDb() {
  try {
    const req = createRequire(import.meta.url);
    const { DatabaseSync } = req('node:sqlite');
    const sql = new DatabaseSync(':memory:');
    for (const file of readdirSync(new URL('../drizzle/', import.meta.url))
      .filter((s) => s.endsWith('.sql'))
      .sort()) {
      sql.exec(readFileSync(new URL('../drizzle/' + file, import.meta.url), 'utf8'));
    }
    class Statement {
      constructor(query, bindings = []) {
        this.query = query;
        this.bindings = bindings;
      }
      bind(...args) {
        return new Statement(this.query, args);
      }
      async first() {
        return sql.prepare(this.query).get(...this.bindings) ?? null;
      }
      async all() {
        return { results: sql.prepare(this.query).all(...this.bindings), success: true };
      }
      async raw() {
        const stmt = sql.prepare(this.query);
        stmt.setReturnArrays(true);
        return stmt.all(...this.bindings);
      }
      async run() {
        return { success: true, meta: sql.prepare(this.query).run(...this.bindings) };
      }
    }
    return {
      prepare: (q) => new Statement(q),
      async batch(stmts) {
        sql.exec('BEGIN');
        try {
          const result = [];
          for (const s of stmts) result.push(await s.run());
          sql.exec('COMMIT');
          return result;
        } catch (e) {
          sql.exec('ROLLBACK');
          throw e;
        }
      },
    };
  } catch {
    return createFallbackDb();
  }
}

export const env = {
  STUDIO_OWNER_EMAIL: 'owner@example.test',
  DB: createTestDb(),
};
export async function headers() {
  return new Headers();
}
export async function cookies() {
  return {
    get() {
      return undefined;
    },
    getAll() {
      return [];
    },
    has() {
      return false;
    },
  };
}
export function redirect(path) {
  throw Error('Redirect ' + path);
}
export function permanentRedirect(path) {
  throw Error('Redirect ' + path);
}
