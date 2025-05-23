import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    // Get project statistics
    const stats = await db
      .select({
        totalProjects: sql<number>`COUNT(*)`,
      })
      .from(projects);

    return NextResponse.json({
      totalProjects: Number(stats[0].totalProjects || 0),
    });
  } catch (error) {
    console.error("Error fetching project stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch project statistics" },
      { status: 500 }
    );
  }
}
