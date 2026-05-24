import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Direct Drizzle access is used by migration / seed scripts and any server-side
// admin code that needs to bypass RLS. Runtime app queries go through the
// Supabase client so RLS is enforced.

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. This module is only safe to import from scripts " +
      "that need direct Drizzle access (e.g. drizzle-kit, seed, migrate).",
  );
}

const queryClient = postgres(databaseUrl, { prepare: false, max: 1 });

export const db = drizzle(queryClient, { schema });
export { schema };
