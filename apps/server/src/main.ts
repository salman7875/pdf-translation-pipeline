import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PDFParse } from "pdf-parse";
import { parsePdfRowsToStructure } from "./utils/pdfParseRowsToStructure.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataBuffer = fs.readFileSync(
  path.join(__dirname, "..", "/assets", "tamil.pdf"),
);

const main = async () => {
  const parser = new PDFParse({ data: dataBuffer });
  const result: any = await parser.getTable({});
  await parser.destroy();

  const allRows: string[][] = [];

  for (const page of result.pages) {
    for (const tables of page.tables) {
      for (const rows of tables) {
        allRows.push(rows);
      }
    }
  }
  const structeredData = parsePdfRowsToStructure(allRows);
  console.log(structeredData.at(0));
};

await main();
