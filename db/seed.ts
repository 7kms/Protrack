import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";
import * as schema from "./schema";

dotenv.config();

// Check for DATABASE_URL
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const mockUsers = [
  {
    name: "John Doe",
    role: "admin" as schema.UserRole,
  },
  {
    name: "Jane Smith",
    role: "manager" as schema.UserRole,
  },
  {
    name: "Mike Johnson",
    role: "team_lead" as schema.UserRole,
  },
  {
    name: "Sarah Williams",
    role: "developer" as schema.UserRole,
  },
  {
    name: "David Brown",
    role: "developer" as schema.UserRole,
  },
];

const mockProjects = [
  {
    title: "E-commerce Platform",
    description: "A modern e-commerce platform with advanced features",
    difficulty_multiplier: 1.5,
  },
  {
    title: "Mobile Banking App",
    description:
      "Secure mobile banking application with biometric authentication",
    difficulty_multiplier: 2.0,
  },
  {
    title: "Content Management System",
    description: "Enterprise-level CMS for managing digital content",
    difficulty_multiplier: 1.2,
  },
];

const mockTasks = [
  {
    title: "Implement User Authentication",
    issue_link: "https://github.com/project/auth/issues/1",
    status: "developing" as schema.TaskStatus,
    priority: "high" as schema.TaskPriority,
    category: "architecture" as schema.TaskCategory,
    contribution_score: 5,
    start_date: new Date("2024-04-01"),
    end_date: new Date("2024-04-15"),
  },
  {
    title: "Design Database Schema",
    issue_link: "https://github.com/project/db/issues/1",
    status: "completed" as schema.TaskStatus,
    priority: "high" as schema.TaskPriority,
    category: "architecture" as schema.TaskCategory,
    contribution_score: 8,
    start_date: new Date("2024-03-15"),
    end_date: new Date("2024-03-30"),
  },
  {
    title: "Create Landing Page",
    issue_link: "https://github.com/project/frontend/issues/1",
    status: "not_started" as schema.TaskStatus,
    priority: "medium" as schema.TaskPriority,
    category: "h5" as schema.TaskCategory,
    contribution_score: 3,
    start_date: new Date("2024-04-16"),
    end_date: new Date("2024-04-30"),
  },
  {
    title: "Optimize API Performance",
    issue_link: "https://github.com/project/backend/issues/1",
    status: "testing" as schema.TaskStatus,
    priority: "high" as schema.TaskPriority,
    category: "op" as schema.TaskCategory,
    contribution_score: 6,
    start_date: new Date("2024-04-10"),
    end_date: new Date("2024-04-25"),
  },
];

async function seed() {
  const sql = postgres(databaseUrl as string, { max: 1 });
  const db = drizzle(sql, { schema });

  try {
    console.log("Seeding database...");

    // Insert users
    const insertedUsers = await db
      .insert(schema.users)
      .values(mockUsers)
      .returning();
    console.log("Users seeded successfully");

    // Insert projects
    const insertedProjects = await db
      .insert(schema.projects)
      .values(mockProjects)
      .returning();
    console.log("Projects seeded successfully");

    // Insert tasks with relationships
    const tasksWithRelationships = mockTasks.map((task, index) => ({
      ...task,
      projectId: insertedProjects[index % insertedProjects.length].id,
      assignedToId: insertedUsers[index % insertedUsers.length].id,
    }));

    await db.insert(schema.tasks).values(tasksWithRelationships);
    console.log("Tasks seeded successfully");

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

seed().catch((err) => {
  console.error("Seed script failed:", err);
  process.exit(1);
});
