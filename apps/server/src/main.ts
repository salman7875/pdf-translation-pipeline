import { config } from "dotenv";
config();
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PDFParse } from "pdf-parse";
import { parsePdfRowsToStructure } from "./utils/pdfParseRowsToStructure.js";
import { llmTranslate } from "./utils/genai.js";
import { translateLayer } from "./utils/translateLayer.js";

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
  const translated = await translateLayer(structeredData);
  console.log(translated);
};
await main();
// llmTranslate(
//   "எல்ைல விபரங்கள் : ேமற்ப டி மைனப்பி ரிவில் ேபா ெதருவுக்கும் (ெதற்கு ), ேமற் ப நிலுைவக்கும் (வடக்கு ), பிளா மற்றும் ேமற் ப டி மைனப்பி ரி (கிழக்கு )",
// );
