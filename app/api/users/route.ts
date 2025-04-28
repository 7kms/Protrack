import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { z } from "zod";
import { userSchema } from "./schemas";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const includeInactive = url.searchParams.get("includeInactive") === "true";

    const query = db.select().from(users);
    if (!includeInactive) {
      query.where(eq(users.active, true));
    }

    const allUsers = await query;
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
