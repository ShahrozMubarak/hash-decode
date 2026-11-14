import { AsyncLocalStorage } from 'node:async_hooks';
import type { MongoClient } from 'mongodb';

// Cloudflare Workers forbid reusing I/O (open sockets) across requests.
// A MongoClient must therefore live for exactly one request, not the isolate.
export interface RequestDbContext {
  clients: Map<string, Promise<MongoClient>>;
}

const requestDbStorage = new AsyncLocalStorage<RequestDbContext>();

export function createRequestDbContext(): RequestDbContext {
  return { clients: new Map() };
}

export function runWithRequestDbContext<T>(context: RequestDbContext, run: () => Promise<T>): Promise<T> {
  return requestDbStorage.run(context, run);
}

export function currentRequestDbContext(): RequestDbContext | undefined {
  return requestDbStorage.getStore();
}

export async function closeRequestDbContext(context: RequestDbContext): Promise<void> {
  const pending = Array.from(context.clients.values());
  context.clients.clear();
  await Promise.all(pending.map(async (clientPromise) => {
    try {
      const client = await clientPromise;
      await client.close();
    } catch {
      // The connection attempt already failed and cleaned itself up.
    }
  }));
}
