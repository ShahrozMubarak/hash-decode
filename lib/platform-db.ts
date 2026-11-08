import { webcrypto } from "node:crypto";
import { createRequire } from "node:module";
if (typeof globalThis.crypto === "undefined") {
  (globalThis as any).crypto = webcrypto;
}
import { env } from 'cloudflare:workers';

export interface PlatformStatement {
  bind(...args: any[]): PlatformStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  all<T = unknown>(): Promise<{ results: T[]; success: boolean }>;
  raw<T = unknown>(): Promise<T[]>;
  run(): Promise<{ success: boolean; meta: any }>;
}

export interface PlatformDb {
  prepare(query: string): PlatformStatement;
  batch(stmts: PlatformStatement[]): Promise<any[]>;
}

const SCHEMA_DDL = `
  CREATE TABLE IF NOT EXISTS inquiries (
    id text PRIMARY KEY NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    topic text NOT NULL,
    budget text DEFAULT 'Not specified' NOT NULL,
    brief text NOT NULL,
    status text NOT NULL,
    mail text DEFAULT 'not configured' NOT NULL,
    notes text DEFAULT '' NOT NULL,
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
  CREATE TABLE IF NOT EXISTS subscribers (
    email text PRIMARY KEY NOT NULL,
    status text DEFAULT 'active' NOT NULL,
    created integer NOT NULL
  );
  CREATE TABLE IF NOT EXISTS audit_logs (
    id text PRIMARY KEY NOT NULL,
    action text NOT NULL,
    actor text DEFAULT 'owner' NOT NULL,
    target text DEFAULT '' NOT NULL,
    detail text DEFAULT '' NOT NULL,
    ip text DEFAULT '' NOT NULL,
    created integer NOT NULL
  );
  CREATE TRIGGER IF NOT EXISTS date_projects_insert AFTER INSERT ON projects
  BEGIN
    INSERT INTO settings(id,value) VALUES ('modified:'||'/',strftime('%Y-%m-%dT%H:%M:%fZ','now')),('modified:'||'/portfolio',strftime('%Y-%m-%dT%H:%M:%fZ','now')),('modified:'||'/portfolio/'||NEW.slug,strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(id) DO UPDATE SET value=excluded.value;
  END;
  CREATE TRIGGER IF NOT EXISTS date_posts_insert AFTER INSERT ON studio_content
  BEGIN
    INSERT INTO settings(id,value) VALUES ('modified:'||CASE NEW.kind WHEN 'post' THEN '/blog' WHEN 'team' THEN '/about' ELSE '/' END,strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(id) DO UPDATE SET value=excluded.value;
  END;
  CREATE TRIGGER IF NOT EXISTS date_settings_insert AFTER INSERT ON settings WHEN NEW.id IN ('connections','public')
  BEGIN
    INSERT INTO settings(id,value) VALUES ('modified:'||'/',strftime('%Y-%m-%dT%H:%M:%fZ','now')),('modified:'||CASE NEW.id WHEN 'connections' THEN '/contact' ELSE '/about' END,strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(id) DO UPDATE SET value=excluded.value;
  END;
  CREATE TRIGGER IF NOT EXISTS date_projects_update AFTER UPDATE ON projects
  BEGIN
    INSERT INTO settings(id,value) VALUES ('modified:'||'/',strftime('%Y-%m-%dT%H:%M:%fZ','now')),('modified:'||'/portfolio',strftime('%Y-%m-%dT%H:%M:%fZ','now')),('modified:'||'/portfolio/'||NEW.slug,strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(id) DO UPDATE SET value=excluded.value;
  END;
  CREATE TRIGGER IF NOT EXISTS date_posts_update AFTER UPDATE ON studio_content
  BEGIN
    INSERT INTO settings(id,value) VALUES ('modified:'||CASE NEW.kind WHEN 'post' THEN '/blog' WHEN 'team' THEN '/about' ELSE '/' END,strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(id) DO UPDATE SET value=excluded.value;
  END;
  CREATE TRIGGER IF NOT EXISTS date_settings_update AFTER UPDATE ON settings WHEN NEW.id IN ('connections','public')
  BEGIN
    INSERT INTO settings(id,value) VALUES ('modified:'||'/',strftime('%Y-%m-%dT%H:%M:%fZ','now')),('modified:'||CASE NEW.id WHEN 'connections' THEN '/contact' ELSE '/about' END,strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(id) DO UPDATE SET value=excluded.value;
  END;
  CREATE TRIGGER IF NOT EXISTS date_projects_delete AFTER DELETE ON projects
  BEGIN
    INSERT INTO settings(id,value) VALUES ('modified:'||'/',strftime('%Y-%m-%dT%H:%M:%fZ','now')),('modified:'||'/portfolio',strftime('%Y-%m-%dT%H:%M:%fZ','now')),('modified:'||'/portfolio/'||OLD.slug,strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(id) DO UPDATE SET value=excluded.value;
  END;
  CREATE TRIGGER IF NOT EXISTS date_posts_delete AFTER DELETE ON studio_content
  BEGIN
    INSERT INTO settings(id,value) VALUES ('modified:'||CASE OLD.kind WHEN 'post' THEN '/blog' WHEN 'team' THEN '/about' ELSE '/' END,strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(id) DO UPDATE SET value=excluded.value;
  END;
  CREATE TRIGGER IF NOT EXISTS date_settings_delete AFTER DELETE ON settings WHEN OLD.id IN ('connections','public')
  BEGIN
    INSERT INTO settings(id,value) VALUES ('modified:'||'/',strftime('%Y-%m-%dT%H:%M:%fZ','now')),('modified:'||CASE OLD.id WHEN 'connections' THEN '/contact' ELSE '/about' END,strftime('%Y-%m-%dT%H:%M:%fZ','now')) ON CONFLICT(id) DO UPDATE SET value=excluded.value;
  END;
`;

