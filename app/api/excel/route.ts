// import { NextRequest, NextResponse } from "next/server";
// import ExcelJS from "exceljs";

// export default async function GET(
//   request: NextRequest,
//   response: NextResponse
// ) {
//   // Set response headers for file download
//   const headers = new Headers();
//   headers.set(
//     "Content-Type",
//     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//   );
//   headers.set(
//     "Content-Disposition",
//     "attachment; filename=large_excel_file.xlsx"
//   );
//   headers.set("Transfer-Encoding", "chunked");
//   const reader = new ReadableStream({
//     async start(controller) {
//       const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
//         stream: controller,
//         useStyles: true,
//         useSharedStrings: true,
//       });

//       const worksheet = workbook.addWorksheet("Sheet1");
//       worksheet.addRow(["ID", "Name", "Email", "Phone", "Address"]);

//   new Response(reader, { headers });
//   try {
//     // Use the response object as the stream
//     const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
//       stream: response,
//       useStyles: true,
//       useSharedStrings: true,
//     });

//     const worksheet = workbook.addWorksheet("Sheet1");
//     worksheet.addRow(["ID", "Name", "Email", "Phone", "Address"]);

//     const addDataChunk = async (startRow: number, endRow: number) => {
//       for (let i = startRow; i <= endRow; i++) {
//         const rowData = [
//           i,
//           `Name ${i}`,
//           `email${i}@example.com`,
//           `555-${i}-${i}`,
//           `Address ${i}`,
//         ];
//         worksheet.addRow(rowData);
//         // await new Promise(resolve => setTimeout(resolve, 1));
//       }
//     };

//     const totalRows = 100000;
//     const chunkSize = 1000;
//     let currentRow = 2;

//     while (currentRow <= totalRows) {
//       const endRow = Math.min(currentRow + chunkSize - 1, totalRows);
//       await addDataChunk(currentRow, endRow);
//       currentRow = endRow + 1;
//     }

//     await workbook.commit();
//     // res.end() is handled by workbook.commit()
//     console.log("Excel file generation and streaming complete.");
//     // Return the response with the stream
//     return new Response(reader, { headers });
//   } catch (error: any) {
//     console.error("Error generating Excel file:", error);
//     // IMPORTANT: Handle errors appropriately for Next.js
//     res.status(500).send("Error generating Excel file.");
//   }
// }
