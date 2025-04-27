import { NextResponse } from "next/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { projects, tasks } from "@/db/schema";
import { projectSchema } from "../schemas";

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const id = await params.id;

    if (!id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = projectSchema.parse(body);

    const updatedProject = await db
      .update(projects)
      .set({
        title: validatedData.title,
        description: validatedData.description,
        logo: validatedData.logo,
        difficultyMultiplier: validatedData.difficultyMultiplier,
      })
      .where(eq(projects.id, parseInt(id)))
      .returning();

    if (!updatedProject.length) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(updatedProject[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const id = await params.id;

    if (!id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const projectId = parseInt(id);

    // Check for associated tasks
    const associatedTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.projectId, projectId));

    if (associatedTasks.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete project with associated tasks",
          message: `This project has ${associatedTasks.length} associated task(s). Please delete or reassign these tasks first.`,
        },
        { status: 400 }
      );
    }

    const deletedProject = await db
      .delete(projects)
      .where(eq(projects.id, projectId))
      .returning();

    if (!deletedProject.length) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
