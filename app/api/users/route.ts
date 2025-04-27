import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { z } from "zod";
import { userSchema } from "./schemas";

export async function GET() {
  try {
    const allUsers = await db.select().from(users);
    return NextResponse.json(allUsers);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = userSchema.parse(body);

    const newUser = await db
      .insert(users)
      .values({
        ...validatedData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(newUser[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create user:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
