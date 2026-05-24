import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  // Soft-fail so generate works even before envs are set; migrations will error loudly when run.
  console.warn("[drizzle.config] DATABASE_URL not set — DB-running commands will fail.");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl ?? "postgresql://placeholder",
  },
  strict: true,
  verbose: true,
});
