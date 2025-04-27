import { NextResponse } from "next/server";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { TaskService } from "../services/task-service";
import { taskSchema } from "../schemas";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
      const taskId = parseInt(await params.id);
      if (isNaN(taskId)) {
        return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
      }

      const updatedTask = await TaskService.updateTask(taskId, taskData);
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    try {
      const taskId = parseInt(await params.id);
      if (isNaN(taskId)) {
        return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
      }

      const result = await TaskService.deleteTask(taskId);
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
