"use server";

import { initDatabase } from "./db-init";

let isInitialized = false;

export async function initializeDatabase() {
  if (!isInitialized) {
    try {
      await initDatabase();
      isInitialized = true;
      console.log("Database initialized successfully");
    } catch (error) {
      console.error("Failed to initialize database:", error);
      throw error;
    }
  }
}
