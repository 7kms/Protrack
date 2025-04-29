import { NextResponse } from "next/server";
import { db } from "@/db";
import { tasks, projects, users } from "@/db/schema";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const userId = searchParams.get("userId");
    const projectId = searchParams.get("projectId");
    const category = searchParams.get("category");

    // Build base conditions array
    const conditions = [eq(tasks.active, true)]; // Only consider active tasks

    // Add date filters if provided
    if (startDate) {
      conditions.push(gte(tasks.endDate, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(lte(tasks.endDate, new Date(endDate)));
    }

    // Add user filter if provided
    if (userId) {
      conditions.push(eq(tasks.assignedToId, parseInt(userId)));
    }

    // Add project filter if provided
    if (projectId) {
      conditions.push(eq(tasks.projectId, parseInt(projectId)));
    }

    // Add category filter if provided
    if (category && ["op", "h5", "web", "architecture"].includes(category)) {
      conditions.push(
        eq(tasks.category, category as "op" | "h5" | "web" | "architecture")
      );
    }

    // First, get all tasks with their details
    const tasksWithDetails = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        projectId: tasks.projectId,
        projectTitle: projects.title,
        projectDifficulty: projects.difficultyMultiplier,
        assignedToId: tasks.assignedToId,
        userName: users.name,
        userRole: users.role,
        startDate: tasks.startDate,
        endDate: tasks.endDate,
        contributionScore: tasks.contributionScore,
        category: tasks.category,
      })
      .from(tasks)
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .leftJoin(users, eq(tasks.assignedToId, users.id))
      .where(and(...conditions));

    // Process the results to group by user and project
    const contributionData = tasksWithDetails.reduce((acc, task) => {
      if (!task.assignedToId) return acc;

      const userId = task.assignedToId;
      const projectId = task.projectId;

      // Initialize user if not exists
      if (!acc[userId]) {
        acc[userId] = {
          id: userId,
          name: task.userName || "Unknown",
          role: task.userRole || "Unknown",
          totalContribution: 0,
          projects: {},
          projectContributions: [],
          categoryContributions: {
            op: 0,
            h5: 0,
            web: 0,
            architecture: 0,
          },
        };
      }

      // Initialize project if not exists
      if (projectId && !acc[userId].projects[projectId]) {
        acc[userId].projects[projectId] = {
          id: projectId,
          title: task.projectTitle || "Unknown",
          difficulty: task.projectDifficulty || 1,
          totalContribution: 0,
          tasks: [],
        };
      }

      // Calculate contribution
      const contribution =
        Number(task.contributionScore || 0) *
        Number(task.projectDifficulty || 1);
      acc[userId].totalContribution += contribution;

      // Add to category contributions
      if (task.category) {
        acc[userId].categoryContributions[task.category] += contribution;
      }

      // Add to project contributions
      if (projectId) {
        acc[userId].projects[projectId].totalContribution += contribution;
        acc[userId].projects[projectId].tasks.push({
          id: task.id,
          title: task.title || "Unknown",
          contribution: contribution,
          startDate: task.startDate,
          endDate: task.endDate,
          category: task.category,
        });
      }

      return acc;
    }, {} as Record<number, any>);

    // Add projectContributions array for pie chart data
    Object.values(contributionData).forEach((user) => {
      user.projectContributions = Object.values(user.projects).map(
        (project: any) => ({
          name: project.title,
          value: project.totalContribution,
        })
      );

      // Add categoryContributions array for category pie chart
      user.categoryContributionsArray = Object.entries(
        user.categoryContributions
      ).map(([category, value]) => ({
        name: category.toUpperCase(),
        value,
      }));
    });

    // Calculate total contributions for all users
    const totalContributions = Object.values(contributionData).reduce(
      (acc, user) => acc + user.totalContribution,
      0
    );

    return NextResponse.json({
      users: contributionData,
      totalContributions,
    });
  } catch (error) {
    logger.error("Error fetching contributions", { error });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
