import { TransformStream } from "stream/web";
import { Writable } from "stream";
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

    // Create a TransformStream to handle the Excel stream
    const transformStream = new TransformStream();
    const writer = transformStream.writable.getWriter();
    const reader = transformStream.readable;

    // Create a custom Writable stream that writes to the TransformStream
    const customWritable = new Writable({
      write(chunk, encoding, callback) {
        writer
          .write(chunk)
          .then(() => callback())
          .catch(callback);
      },
      final(callback) {
        writer
          .close()
          .then(() => callback())
          .catch(callback);
      },
    });

    // Create a new ExcelWriter instance with the custom Writable stream
    const excelWriter = new ExcelWriter(customWritable);
    excelWriter.initialize();

    // Set response headers for file download
    const headers = new Headers();
    headers.set(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    headers.set("Transfer-Encoding", "chunked");

    // Return the response immediately with the stream
    const response = new Response(reader, { headers });

    // Process data in chunks in the background
    processData().catch((error) => {
      logger.error("Error processing data", { error });
      writer.abort(error);
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
