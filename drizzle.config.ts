import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Parse the DATABASE_URL into individual components
const url = new URL(process.env.DATABASE_URL);
const [username, password] = url.username
  ? [url.username, url.password]
  : [undefined, undefined];
const [host, port] = url.hostname
  ? [url.hostname, url.port || "5432"]
  : [undefined, undefined];
const database = url.pathname.slice(1);

export default {
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: host || "localhost",
    port: parseInt(port || "5432"),
    user: username,
    password: password,
    database: database,
    ssl: false, // Disable SSL for local development
  },
  verbose: true,
  strict: true,
} satisfies Config;
