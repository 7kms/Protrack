import { NextResponse } from "next/server";
import { db } from "@/db";
import { tasks, projects, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    // Use Promise.all to fetch all stats concurrently for better performance
    const [taskStats, projectStats, userStats] = await Promise.all([
      // Task statistics
      db
        .select({
          activeTasks: sql<number>`SUM(CASE WHEN ${tasks.status} IN ('developing', 'testing') AND ${tasks.active} = true THEN 1 ELSE 0 END)`,
          completedTasks: sql<number>`SUM(CASE WHEN ${tasks.status} = 'online' AND ${tasks.active} = true THEN 1 ELSE 0 END)`,
        })
        .from(tasks),

      // Project statistics
      db
        .select({
          totalProjects: sql<number>`COUNT(*)`,
        })
        .from(projects),

      // User statistics
      db
        .select({
          teamMembers: sql<number>`COUNT(*)`,
        })
        .from(users)
        .where(eq(users.active, true)),
    ]);

    return NextResponse.json({
      totalProjects: Number(projectStats[0].totalProjects || 0),
      activeTasks: Number(taskStats[0].activeTasks || 0),
      completedTasks: Number(taskStats[0].completedTasks || 0),
      teamMembers: Number(userStats[0].teamMembers || 0),
    });
  } catch (error) {
    logger.error("Error fetching dashboard stats", { error });
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
