import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Parse the database name and connection info from the URL
const url = new URL(databaseUrl);
const dbName = url.pathname.slice(1);

// Create a connection string to the default postgres database
const baseConnectionString = `${url.protocol}//${url.username}:${url.password}@${url.host}/postgres`;

// Create a connection to the default postgres database
const sql = postgres(baseConnectionString, { max: 1 });

async function createDatabase() {
  try {
    // Check if database exists
    const result = await sql`
      SELECT 1 FROM pg_database WHERE datname = ${dbName}
    `;

    // Create database if it doesn't exist
    if (result.length === 0) {
      console.log(`Creating database: ${dbName}`);
      await sql`CREATE DATABASE ${sql(dbName)}`;
      console.log("Database created successfully");
    } else {
      console.log(`Database ${dbName} already exists`);
    }
  } catch (error) {
    console.error("Failed to create database:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

createDatabase().catch((err) => {
  console.error("Database creation failed:", err);
  process.exit(1);
});