const TABLE_SCHEMAS: Record<string, { pk: string; cols: string[]; defaults: Record<string, any> }> = {
  inquiries: {
    pk: 'id',
    cols: ['id', 'name', 'email', 'topic', 'brief', 'status', 'budget', 'mail', 'notes', 'created'],
    defaults: { budget: 'Not specified', mail: 'not configured', notes: '' },
  },
  submission_limits: {
    pk: 'key',
    cols: ['key', 'expires', 'count'],
    defaults: {},
  },
  projects: {
    pk: 'slug',
    cols: ['slug', 'title', 'category', 'summary', 'challenge', 'solution', 'tech', 'result', 'url', 'image', 'art', 'status', 'position', 'kind'],
    defaults: { tech: '', result: '' },
  },
  settings: {
    pk: 'id',
    cols: ['id', 'value'],
    defaults: {},
  },
  human_challenges: {
    pk: 'id',
    cols: ['id', 'answer', 'expires'],
    defaults: {},
  },
  studio_content: {
    pk: 'id',
    cols: ['id', 'kind', 'title', 'label', 'body', 'url', 'image', 'status', 'updated'],
    defaults: {},
  },
  traffic_totals: {
    pk: 'key',
    cols: ['key', 'day', 'page', 'source', 'views'],
    defaults: {},
  },
  chat_messages: {
    pk: 'id',
    cols: ['id', 'thread', 'role', 'body', 'created'],
    defaults: {},
  },
  chat_threads: {
    pk: 'id',
    cols: ['id', 'secret', 'name', 'email', 'updated'],
    defaults: {},
  },
  owner_sessions: {
    pk: 'token_hash',
    cols: ['token_hash', 'credential_id', 'expires'],
    defaults: {},
  },
  subscribers: {
    pk: 'email',
    cols: ['email', 'status', 'created'],
    defaults: { status: 'active' },
  },
  audit_logs: {
    pk: 'id',
    cols: ['id', 'action', 'actor', 'target', 'detail', 'ip', 'created'],
    defaults: { actor: 'owner', target: '', detail: '', ip: '' },
  },
};

