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
    // Get total count for pagination
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Get paginated results
    const result = await db
      .select()
      .from(tasks)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(
        sql`CASE 
          WHEN ${tasks.priority} = 'high' THEN 1
          WHEN ${tasks.priority} = 'medium' THEN 2
          WHEN ${tasks.priority} = 'low' THEN 3
          ELSE 4 END`,
        sql`CASE 
          WHEN ${tasks.status} = 'developing' THEN 1
          WHEN ${tasks.status} = 'testing' THEN 2
          WHEN ${tasks.status} = 'online' THEN 3
          WHEN ${tasks.status} = 'suspended' THEN 4
          WHEN ${tasks.status} = 'not_started' THEN 5
          WHEN ${tasks.status} = 'canceled' THEN 6
          ELSE 7 END`,
        sql`CASE 
          WHEN ${tasks.category} = 'h5' THEN 1
          WHEN ${tasks.category} = 'op' THEN 2
          WHEN ${tasks.category} = 'web' THEN 3
          WHEN ${tasks.category} = 'architecture' THEN 4
          ELSE 5 END`,
        desc(tasks.endDate)
      )
      .limit(limit)
      .offset((page - 1) * limit);

    if (!Array.isArray(result)) {
      logger.error("Tasks query result is not an array", { result });
      throw new Error("Internal server error");
    }

    return {
      tasks: result,
      pagination: {
        total: totalCount[0].count,
        page,
        limit,
        totalPages: Math.ceil(totalCount[0].count / limit),
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
    const newTask = await db.insert(tasks).values(taskData).returning();
    return newTask[0];
  }

  static async updateTask(id: number, taskData: any) {
    const updatedTask = await db
      .update(tasks)
      .set(taskData)
      .where(eq(tasks.id, id))
      .returning();

    if (!updatedTask.length) {
      throw new Error("Task not found");
    }

    return updatedTask[0];
  }

  static async deleteTask(id: number) {
    const deletedTask = await db
      .delete(tasks)
      .where(eq(tasks.id, id))
      .returning();

    if (!deletedTask.length) {
      throw new Error("Task not found");
    }

    return { message: "Task deleted successfully" };
  }
}
