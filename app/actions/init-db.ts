"use server";

import { Pool } from "pg";
import { db } from "@/app/lib/db";
import { migrate } from "drizzle-orm/node-postgres/migrator";

export async function initDatabase() {
  try {
    // Create a connection to the default postgres database
    const adminPool = new Pool({
      connectionString: process.env.DATABASE_URL?.replace(
        /\/[^/]+$/,
        "/postgres"
      ),
    });

    // Create the database if it doesn't exist
    const dbName = process.env.DATABASE_URL?.split("/").pop();
    if (dbName) {
      // Check if database exists
      const result = await adminPool.query(
        `SELECT 1 FROM pg_database WHERE datname = $1`,
        [dbName]
      );

      if (result.rows.length === 0) {
        await adminPool.query(`CREATE DATABASE ${dbName}`);
      }
    }

    // Close the admin connection
    await adminPool.end();

    // Run migrations
    await migrate(db, { migrationsFolder: "drizzle" });
    console.log("Database initialized successfully");
    return { success: true };
  } catch (error) {
    console.error("Failed to initialize database:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
