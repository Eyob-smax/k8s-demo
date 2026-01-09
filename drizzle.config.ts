import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle/",
  schema: "./src/models/schema.ts",
  dialect: "postgresql",
  migrations: {
    table: "drizzle_migrations",
    schema: "public",
    prefix: "timestamp",
  },
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
