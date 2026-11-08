import { webcrypto } from "node:crypto";
import { createRequire } from "node:module";
if (typeof globalThis.crypto === "undefined") {
  (globalThis as any).crypto = webcrypto;
}
import { env } from 'cloudflare:workers';
import { getPlatformDb } from './platform-db';

let dotEnvLoaded = false;
const dotEnvCache: Record<string, string> = {};

function ensureDotEnvLoaded() {
  if (dotEnvLoaded) return;
  dotEnvLoaded = true;
  try {
    if (typeof process === 'undefined' || !process.versions?.node || typeof process.cwd !== 'function') return;
    const req = createRequire(import.meta.url);
    const fs = req('node:fs');
    const path = req('node:path');
    const root = process.cwd();
    for (const name of ['.env', '.env.local', '.dev.vars']) {
      const p = path.join(root, name);
      if (!fs.existsSync(p)) continue;
      const content = fs.readFileSync(p, 'utf8');
      for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) continue;
        const eqIdx = line.indexOf('=');
        if (eqIdx <= 0) continue;
        const k = line.slice(0, eqIdx).trim().replace(/^export\s+/, '');
        let v = line.slice(eqIdx + 1).trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
          v = v.slice(1, -1);
        }
        if (k) {
          dotEnvCache[k] = v;
          if (process.env[k] === undefined) {
            process.env[k] = v;
          }
        }
      }
    }
  } catch {
    // Ignore in edge/worker environments without fs
  }
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for') || '';
  const firstForwarded = forwarded.split(',')[0]?.trim() || '';
  return (
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-real-ip') ||
    firstForwarded ||
    'local'
  );
}

export async function quota(req: Request, scope: string, max: number, period = 3600000) {
  try {
    const t = Math.floor(Date.now() / period);
    const ip = getClientIp(req);
    const digest = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(scope + ':' + t + ':' + ip)
    );
    const key = Array.from(new Uint8Array(digest), (v) => v.toString(16).padStart(2, '0')).join('');
    const db = getPlatformDb();
    const row = await db
      .prepare(
        'INSERT INTO submission_limits (key,expires,count) VALUES (?,?,1) ON CONFLICT(key) DO UPDATE SET count=count+1 WHERE count<? RETURNING count'
      )
      .bind(key, (t + 1) * period, max)
      .first();
    if (Math.random() < 0.04) {
      await db.prepare('DELETE FROM submission_limits WHERE expires<?').bind(Date.now()).run();
    }
    return Boolean(row);
  } catch {
    return true;
  }
}

export async function clearRateLimits() {
  try {
    const db = getPlatformDb();
    await db.prepare('DELETE FROM submission_limits').run();
    return true;
  } catch {
    return false;
  }
}

export const runtime = (key: string): string => {
  ensureDotEnvLoaded();
  let val: unknown = undefined;
  let explicitInEnv = false;
  try {
    if (typeof env !== 'undefined' && env) {
      const envObj = env as unknown as Record<string, unknown>;
      if (key in envObj && envObj[key] !== undefined) {
        val = envObj[key];
        explicitInEnv = true;
      }
    }
  } catch {}
  if (!explicitInEnv && (val === undefined || val === null || val === '')) {
    if (typeof process !== 'undefined' && process.env && process.env[key] !== undefined) {
      val = process.env[key];
    } else if (dotEnvCache[key] !== undefined) {
      val = dotEnvCache[key];
    }
  }
  return val !== undefined && val !== null ? String(val).trim() : '';
};

export const trafficSince = () => new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);
