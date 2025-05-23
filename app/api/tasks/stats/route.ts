import { NextResponse } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq, and, or, sql } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    // Get task statistics with a single query
    const stats = await db
      .select({
        activeTasks: sql<number>`SUM(CASE WHEN ${tasks.status} IN ('developing', 'testing') AND ${tasks.active} = true THEN 1 ELSE 0 END)`,
        completedTasks: sql<number>`SUM(CASE WHEN ${tasks.status} = 'online' AND ${tasks.active} = true THEN 1 ELSE 0 END)`,
        totalTasks: sql<number>`SUM(CASE WHEN ${tasks.active} = true THEN 1 ELSE 0 END)`,
      })
      .from(tasks);

    return NextResponse.json({
      activeTasks: Number(stats[0].activeTasks || 0),
      completedTasks: Number(stats[0].completedTasks || 0),
      totalTasks: Number(stats[0].totalTasks || 0),
    });
  } catch (error) {
    logger.error("Error fetching task stats", { error });
    return NextResponse.json(
      { error: "Failed to fetch task statistics" },
      { status: 500 }
    );
  }
}
