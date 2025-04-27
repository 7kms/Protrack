import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { z } from "zod";
import { projectSchema } from "./schemas";

export async function GET() {
  try {
    const allProjects = await db.select().from(projects);
    return NextResponse.json(allProjects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = projectSchema.parse(body);

    const newProject = await db
      .insert(projects)
      .values({
        title: validatedData.title,
        description: validatedData.description,
        logo: validatedData.logo,
        difficultyMultiplier: validatedData.difficultyMultiplier,
      })
      .returning();
    return NextResponse.json(newProject[0], { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
