import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Check if the DATABASE_URL environment variable is set
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create the PostgreSQL connection with proper configuration
const client = postgres(databaseUrl, {
  max: 10, // Maximum number of connections
  idle_timeout: 20, // Max idle time for connections
  connect_timeout: 10, // Connection timeout
  prepare: false, // Disable prepared statements for better compatibility
});

// Create the Drizzle database instance with query logging in development
export const db = drizzle(client, {
  schema,
  logger: process.env.NODE_ENV === "development",
});
