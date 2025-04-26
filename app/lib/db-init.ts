import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { sql } from "drizzle-orm";
import * as schema from "../../db/schema";

// Initialize the database connection
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { max: 1 });
const db = drizzle(client, { schema });

// Function to create database if it doesn't exist
async function createDatabase() {
  try {
    // Extract database name from connection string
    const dbName = connectionString.split("/").pop()?.split("?")[0];
    if (!dbName) throw new Error("Invalid database URL");

    // Create a connection to the default postgres database
    const adminClient = postgres(
      connectionString.replace(`/${dbName}`, "/postgres"),
      { max: 1 }
    );

    // Check if database exists
    const result = await adminClient`
      SELECT 1 FROM pg_database WHERE datname = ${dbName}
    `;

    // Create database if it doesn't exist
    if (result.length === 0) {
      await adminClient`
        CREATE DATABASE ${dbName}
      `;
      console.log(`Database ${dbName} created successfully`);
    }

    await adminClient.end();
  } catch (error) {
    console.error("Error creating database:", error);
    throw error;
  }
}

// Function to create tables if they don't exist
async function createTables() {
  try {
    // Get all table names from the schema
    const tableNames = Object.keys(schema);

    // Check each table
    for (const tableName of tableNames) {
      const tableExists = await db.execute(
        sql`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ${tableName.toLowerCase()})`
      );

      if (!tableExists[0].exists) {
        // Create table using Drizzle's schema
        await db.execute(
          sql`CREATE TABLE IF NOT EXISTS ${sql.identifier(
            tableName.toLowerCase()
          )} ()`
        );
        console.log(`Table ${tableName} created successfully`);
      }
    }
  } catch (error) {
    console.error("Error creating tables:", error);
    throw error;
  }
}

// Function to create indexes
async function createIndexes() {
  try {
    // Get all indexes from the schema
    const indexes = Object.entries(schema).flatMap(
      ([tableName, tableSchema]) => {
        return Object.entries(tableSchema)
          .filter(([_, column]) => column.primary || column.unique)
          .map(([columnName, _]) => ({
            tableName: tableName.toLowerCase(),
            columnName: columnName.toLowerCase(),
          }));
      }
    );

    // Create indexes
    for (const { tableName, columnName } of indexes) {
      const indexName = `idx_${tableName}_${columnName}`;
      const indexExists = await db.execute(
        sql`SELECT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = ${indexName})`
      );

      if (!indexExists[0].exists) {
        await db.execute(
          sql`CREATE INDEX IF NOT EXISTS ${sql.identifier(
            indexName
          )} ON ${sql.identifier(tableName)} (${sql.identifier(columnName)})`
        );
        console.log(`Index ${indexName} created successfully`);
      }
    }
  } catch (error) {
    console.error("Error creating indexes:", error);
    throw error;
  }
}

// Function to initialize the database
export async function initDatabase() {
  try {
    console.log("Starting database initialization...");

    // Step 1: Create database if it doesn't exist
    await createDatabase();
    console.log("Database creation completed");

    // Step 2: Create tables
    await createTables();
    console.log("Table creation completed");

    // Step 3: Create indexes
    await createIndexes();
    console.log("Index creation completed");

    // Step 4: Run migrations
    await migrate(db, { migrationsFolder: "drizzle" });
    console.log("Migrations completed");

    console.log("Database initialization completed successfully");
    return true;
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  } finally {
    // Close the database connection
    await client.end();
  }
}
