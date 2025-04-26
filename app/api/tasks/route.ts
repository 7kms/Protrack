import { NextResponse } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";
import { logger } from "@/lib/logger";

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  issueLink: z.string().optional(),
  projectId: z.number(),
  assignedToId: z.number().optional(),
  status: z.enum([
    "not_started",
    "developing",
    "testing",
    "online",
    "suspended",
    "canceled",
  ]),
  priority: z.enum(["high", "medium", "low"]),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  contributionScore: z
    .number()
    .min(-10, "Contribution score must be at least -10")
    .max(10, "Contribution score must be at most 10")
    .optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const assignedToId = searchParams.get("assignedToId");
    const projectId = searchParams.get("projectId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status") as
      | "not_started"
      | "developing"
      | "testing"
      | "online"
      | "suspended"
      | "canceled"
      | null;
    const priority = searchParams.get("priority") as
      | "high"
      | "medium"
      | "low"
      | null;

    const offset = (page - 1) * limit;

    // Build the where conditions
    const conditions = [];
    if (assignedToId) {
      conditions.push(eq(tasks.assignedToId, parseInt(assignedToId)));
    }
    if (projectId) {
      conditions.push(eq(tasks.projectId, parseInt(projectId)));
    }
    if (startDate) {
      conditions.push(gte(tasks.startDate, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(lte(tasks.endDate, new Date(endDate)));
    }
    if (status) {
      conditions.push(eq(tasks.status, status));
    }
    if (priority) {
      conditions.push(eq(tasks.priority, priority));
    }

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
      .orderBy(desc(tasks.createdAt))
      .limit(limit)
      .offset(offset);

    if (!Array.isArray(result)) {
      logger.error("Tasks query result is not an array", { result });
      return NextResponse.json(
        { error: "Internal server error", tasks: [] },
        { status: 500 }
      );
    }

    logger.info(`Retrieved ${result.length} tasks`);
    return NextResponse.json({
      tasks: result,
      pagination: {
        total: totalCount[0].count,
        page,
        limit,
        totalPages: Math.ceil(totalCount[0].count / limit),
      },
    });
  } catch (error) {
    logger.error("Error fetching tasks", { error });
    return NextResponse.json(
      { error: "Failed to fetch tasks", tasks: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = taskSchema.parse(body);

    const newTask = await db
      .insert(tasks)
      .values({
        title: validatedData.title,
        description: validatedData.description,
        issueLink: validatedData.issueLink,
        projectId: validatedData.projectId,
        assignedToId: validatedData.assignedToId,
        status: validatedData.status,
        priority: validatedData.priority,
        startDate: validatedData.startDate
          ? new Date(validatedData.startDate)
          : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        contributionScore: validatedData.contributionScore?.toString() || "0",
      })
      .returning();
    return NextResponse.json(newTask[0], { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = taskSchema.parse(body);

    const updatedTask = await db
      .update(tasks)
      .set({
        title: validatedData.title,
        description: validatedData.description,
        issueLink: validatedData.issueLink,
        projectId: validatedData.projectId,
        assignedToId: validatedData.assignedToId,
        status: validatedData.status,
        priority: validatedData.priority,
        startDate: validatedData.startDate
          ? new Date(validatedData.startDate)
          : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        contributionScore: validatedData.contributionScore?.toString() || "0",
      })
      .where(eq(tasks.id, parseInt(id)))
      .returning();

    if (!updatedTask.length) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(updatedTask[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    const deletedTask = await db
      .delete(tasks)
      .where(eq(tasks.id, parseInt(id)))
      .returning();

    if (!deletedTask.length) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
