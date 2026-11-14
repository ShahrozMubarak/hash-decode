import * as mod from 'node:module';
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));

const hookFn = mod.registerHooks;
if (typeof hookFn === 'function') {
  hookFn({ resolve(specifier, context, next) {
    // Route integration tests use real MongoDB; only the Next cache invalidator is outside the HTTP harness.
    if (specifier === 'next/cache') return { url: new URL('./next-cache.mjs', import.meta.url).href, shortCircuit: true };
    if (specifier.startsWith('@/')) {
      const base = resolve(root, specifier.slice(2));
      for (const path of [base, base + '.ts', base + '/index.ts', base + '.mjs']) if (existsSync(path) && /\.(ts|mjs)$/.test(path)) return { url: pathToFileURL(path).href, shortCircuit: true };
    }
    if (specifier.startsWith('.') && context.parentURL?.startsWith('file:') && !context.parentURL.includes('node_modules')) {
      for (const suffix of ['.ts', '/index.ts']) { const candidate = new URL(specifier + suffix, context.parentURL); if (existsSync(candidate)) return { url: candidate.href, shortCircuit: true }; }
    }
    return next(specifier, context);
  } });
}
