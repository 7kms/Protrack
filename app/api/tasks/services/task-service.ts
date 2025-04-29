import { db } from "@/db";
import { tasks, projects, users } from "@/db/schema";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { logger } from "@/lib/logger";

export class TaskService {
  static async getTasksWithFilters(
    conditions: any[],
    page: number,
    limit: number
  ) {
    const offset = (page - 1) * limit;

    // Build the base query with active condition
    const baseConditions = [eq(tasks.active, true)];

    // Add other conditions if they exist
    if (conditions && conditions.length > 0) {
      baseConditions.push(...conditions);
    }

    // Get paginated results
    const tasksList = await db
      .select()
      .from(tasks)
      .where(and(...baseConditions))
      .limit(limit)
      .offset(offset);

    // Get total count
    const total = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(and(...baseConditions));

    if (!Array.isArray(tasksList)) {
      logger.error("Tasks query result is not an array", { result: tasksList });
      throw new Error("Internal server error");
    }

    return {
      tasks: tasksList,
      pagination: {
        total: Number(total[0].count),
        page,
        limit,
        totalPages: Math.ceil(Number(total[0].count) / limit),
      },
    };
  }

  static async getTasksForExport(
    conditions: any[],
    chunkSize: number,
    offset: number
  ) {
    return await db
      .select({
        id: tasks.id,
        title: tasks.title,
        issueLink: tasks.issueLink,
        projectId: tasks.projectId,
        projectName: projects.title,
        assignedToId: tasks.assignedToId,
        assignedToName: users.name,
        status: tasks.status,
        priority: tasks.priority,
        category: tasks.category,
        startDate: tasks.startDate,
        endDate: tasks.endDate,
        contributionScore: tasks.contributionScore,
        createdAt: tasks.createdAt,
      })
      .from(tasks)
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .leftJoin(users, eq(tasks.assignedToId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(tasks.createdAt))
      .limit(chunkSize)
      .offset(offset);
  }

  static async createTask(taskData: any) {
    return await db.insert(tasks).values(taskData).returning();
  }

  static async updateTask(taskId: number, taskData: any) {
    const result = await db
      .update(tasks)
      .set(taskData)
      .where(eq(tasks.id, taskId))
      .returning();

    if (result.length === 0) {
      throw new Error("Task not found");
    }

    return result[0];
  }

  static async deleteTask(taskId: number) {
    // Instead of deleting, we'll set active to false
    const result = await db
      .update(tasks)
      .set({ active: false })
      .where(eq(tasks.id, taskId))
      .returning();

    if (result.length === 0) {
      throw new Error("Task not found");
    }

    return result[0];
  }
}
