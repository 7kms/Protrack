import { Readable } from "stream";
import { Workbook, Worksheet } from "exceljs";

export class ExcelWriter {
  private workbook: Workbook;
  private worksheet: Worksheet;

  constructor() {
    this.workbook = new Workbook();
    this.worksheet = this.workbook.addWorksheet("Tasks");

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

  async writeExcel(stream: Readable) {
    try {
      // Write to buffer first
      const buffer = await this.workbook.xlsx.writeBuffer();

      // Push the buffer to the stream
      stream.push(buffer);
      stream.push(null); // Signal end of stream
    } catch (error) {
      stream.emit("error", error);
    }
  }

  addTasks(tasks: any[]) {
    tasks.forEach((task) => {
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
    });
  }

  finalize() {
    // Auto-fit columns
    this.worksheet.columns.forEach((column) => {
      if (column.width) {
        column.width = Math.max(column.width || 0, 10);
      }
    });
  }
}
