import { PDFParse } from "pdf-parse";
import { parsePdfRowsToStructure } from "./pdfParseRowsToStructure.js";
import { translateLayer } from "../translating/translateLayer.js";

export const processDocument = async (dataBuffer: Buffer) => {
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
  const translated = await translateLayer(structeredData);
  return translated;
};
