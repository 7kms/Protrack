import { NextResponse } from "next/server";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { TaskService } from "./services/task-service";
import { buildFilterConditions } from "./utils/filter-conditions";
import { taskSchema } from "./schemas";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const conditions = buildFilterConditions(searchParams);

    try {
      const result = await TaskService.getTasksWithFilters(
        conditions,
        page,
        limit
      );
      return NextResponse.json(result);
    } catch (error) {
      logger.error("Error fetching tasks", { error });
      return NextResponse.json(
        { error: "Internal server error", tasks: [] },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error("Error in tasks API", { error });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = taskSchema.parse(body);

    const taskData = {
      title: validatedData.title,
      issueLink: validatedData.issueLink,
      projectId: validatedData.projectId,
      assignedToId: validatedData.assignedToId,
      status: validatedData.status,
      priority: validatedData.priority,
      category: validatedData.category,
      startDate: validatedData.startDate
        ? new Date(validatedData.startDate)
        : null,
      endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
      contributionScore: validatedData.contributionScore?.toString() || "0",
    };

    try {
      const newTask = await TaskService.createTask(taskData);
      return NextResponse.json(newTask, { status: 201 });
    } catch (error) {
      logger.error("Error creating task", { error });
      return NextResponse.json(
        { error: "Failed to create task" },
        { status: 500 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
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

    const taskData = {
      title: validatedData.title,
      issueLink: validatedData.issueLink,
      projectId: validatedData.projectId,
      assignedToId: validatedData.assignedToId,
      status: validatedData.status,
      priority: validatedData.priority,
      category: validatedData.category,
      startDate: validatedData.startDate
        ? new Date(validatedData.startDate)
        : null,
      endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
      contributionScore: validatedData.contributionScore?.toString() || "0",
    };

    try {
      const updatedTask = await TaskService.updateTask(parseInt(id), taskData);
      return NextResponse.json(updatedTask);
    } catch (error) {
      if (error instanceof Error && error.message === "Task not found") {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }
      logger.error("Error updating task", { error });
      return NextResponse.json(
        { error: "Failed to update task" },
        { status: 500 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
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

    try {
      const result = await TaskService.deleteTask(parseInt(id));
      return NextResponse.json(result);
    } catch (error) {
      if (error instanceof Error && error.message === "Task not found") {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }
      logger.error("Error deleting task", { error });
      return NextResponse.json(
        { error: "Failed to delete task" },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
