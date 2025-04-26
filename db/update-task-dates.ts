import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { relations, sql } from "drizzle-orm";

import * as dotenv from "dotenv";
import * as schema from "./schema";

dotenv.config();

// Check for DATABASE_URL
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Update tasks with missing dates
export const updateTaskDates = sql`
  DO $$ 
  BEGIN
      UPDATE tasks 
      SET start_date = CURRENT_DATE 
      WHERE start_date IS NULL;

      UPDATE tasks 
      SET end_date = CURRENT_DATE 
      WHERE end_date IS NULL;
  END $$;
`;

async function updateDates() {
  const sql = postgres(databaseUrl as string, { max: 1 });
  const db = drizzle(sql, { schema });

  console.log("Updating task dates...");

  try {
    await db.execute(updateTaskDates);
    console.log("Task dates updated successfully");
  } catch (error) {
    console.error("Update failed:", error);
    process.exit(1);
  }

  await sql.end();
  process.exit(0);
}

updateDates().catch((err) => {
  console.error("Update script failed:", err);
  process.exit(1);
});
