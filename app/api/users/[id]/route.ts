import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

import { z } from "zod";
import { userSchema } from "../schemas";

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const id = await params.id;

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = userSchema.parse(body);

    const updatedUser = await db
      .update(users)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, parseInt(id)))
      .returning();

    if (!updatedUser.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser[0]);
  } catch (error) {
    console.error("Failed to update user:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update user" },
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
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const updatedUser = await db
      .update(users)
      .set({
        active: false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, parseInt(id)))
      .returning();

    if (!updatedUser.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deactivated successfully" });
  } catch (error) {
    console.error("Failed to deactivate user:", error);
    return NextResponse.json(
      { error: "Failed to deactivate user" },
      { status: 500 }
    );
  }
}
