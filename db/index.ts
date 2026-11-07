import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";
import { getPlatformDb } from "@/lib/platform-db";

export function getDb() {
  const d1 = getPlatformDb();
  return drizzle(d1, { schema });
}

