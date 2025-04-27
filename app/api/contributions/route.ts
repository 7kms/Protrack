import { NextResponse } from "next/server";
import { db } from "@/db";
import { tasks, projects, users } from "@/db/schema";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";

interface ContributionData {
  users: {
    [key: number]: {
      id: number;
      name: string;
      role: string;
      totalContribution: number;
      projects: {
        [key: number]: {
          id: number;
          title: string;
          difficulty: number;
          totalContribution: number;
          tasks: Array<{
            id: number;
            title: string;
            contribution: number;
            startDate: Date | null;
            endDate: Date | null;
            category: string | null;
          }>;
        };
      };
      projectContributions: Array<{ name: string; value: number }>;
      categoryContributions: Record<string, number>;
    };
  };
}

const contributionQuerySchema = z.object({
  projectId: z.string().optional(),
  userId: z.string().optional(),
  category: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = contributionQuerySchema.parse({
      projectId: searchParams.get("projectId") || undefined,
      userId: searchParams.get("userId") || undefined,
      category: searchParams.get("category") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
    });

    // Build the base query
    const conditions = [];
    if (query.projectId) {
      conditions.push(eq(tasks.projectId, parseInt(query.projectId)));
    }
    if (query.userId) {
      conditions.push(eq(tasks.assignedToId, parseInt(query.userId)));
    }
    if (query.category) {
      conditions.push(
        eq(tasks.category, query.category as "op" | "h5" | "architecture")
      );
    }
    if (query.startDate) {
      // we need to get all tasks that have an end date is in the date range
      // so we only need to search the tasks by end date regarless of the start date
      conditions.push(gte(tasks.endDate, new Date(query.startDate)));
    }
    if (query.endDate) {
      conditions.push(lte(tasks.endDate, new Date(query.endDate)));
    }

    const results = await db
      .select({
        taskId: tasks.id,
        taskTitle: tasks.title,
        projectId: tasks.projectId,
        userId: tasks.assignedToId,
        startDate: tasks.startDate,
        endDate: tasks.endDate,
        contributionScore: tasks.contributionScore,
        projectTitle: projects.title,
        projectDifficulty: projects.difficultyMultiplier,
        userName: users.name,
        userRole: users.role,
        category: tasks.category,
      })
      .from(tasks)
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .leftJoin(users, eq(tasks.assignedToId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Process the results to group by user and project
    const contributionData = results.reduce((acc, task) => {
      if (!task.userId) return acc;

      if (!acc[task.userId]) {
        acc[task.userId] = {
          id: task.userId,
          name: task.userName || "Unknown",
          role: task.userRole || "Unknown",
          totalContribution: 0,
          projects: {},
          projectContributions: [],
          categoryContributions: {
            op: 0,
            h5: 0,
            architecture: 0,
          },
        };
      }

      if (task.projectId && !acc[task.userId].projects[task.projectId]) {
        acc[task.userId].projects[task.projectId] = {
          id: task.projectId,
          title: task.projectTitle || "Unknown",
          difficulty: task.projectDifficulty || 1,
          totalContribution: 0,
          tasks: [],
        };
      }

      if (task.contributionScore) {
        const contribution =
          Number(task.contributionScore) * Number(task.projectDifficulty || 1);
        acc[task.userId].totalContribution += contribution;

        // Add to category contributions
        if (task.category) {
          acc[task.userId].categoryContributions[task.category] += contribution;
        }

        if (task.projectId) {
          acc[task.userId].projects[task.projectId].totalContribution +=
            contribution;
          acc[task.userId].projects[task.projectId].tasks.push({
            id: task.taskId,
            title: task.taskTitle || "Unknown",
            contribution: contribution,
            startDate: task.startDate,
            endDate: task.endDate,
            category: task.category,
          });
        }
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
      (acc, user) => {
        return acc + user.totalContribution;
      },
      0
    );

    return NextResponse.json({
      users: contributionData,
      totalContributions,
    });
  } catch (error) {
    console.error("Error fetching contribution data:", error);
    return NextResponse.json(
      { error: "Failed to fetch contribution data" },
      { status: 500 }
    );
  }
}
