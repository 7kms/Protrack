"use server";

import { Pool } from "pg";
import { db } from "@/app/lib/db";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "path";

export async function initDatabase() {
  let adminPool: Pool | null = null;
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    // Create a connection to the default postgres database
    const defaultDbUrl = process.env.DATABASE_URL.replace(
      /\/[^/]+$/,
      "/postgres"
    );
    adminPool = new Pool({
      connectionString: defaultDbUrl,
    });

    // Create the database if it doesn't exist
    const dbName = process.env.DATABASE_URL.split("/").pop();
    if (!dbName) {
      throw new Error("Invalid DATABASE_URL format");
    }

    // Check if database exists
    const result = await adminPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (result.rows.length === 0) {
      console.log(`Creating database ${dbName}...`);
      await adminPool.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database ${dbName} created successfully`);
    }

    // Close the admin connection
    await adminPool.end();
    adminPool = null;

    // Get the absolute path to the drizzle migrations folder
    const migrationsFolder = path.join(process.cwd(), "drizzle");

    // Run migrations
    console.log("Running migrations...");
    await migrate(db, { migrationsFolder });
    console.log("Database initialized successfully");
    return { success: true };
  } catch (error) {
    console.error("Failed to initialize database:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    if (adminPool) {
      await adminPool.end();
    }
  }
}
