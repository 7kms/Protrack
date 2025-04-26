import { NextResponse } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
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
  contributionScore: z.number().nonnegative().optional(),
});

export async function GET() {
  try {
    const result = await db.select().from(tasks).orderBy(desc(tasks.createdAt));

    if (!Array.isArray(result)) {
      logger.error("Tasks query result is not an array", { result });
      return NextResponse.json(
        { error: "Internal server error", tasks: [] },
        { status: 500 }
      );
    }

    if (result.length === 0) {
      logger.info("No tasks found");
      return NextResponse.json({ tasks: [] });
    }

    logger.info(`Retrieved ${result.length} tasks`);
    return NextResponse.json({ tasks: result });
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
