import { llmTranslate } from "./genai.js";

const mapConcurrent = async <T, R>(
  array: T[],
  batchSize: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> => {
  const results: R[] = [];
  for (let i = 0; i < array.length; i += batchSize) {
    const batch = array.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((item, batchIndex) => fn(item, i + batchIndex)),
    );
    results.push(...batchResults);
  }
  return results;
};

export const translateLayer = async (data: any[]): Promise<any[]> => {
  return await mapConcurrent(data, 2, async (d: any) => {
    const executantResult = await mapConcurrent(
      d["Name of Executant(s)"] || [],
      2,
      (item: string) => llmTranslate(item ?? ""),
    );

    const claimantResult = await mapConcurrent(
      d["Name of Claimant(s)"] || [],
      2,
      (item: string) => llmTranslate(item ?? ""),
    );

    const [remarksResult, boundaryResult, scheduleResult] = await Promise.all([
      llmTranslate(d["Document Remarks"] ?? ""),
      llmTranslate(d["Boundary Details"] ?? ""),
      llmTranslate(d["Schedule Remarks"] ?? ""),
    ]);

    return {
      ...d,
      "Name of Executant(s)": executantResult,
      "Name of Claimant(s)": claimantResult,
      "Consideration Value": (d["Consideration Value"] || "").replace(
        "ரூ.",
        "Rs.",
      ),
      "Market Value": (d["Market Value"] || "").replace("ரூ.", "Rs."),
      "Document Remarks": remarksResult,
      "Property Extent": (d["Property Extent"] || "").replace(
        "சதுரமீட்டர்",
        "Sq.Mt",
      ),
      "Boundary Details": boundaryResult,
      "Schedule Remarks": scheduleResult,
    };
  });
};
