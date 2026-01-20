import "dotenv/config";

import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// Configure Neon Local for development environment
if (process.env.NODE_ENV !== "production") {
  // Point to Neon Local proxy (db service in docker-compose)
  neonConfig.fetchEndpoint = "http://db:5432/sql";
  neonConfig.useSecureWebSocket = false;
  neonConfig.poolQueryViaFetch = true;
}

// Use DATABASE_URL from environment
// - Development: postgres://neon:npg@db:5432/neondb (Neon Local)
// - Production: postgres://...neon.tech/neondb (Neon Cloud)
const connectionString = process.env.DATABASE_URL!;

const sql = neon(connectionString);
const db = drizzle(sql);

export { sql, db };
