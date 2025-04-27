import * as ExcelJS from "exceljs";
import { Writable } from "stream";

export class ExcelWriter {
  private workbook: any;
  private worksheet: any;
  private stream: Writable;

  constructor(stream: Writable) {
    this.stream = stream;
    this.workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: this.stream,
      useStyles: true,
      useSharedStrings: true,
    });
    this.worksheet = this.workbook.addWorksheet("Tasks");
  }

  initialize() {
    // Add headers with proper column names
    this.worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Title", key: "title", width: 30 },
      { header: "Issue Link", key: "issueLink", width: 30 },
      { header: "Project", key: "projectName", width: 20 },
      { header: "Assigned To", key: "assignedToName", width: 20 },
      { header: "Status", key: "status", width: 15 },
      { header: "Priority", key: "priority", width: 15 },
      { header: "Category", key: "category", width: 15 },
      { header: "Start Date", key: "startDate", width: 20 },
      { header: "End Date", key: "endDate", width: 20 },
      { header: "Contribution Score", key: "contributionScore", width: 20 },
      { header: "Created At", key: "createdAt", width: 20 },
    ];

    // Style the header row
    this.worksheet.getRow(1).font = { bold: true };

    // Set number format for Contribution Score column
    this.worksheet.getColumn("contributionScore").numFmt = "0.00";
  }

  async addDataChunk(startIndex: number, endIndex: number, tasks: any[]) {
    for (let i = startIndex; i <= endIndex; i++) {
      const task = tasks[i];
      const row = this.worksheet.addRow({
        id: task.id,
        title: task.title,
        issueLink: task.issueLink,
        projectName: task.projectName,
        assignedToName: task.assignedToName,
        status: task.status,
        priority: task.priority,
        category: task.category,
        startDate: task.startDate
          ? new Date(task.startDate).toLocaleDateString()
          : "",
        endDate: task.endDate
          ? new Date(task.endDate).toLocaleDateString()
          : "",
        contributionScore: parseFloat(task.contributionScore || "0"),
        createdAt: new Date(task.createdAt).toLocaleDateString(),
      });

      // Set number format for the Contribution Score cell
      const contributionScoreCell = row.getCell("contributionScore");
      contributionScoreCell.numFmt = "0.00";

      // Commit the row to ensure it's written to the stream
      await row.commit();
    }
  }

  async addTasks(tasks: any[], chunkSize: number = 1000) {
    const totalTasks = tasks.length;
    let currentIndex = 0;

    while (currentIndex < totalTasks) {
      const endIndex = Math.min(currentIndex + chunkSize - 1, totalTasks - 1);
      await this.addDataChunk(currentIndex, endIndex, tasks);
      currentIndex = endIndex + 1;
    }
  }

  async finalize() {
    // Auto-fit columns
    this.worksheet.columns.forEach((column: any) => {
      if (column.width) {
        column.width = Math.max(column.width || 0, 10);
      }
    });
    // Commit the workbook to finalize the stream
    await this.workbook.commit();
  }

  getStream(): Writable {
    return this.stream;
  }
}
