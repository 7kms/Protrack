import { Transform } from "stream";
import { ExcelWriter } from "@/lib/excel-writer";
import { logger } from "@/lib/logger";
import { TaskService } from "./task-service";

export class ExcelExportService {
  static async exportTasksToExcel(
    conditions: any[],
    filename: string
  ): Promise<Response> {
    const CHUNK_SIZE = 1000;
    let offset = 0;
    let hasMore = true;

    // Create a Transform stream to handle the Excel data
    const transform = new Transform({
      transform(chunk, encoding, callback) {
        this.push(chunk);
        callback();
      },
    });

    // Create a new ExcelWriter instance with the Transform stream
    const excelWriter = new ExcelWriter(transform);
    excelWriter.initialize();

    // Set response headers for file download
    const headers = new Headers();
    headers.set(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    headers.set("Transfer-Encoding", "chunked");

    // Convert the Node.js stream to a web stream
    const response = new Response(transform as unknown as ReadableStream, {
      headers,
    });

    // Process data in chunks in the background
    processData().catch((error) => {
      logger.error("Error processing data", { error });
      transform.destroy(error);
    });

    async function processData() {
      while (hasMore) {
        const chunk = await TaskService.getTasksForExport(
          conditions,
          CHUNK_SIZE,
          offset
        );

        if (chunk.length === 0) {
          hasMore = false;
          break;
        }

        // Add tasks to worksheet in chunks
        await excelWriter.addTasks(chunk, CHUNK_SIZE);

        offset += CHUNK_SIZE;
        logger.info(`Processed ${offset} tasks`);
      }

      // Finalize the workbook
      await excelWriter.finalize();
    }

    return response;
  }
}
