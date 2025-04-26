"use server";

import { initDatabase } from "../lib/db-init";

let isInitialized = false;

export async function initializeDatabase() {
  if (!isInitialized) {
    try {
      await initDatabase();
      isInitialized = true;
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
  return { success: true };
}