function createJsSqlEngine(): PlatformDb {
  const store: Record<string, Map<string, Record<string, any>>> = {};
  let autoRowId = 1;
  for (const name of Object.keys(TABLE_SCHEMAS)) {
    store[name] = new Map();
  }

  const setModified = (paths: string[]) => {
    const nowIso = new Date().toISOString();
    const settingsMap = store.settings;
    for (const p of paths) {
      const id = `modified:${p}`;
      settingsMap.set(id, { id, value: nowIso, __rowid: autoRowId++ });
    }
  };

  const fireTrigger = (table: string, row: Record<string, any>) => {
    if (table === 'projects') {
      setModified(['/', '/portfolio', `/portfolio/${row.slug}`]);
    } else if (table === 'studio_content') {
      const target = row.kind === 'post' ? '/blog' : row.kind === 'team' ? '/about' : '/';
      setModified([target]);
    } else if (table === 'settings' && (row.id === 'connections' || row.id === 'public')) {
      setModified(['/', row.id === 'connections' ? '/contact' : '/about']);
    }
  };

  const stripQuotes = (s: string) => s.trim().replace(/^["'`]|["'`]$/g, '');
  const cleanColName = (s: string) => {
    const parts = s.trim().split('.');
    return stripQuotes(parts[parts.length - 1]);
  };

  const matchWhere = (row: Record<string, any>, whereClause: string, bindings: any[], startIdx: { idx: number }): boolean => {
    if (!whereClause || !whereClause.trim()) return true;
    const conds = whereClause.split(/\s+AND\s+/i);
    for (const rawCond of conds) {
      const cond = rawCond.trim().replace(/^\(+|\)+$/g, '');
      const likeMatch = cond.match(/^([a-zA-Z0-9_."`]+)\s+LIKE\s+(?:'([^']*)'|\?)$/i);
      if (likeMatch) {
        const col = cleanColName(likeMatch[1]);
        const pattern = likeMatch[2] !== undefined ? likeMatch[2] : String(bindings[startIdx.idx++] ?? '');
        const regex = new RegExp('^' + pattern.replace(/%/g, '.*').replace(/_/g, '.') + '$', 'i');
        if (!regex.test(String(row[col] ?? ''))) return false;
        continue;
      }
      const opMatch = cond.match(/^([a-zA-Z0-9_."`]+)\s*(<=|>=|!=|<>|=|<|>)\s*(\?|'[^']*'|\d+(?:\.\d+)?)$/);
      if (opMatch) {
        const col = cleanColName(opMatch[1]);
        const op = opMatch[2];
        const rhsRaw = opMatch[3];
        let val: any;
        if (rhsRaw === '?') {
          val = bindings[startIdx.idx++];
        } else if (rhsRaw.startsWith("'")) {
          val = rhsRaw.slice(1, -1);
        } else {
          val = Number(rhsRaw);
        }
        const lhs = row[col];
        if (op === '=' && lhs !== val) return false;
        if ((op === '!=' || op === '<>') && lhs === val) return false;
        if (op === '<' && !(lhs < val)) return false;
        if (op === '<=' && !(lhs <= val)) return false;
        if (op === '>' && !(lhs > val)) return false;
        if (op === '>=' && !(lhs >= val)) return false;
      }
    }
    return true;
  };

  const executeQuery = (rawSql: string, bindings: any[]): { rows: Record<string, any>[]; cols: string[]; changes: number } => {
    const sql = rawSql.replace(/\s+/g, ' ').trim().replace(/;$/, '');
    if (/^(CREATE|ALTER|DROP|BEGIN|COMMIT|ROLLBACK)\b/i.test(sql)) {
      return { rows: [], cols: [], changes: 0 };
    }

    // Handle nested chat messages subquery
    if (/FROM\s*\(\s*SELECT\s+role\s*,\s*body\s*,\s*created\s+FROM\s+chat_messages/i.test(sql)) {
      const threadId = bindings[0];
      const allMsgs = Array.from(store.chat_messages.values()).filter((m) => m.thread === threadId);
      allMsgs.sort((a, b) => (b.created - a.created) || ((b.__rowid || 0) - (a.__rowid || 0)));
      const limited = allMsgs.slice(0, 80);
      limited.sort((a, b) => (a.created - b.created) || ((a.__rowid || 0) - (b.__rowid || 0)));
      const rows = limited.map((m) => ({ role: m.role, body: m.body, created: m.created }));
      return { rows, cols: ['role', 'body', 'created'], changes: 0 };
    }

    // Handle INSERT
    if (/^INSERT\b/i.test(sql)) {
      const isReplace = /^INSERT\s+OR\s+REPLACE\s+INTO/i.test(sql);
      const tableMatch = sql.match(/^INSERT\s+(?:OR\s+REPLACE\s+)?INTO\s+([a-zA-Z0-9_."`]+)\s*(?:\(([^)]+)\))?\s*VALUES\s*\((.+?)\)(?:\s+ON\s+CONFLICT\s*(?:\(([^)]+)\))?\s*DO\s+(NOTHING|UPDATE\s+SET\s+.+?))?(?:\s+RETURNING\s+(.+))?$/i);
      if (!tableMatch) return { rows: [], cols: [], changes: 0 };
      const tableName = cleanColName(tableMatch[1]);
      const schema = TABLE_SCHEMAS[tableName] || { pk: 'id', cols: [], defaults: {} };
      if (!store[tableName]) store[tableName] = new Map();
      const map = store[tableName];

      const cols = tableMatch[2]
        ? tableMatch[2].split(',').map((c) => cleanColName(c))
        : schema.cols;

      const valuesTokens = tableMatch[3].split(',').map((t) => t.trim());
      const bindPtr = { idx: 0 };
      const incoming: Record<string, any> = { ...schema.defaults };
      cols.forEach((col, i) => {
        const tok = valuesTokens[i];
        if (tok === '?') {
          incoming[col] = bindings[bindPtr.idx++];
        } else if (tok && /^'.*'$/.test(tok)) {
          incoming[col] = tok.slice(1, -1);
        } else if (tok && !Number.isNaN(Number(tok))) {
          incoming[col] = Number(tok);
        } else {
          incoming[col] = bindings[bindPtr.idx++];
        }
      });

      const pkVal = String(incoming[schema.pk]);
      const existing = map.get(pkVal);
      const conflictAction = tableMatch[5] || '';
      const returningSpec = tableMatch[6] || '';
      const returnCols = returningSpec ? returningSpec.split(',').map((c) => cleanColName(c)) : [];

      let finalRow: Record<string, any> | null = null;
      let changes = 0;

      if (!existing || isReplace) {
        finalRow = { ...incoming, __rowid: autoRowId++ };
        map.set(pkVal, finalRow);
        changes = 1;
        fireTrigger(tableName, finalRow);
      } else if (/^NOTHING$/i.test(conflictAction)) {
        finalRow = null;
      } else if (/^UPDATE\s+SET\s+/i.test(conflictAction)) {
        const setAndWhere = conflictAction.replace(/^UPDATE\s+SET\s+/i, '');
        const [setPart, wherePart] = setAndWhere.split(/\s+WHERE\s+/i);
        // Parse set assignments first (bindings in SET come before WHERE)
        const updated = { ...existing };
        const assignments = setPart.split(',').map((a) => a.trim());
        for (const assign of assignments) {
          const [lhsRaw, rhsRaw] = assign.split('=').map((s) => s.trim());
          const col = cleanColName(lhsRaw);
          if (rhsRaw === '?') {
            updated[col] = bindings[bindPtr.idx++];
          } else if (/^excluded\./i.test(rhsRaw)) {
            const exCol = cleanColName(rhsRaw.slice(9));
            updated[col] = incoming[exCol];
          } else if (/^[a-zA-Z0-9_]+\s*\+\s*1$/i.test(rhsRaw)) {
            updated[col] = Number(existing[col] || 0) + 1;
          } else if (/^'.*'$/.test(rhsRaw)) {
            updated[col] = rhsRaw.slice(1, -1);
          } else if (!Number.isNaN(Number(rhsRaw))) {
            updated[col] = Number(rhsRaw);
          }
        }
        if (wherePart && !matchWhere(existing, wherePart, bindings, bindPtr)) {
          finalRow = null;
        } else {
          finalRow = updated;
          map.set(pkVal, finalRow);
          changes = 1;
          fireTrigger(tableName, finalRow);
        }
      }

      if (returnCols.length && finalRow) {
        const projected: Record<string, any> = {};
        for (const c of returnCols) projected[c] = finalRow[c];
        return { rows: [projected], cols: returnCols, changes };
      }
      return { rows: [], cols: returnCols, changes };
    }

    // Handle UPDATE
    if (/^UPDATE\b/i.test(sql)) {
      const m = sql.match(/^UPDATE\s+([a-zA-Z0-9_."`]+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?$/i);
      if (!m) return { rows: [], cols: [], changes: 0 };
      const tableName = cleanColName(m[1]);
      const setPart = m[2];
      const wherePart = m[3] || '';
      const map = store[tableName];
      if (!map) return { rows: [], cols: [], changes: 0 };

      const assignments = setPart.split(',').map((a) => a.trim());
      const setValues: { col: string; val: any; isIncrement?: boolean }[] = [];
      const bindPtr = { idx: 0 };
      for (const assign of assignments) {
        const eqIdx = assign.indexOf('=');
        const col = cleanColName(assign.slice(0, eqIdx));
        const rhs = assign.slice(eqIdx + 1).trim();
        if (rhs === '?') {
          setValues.push({ col, val: bindings[bindPtr.idx++] });
        } else if (/^'.*'$/.test(rhs)) {
          setValues.push({ col, val: rhs.slice(1, -1) });
        } else if (!Number.isNaN(Number(rhs))) {
          setValues.push({ col, val: Number(rhs) });
        }
      }

      let changes = 0;
      const whereStartIdx = bindPtr.idx;
      for (const [k, row] of map.entries()) {
        const rowBindPtr = { idx: whereStartIdx };
        if (matchWhere(row, wherePart, bindings, rowBindPtr)) {
          const next = { ...row };
          for (const sv of setValues) next[sv.col] = sv.val;
          map.set(k, next);
          changes++;
          fireTrigger(tableName, next);
        }
      }
      return { rows: [], cols: [], changes };
    }

    // Handle DELETE
    if (/^DELETE\b/i.test(sql)) {
      const m = sql.match(/^DELETE\s+FROM\s+([a-zA-Z0-9_."`]+)(?:\s+WHERE\s+(.+?))?(?:\s+RETURNING\s+(.+))?$/i);
      if (!m) return { rows: [], cols: [], changes: 0 };
      const tableName = cleanColName(m[1]);
      const wherePart = m[2] || '';
      const returningSpec = m[3] || '';
      const returnCols = returningSpec ? returningSpec.split(',').map((c) => cleanColName(c)) : [];
      const map = store[tableName];
      if (!map) return { rows: [], cols: returnCols, changes: 0 };

      const deleted: Record<string, any>[] = [];
      for (const [k, row] of map.entries()) {
        const bindPtr = { idx: 0 };
        if (matchWhere(row, wherePart, bindings, bindPtr)) {
          map.delete(k);
          deleted.push(row);
          fireTrigger(tableName, row);
        }
      }
      if (returnCols.length) {
        const projected = deleted.map((r) => {
          const out: Record<string, any> = {};
          for (const c of returnCols) out[c] = r[c];
          return out;
        });
        return { rows: projected, cols: returnCols, changes: deleted.length };
      }
      return { rows: [], cols: [], changes: deleted.length };
    }

    // Handle SELECT
    if (/^SELECT\b/i.test(sql)) {
      const m = sql.match(/^SELECT\s+(.+?)\s+FROM\s+([a-zA-Z0-9_."`]+)(?:\s+WHERE\s+(.+?))?(?:\s+GROUP\s+BY\s+([a-zA-Z0-9_."`]+))?(?:\s+ORDER\s+BY\s+(.+?))?(?:\s+LIMIT\s+(\d+|\?))?$/i);
      if (!m) return { rows: [], cols: [], changes: 0 };
      const selectSpec = m[1].trim();
      const tableName = cleanColName(m[2]);
      const wherePart = m[3] || '';
      const groupByCol = m[4] ? cleanColName(m[4]) : '';
      const orderBySpec = m[5] || '';
      const limitSpec = m[6] || '';

      const map = store[tableName];
      const schema = TABLE_SCHEMAS[tableName] || { pk: 'id', cols: [], defaults: {} };
      if (!map) return { rows: [], cols: schema.cols, changes: 0 };

      const bindPtr = { idx: 0 };
      let matched: Record<string, any>[] = [];
      const whereStartIdx = bindPtr.idx;
      let nextIdxAfterWhere = 0;
      const allEntries = Array.from(map.values());
      if (allEntries.length === 0 && wherePart) {
        nextIdxAfterWhere = (wherePart.match(/\?/g) || []).length;
      }
      for (const row of allEntries) {
        const p = { idx: whereStartIdx };
        if (matchWhere(row, wherePart, bindings, p)) {
          matched.push(row);
        }
        nextIdxAfterWhere = p.idx;
      }
      bindPtr.idx = nextIdxAfterWhere;

      // Check COUNT(*)
      if (/^COUNT\(\*\)\s+as\s+([a-zA-Z0-9_]+)$/i.test(selectSpec)) {
        const alias = selectSpec.match(/as\s+([a-zA-Z0-9_]+)$/i)![1];
        return { rows: [{ [alias]: matched.length }], cols: [alias], changes: 0 };
      }

      // Check GROUP BY + SUM
      if (groupByCol && /SUM\(/i.test(selectSpec)) {
        const groups = new Map<string, number>();
        for (const r of matched) {
          const gKey = String(r[groupByCol] ?? '');
          groups.set(gKey, (groups.get(gKey) || 0) + Number(r.views || 0));
        }
        let groupedRows = Array.from(groups.entries()).map(([k, n]) => ({ [groupByCol]: k, n }));
        if (/DESC/i.test(orderBySpec)) groupedRows.sort((a, b) => Number(b.n) - Number(a.n));
        return { rows: groupedRows, cols: [groupByCol, 'n'], changes: 0 };
      }

      // ORDER BY
      if (orderBySpec) {
        const parts = orderBySpec.split(',').map((p) => p.trim());
        matched.sort((a, b) => {
          for (const part of parts) {
            const [colRaw, dirRaw] = part.split(/\s+/);
            const col = cleanColName(colRaw) === 'rowid' ? '__rowid' : cleanColName(colRaw);
            const desc = /^DESC$/i.test(dirRaw || '');
            const av = a[col];
            const bv = b[col];
            if (av !== bv) {
              const cmp = av < bv ? -1 : 1;
              return desc ? -cmp : cmp;
            }
          }
          return 0;
        });
      }

      // LIMIT
      if (limitSpec) {
        const limitNum = limitSpec === '?' ? Number(bindings[bindPtr.idx++]) : Number(limitSpec);
        if (!Number.isNaN(limitNum)) matched = matched.slice(0, limitNum);
      }

      if (selectSpec === '*') {
        return { rows: matched, cols: schema.cols, changes: 0 };
      }
      if (selectSpec === '1') {
        return { rows: matched.map(() => ({ '1': 1 })), cols: ['1'], changes: 0 };
      }

      const cols = selectSpec.split(',').map((c) => cleanColName(c));
      const projected = matched.map((r) => {
        const out: Record<string, any> = {};
        for (const c of cols) out[c] = r[c];
        return out;
      });
      return { rows: projected, cols, changes: 0 };
    }

    return { rows: [], cols: [], changes: 0 };
  };

  class JsStatement implements PlatformStatement {
    private query: string;
    private bindings: any[];

    constructor(query: string, bindings: any[] = []) {
      this.query = query;
      this.bindings = bindings;
    }

    bind(...args: any[]): PlatformStatement {
      return new JsStatement(this.query, args);
    }

    async first<T = unknown>(colName?: string): Promise<T | null> {
      const { rows } = executeQuery(this.query, this.bindings);
      if (!rows.length) return null;
      if (colName) return (rows[0][colName] ?? null) as T | null;
      return rows[0] as T;
    }

    async all<T = unknown>(): Promise<{ results: T[]; success: boolean }> {
      const { rows } = executeQuery(this.query, this.bindings);
      return { results: rows as T[], success: true };
    }

    async raw<T = unknown>(): Promise<T[]> {
      const { rows, cols } = executeQuery(this.query, this.bindings);
      return rows.map((r) => cols.map((c) => r[c])) as unknown as T[];
    }

    async run(): Promise<{ success: boolean; meta: any }> {
      const { changes } = executeQuery(this.query, this.bindings);
      return { success: true, meta: { changes } };
    }
  }

  return {
    prepare: (query: string) => new JsStatement(query),
    batch: async (stmts: PlatformStatement[]) => {
      const results = [];
      for (const s of stmts) {
        results.push(await s.run());
      }
      return results;
    },
  };
}

function initSqliteDb(): PlatformDb {
  try {
    // Dynamically attempt to load node:sqlite (available on Node 22.5+) without crashing Node 18/20 or Edge bundlers
    const req = typeof process !== 'undefined' && process.versions?.node
      ? createRequire(import.meta.url)
      : null;
    if (req) {
      const { DatabaseSync } = req('node:sqlite');
      const sql = new DatabaseSync(':memory:');
      sql.exec(SCHEMA_DDL);

      class Statement implements PlatformStatement {
        private query: string;
        private bindings: any[];

        constructor(query: string, bindings: any[] = []) {
          this.query = query;
          this.bindings = bindings;
        }

        bind(...args: any[]) {
          return new Statement(this.query, args);
        }

        async first<T = unknown>(colName?: string): Promise<T | null> {
          try {
            const stmt = sql.prepare(this.query);
            const res = stmt.get(...this.bindings);
            if (!res) return null;
            if (colName) return (res[colName] ?? null) as T | null;
            return res as T;
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
        batch: async (stmts: PlatformStatement[]) => {
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
  } catch {
    // node:sqlite is unavailable (Node 18/20 or Edge); fall through to pure-JS relational engine
  }

  return createJsSqlEngine();
}

export function createFallbackDb(): PlatformDb { return initSqliteDb(); }

export function getPlatformDb(): PlatformDb {
  try {
    if (typeof env !== 'undefined' && env && (env as any).DB && !(env as any).DB.__isMockDb) {
      return (env as any).DB;
    }
  } catch {}
  const g = globalThis as any;
  if (!g.__STUDIO_FALLBACK_DB__) {
    g.__STUDIO_FALLBACK_DB__ = initSqliteDb();
  }
  return g.__STUDIO_FALLBACK_DB__;
}
