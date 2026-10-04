import { PDFParse } from "pdf-parse";
import { parsePdfRowsToStructure } from "./pdfParseRowsToStructure.js";
import { translateLayer } from "../translating/translateLayer.js";
import { performance } from "node:perf_hooks";

export const processDocument = async (dataBuffer: Buffer) => {
  const totalStartTime = performance.now();

  const readingStart = performance.now();
  const parser = new PDFParse({ data: dataBuffer });
  const result: any = await parser.getTable({});
  await parser.destroy();
  const readingEnd = performance.now() - readingStart;

  const allRows: string[][] = [];

  const loopStart = performance.now();
  for (const page of result.pages) {
    for (const tables of page.tables) {
      for (const rows of tables) {
        allRows.push(rows);
      }
    }
  }
  const loopEnd = performance.now() - loopStart;
  const structureStart = performance.now();
  const structeredData = parsePdfRowsToStructure(allRows);
  const structureEnd = performance.now() - structureStart;

  const translateStart = performance.now();
  const translated = await translateLayer(structeredData);
  const translateEnd = performance.now() - translateStart;

  const totalDuration = performance.now() - totalStartTime;

  console.log(`[Performance Metrics]: Process Document`, {
    totalDuration,
    loopEnd,
    structureEnd,
    translateEnd,
  });
  return translated;
};
