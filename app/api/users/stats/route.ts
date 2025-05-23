import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  try {
    // Get user statistics (only active users)
    const stats = await db
      .select({
        teamMembers: sql<number>`COUNT(*)`,
      })
      .from(users)
      .where(eq(users.active, true));

    return NextResponse.json({
      teamMembers: Number(stats[0].teamMembers || 0),
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user statistics" },
      { status: 500 }
    );
  }
}
