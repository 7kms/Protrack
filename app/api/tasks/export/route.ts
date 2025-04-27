import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { ExcelExportService } from "../services/excel-export-service";
import { buildFilterConditions } from "../utils/filter-conditions";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

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

    const conditions = buildFilterConditions(searchParams);
    return await ExcelExportService.exportTasksToExcel(conditions, filename);
  } catch (error) {
    logger.error("Error in tasks export API", { error });
    return NextResponse.json(
      { error: "Failed to generate Excel file" },
      { status: 500 }
    );
  }
}
