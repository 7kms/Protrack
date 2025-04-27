import { tasks } from "@/db/schema";
import { and, eq, gte, lte, sql } from "drizzle-orm";

export function buildFilterConditions(searchParams: URLSearchParams) {
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
    "op" | "h5" | "web" | "architecture"
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

  // Date range: include tasks if startDate OR endDate is in the query range
  if (startDate || endDate) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    if (end) end.setHours(23, 59, 59, 999);
    if (start && end) {
      conditions.push(
        sql`(
          (${tasks.startDate} BETWEEN ${start} AND ${end})
          OR
          (${tasks.endDate} BETWEEN ${start} AND ${end})
        )`
      );
    } else if (start) {
      conditions.push(
        sql`(
          (${tasks.startDate} >= ${start})
          OR
          (${tasks.endDate} >= ${start})
        )`
      );
    } else if (end) {
      conditions.push(
        sql`(
          (${tasks.startDate} <= ${end})
          OR
          (${tasks.endDate} <= ${end})
        )`
      );
    }
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
