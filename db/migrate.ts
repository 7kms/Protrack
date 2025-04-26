import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as dotenv from "dotenv";
import * as schema from "./schema";

dotenv.config();

// Check for DATABASE_URL
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Migration function
async function runMigration() {
  // Assert the database URL is defined (we checked above)
  const sql = postgres(databaseUrl as string, { max: 1 });

  // Create a typed database instance
  const db = drizzle(sql, { schema });

  console.log("Running migrations...");

  try {
    // Cast the db instance to any to bypass the type mismatch
    // This is safe because we're using the correct schema
    await migrate(db as any, { migrationsFolder: "drizzle" });
    console.log("Migrations completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }

  await sql.end();
  process.exit(0);
}

runMigration().catch((err) => {
  console.error("Migration script failed:", err);
  process.exit(1);
});
