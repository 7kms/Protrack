import { NextResponse } from "next/server";
import { db } from "@/db";
import { tasks, projects, users } from "@/db/schema";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { ExcelWriter } from "@/lib/excel-writer";
import { Readable } from "stream";

const taskSchema = z.object({
  title: z.string().min(1),
  issueLink: z.string().optional(),
  projectId: z.number(),
  assignedToId: z.number().optional(),
  status: z.enum([
    "not_started",
    "developing",
    "testing",
    "online",
    "suspended",
    "canceled",
  ]),
  priority: z.enum(["high", "medium", "low"]),
  category: z.enum(["op", "h5", "architecture"]),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  contributionScore: z
    .number()
    .min(-10, "Contribution score must be at least -10")
    .max(10, "Contribution score must be at most 10")
    .optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const exportType = searchParams.get("export");

    if (exportType === "excel") {
      // Create a write stream for the Excel file
      const writer = new ExcelWriter();
      const stream = new Readable({
        read() {},
      });

      // Create dynamic filename based on date range
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");

      // Build filename
      let filename = "tasks";
      if (startDate || endDate) {
        const start = startDate ? startDate.split("T")[0] : "all";
        const end = endDate ? endDate.split("T")[0] : "all";
        filename = `tasks_${start}_to_${end}`;
      }
      filename += ".xlsx";

      // Set response headers for file download
      const headers = new Headers();
      headers.set(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      headers.set("Content-Disposition", `attachment; filename="${filename}"`);

      // Process data and write to Excel
      (async () => {
        try {
          // Get all projects and users for mapping
          const [allProjects, allUsers] = await Promise.all([
            db.select().from(projects),
            db.select().from(users),
          ]);

          const projectMap = new Map(allProjects.map((p) => [p.id, p.title]));
          const userMap = new Map(allUsers.map((u) => [u.id, u.name]));

          // Get all tasks with current filters
          const conditions = buildFilterConditions(searchParams);

          const CHUNK_SIZE = 1000; // Process 1000 tasks at a time
          let offset = 0;
          let hasMore = true;

          while (hasMore) {
            const chunk = await db
              .select()
              .from(tasks)
              .where(conditions.length > 0 ? and(...conditions) : undefined)
              .orderBy(desc(tasks.createdAt))
              .limit(CHUNK_SIZE)
              .offset(offset);

            if (chunk.length === 0) {
              hasMore = false;
              break;
            }

            // Enrich task data with project and user names
            const enrichedChunk = chunk.map((task) => ({
              ...task,
              projectName:
                projectMap.get(task.projectId || 0) || "Unknown Project",
              assignedToName:
                userMap.get(task.assignedToId || 0) || "Unassigned",
            }));

            // Write tasks to Excel
            writer.addTasks(enrichedChunk);
            offset += CHUNK_SIZE;
          }

          // Finalize the Excel file
          writer.finalize();

          // Write the Excel file to the stream
          await writer.writeExcel(stream);
        } catch (error) {
          logger.error("Error generating Excel file", { error });
          stream.emit("error", error);
        }
      })();

      // Return the stream immediately
      return new Response(stream as any, { headers });
    }

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Handle multiple values for filters
    const getArrayFromParams = (param: string | null) =>
      param ? param.split(",") : [];

    const assignedToIds = getArrayFromParams(searchParams.get("assignedToId"));
    const projectIds = getArrayFromParams(searchParams.get("projectId"));
    const statuses = getArrayFromParams(searchParams.get("status")) as Array<
      | "not_started"
      | "developing"
      | "testing"
      | "online"
      | "suspended"
      | "canceled"
    >;
    const priorities = getArrayFromParams(
      searchParams.get("priority")
    ) as Array<"high" | "medium" | "low">;
    const categories = getArrayFromParams(
      searchParams.get("category")
    ) as Array<"op" | "h5" | "architecture">;

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const offset = (page - 1) * limit;

    // Build the where conditions
    const conditions = [];

    if (assignedToIds.length > 0) {
      conditions.push(
        sql`${tasks.assignedToId} IN (${sql.join(
          assignedToIds.map((id) => sql`${parseInt(id)}`),
          sql`, `
        )})`
      );
    }

    if (projectIds.length > 0) {
      conditions.push(
        sql`${tasks.projectId} IN (${sql.join(
          projectIds.map((id) => sql`${parseInt(id)}`),
          sql`, `
        )})`
      );
    }

    if (startDate) {
      conditions.push(gte(tasks.startDate, new Date(startDate)));
    }

    if (endDate) {
      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999);
      conditions.push(lte(tasks.endDate, endDateObj));
    }

    if (statuses.length > 0) {
      conditions.push(
        sql`${tasks.status} IN (${sql.join(
          statuses.map((s) => sql`${s}`),
          sql`, `
        )})`
      );
    }

    if (priorities.length > 0) {
      conditions.push(
        sql`${tasks.priority} IN (${sql.join(
          priorities.map((p) => sql`${p}`),
          sql`, `
        )})`
      );
    }

    if (categories.length > 0) {
      conditions.push(
        sql`${tasks.category} IN (${sql.join(
          categories.map((c) => sql`${c}`),
          sql`, `
        )})`
      );
    }

    // Get total count for pagination
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Get paginated results
    const result = await db
      .select()
      .from(tasks)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(tasks.createdAt))
      .limit(limit)
      .offset(offset);

    if (!Array.isArray(result)) {
      logger.error("Tasks query result is not an array", { result });
      return NextResponse.json(
        { error: "Internal server error", tasks: [] },
        { status: 500 }
      );
    }

    logger.info(`Retrieved ${result.length} tasks`);
    return NextResponse.json({
      tasks: result,
      pagination: {
        total: totalCount[0].count,
        page,
        limit,
        totalPages: Math.ceil(totalCount[0].count / limit),
      },
    });
  } catch (error) {
    logger.error("Error in tasks API", { error });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to build filter conditions
function buildFilterConditions(searchParams: URLSearchParams) {
  const conditions = [];
  const getArrayFromParams = (param: string | null) =>
    param ? param.split(",") : [];

  const assignedToIds = getArrayFromParams(searchParams.get("assignedToId"));
  const projectIds = getArrayFromParams(searchParams.get("projectId"));
  const statuses = getArrayFromParams(searchParams.get("status")) as Array<
    | "not_started"
    | "developing"
    | "testing"
    | "online"
    | "suspended"
    | "canceled"
  >;
  const priorities = getArrayFromParams(searchParams.get("priority")) as Array<
    "high" | "medium" | "low"
  >;
  const categories = getArrayFromParams(searchParams.get("category")) as Array<
    "op" | "h5" | "architecture"
  >;

  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (assignedToIds.length > 0) {
    conditions.push(
      sql`${tasks.assignedToId} IN (${sql.join(
        assignedToIds.map((id) => sql`${parseInt(id)}`),
        sql`, `
      )})`
    );
  }

  if (projectIds.length > 0) {
    conditions.push(
      sql`${tasks.projectId} IN (${sql.join(
        projectIds.map((id) => sql`${parseInt(id)}`),
        sql`, `
      )})`
    );
  }

  if (startDate) {
    conditions.push(gte(tasks.startDate, new Date(startDate)));
  }

  if (endDate) {
    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999);
    conditions.push(lte(tasks.endDate, endDateObj));
  }

  if (statuses.length > 0) {
    conditions.push(
      sql`${tasks.status} IN (${sql.join(
        statuses.map((s) => sql`${s}`),
        sql`, `
      )})`
    );
  }

  if (priorities.length > 0) {
    conditions.push(
      sql`${tasks.priority} IN (${sql.join(
        priorities.map((p) => sql`${p}`),
        sql`, `
      )})`
    );
  }

  if (categories.length > 0) {
    conditions.push(
      sql`${tasks.category} IN (${sql.join(
        categories.map((c) => sql`${c}`),
        sql`, `
      )})`
    );
  }

  return conditions;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = taskSchema.parse(body);

    const newTask = await db
      .insert(tasks)
      .values({
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
      })
      .returning();
    return NextResponse.json(newTask[0], { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = taskSchema.parse(body);

    const updatedTask = await db
      .update(tasks)
      .set({
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
      })
      .where(eq(tasks.id, parseInt(id)))
      .returning();

    if (!updatedTask.length) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(updatedTask[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    const deletedTask = await db
      .delete(tasks)
      .where(eq(tasks.id, parseInt(id)))
      .returning();

    if (!deletedTask.length) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
