const TRANSLATOR_URL = process.env.TRANSLATOR_URL ?? "http://localhost:8000";
const BATCH_SIZE = 16;
const CONCURRENCY = 2;
const TRANSLATABLE_FIELDS = [
  "Name of Executant(s)",
  "Name of Claimant(s)",
  "Document Remarks",
  "Boundary Details",
  "Schedule Remarks",
] as const;
const CURRENCY_FIELDS = ["Consideration Value", "Market Value"] as const;

const normalizeCurrency = (value: unknown): unknown =>
  typeof value === "string" ? value.replaceAll("ரூ.", "Rs.") : value;

type TranslationResponse = { translations: string[] };

const translateBatch = async (texts: string[]): Promise<string[]> => {
  let response: Response;

  try {
    response = await fetch(`${TRANSLATOR_URL}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts }),
    });
  } catch (error) {
    const reason =
      error instanceof Error ? error.message : "Unknown network error";
    throw new Error(
      `Translation service is unreachable at ${TRANSLATOR_URL}. Start the translator with 'uvicorn translator:app --host 0.0.0.0 --port 8000'. Cause: ${reason}`,
    );
  }

  if (!response.ok) {
    throw new Error(`Translation service returned HTTP ${response.status}`);
  }

  const result = (await response.json()) as TranslationResponse;
  if (
    !Array.isArray(result.translations) ||
    result.translations.length !== texts.length
  ) {
    throw new Error(
      "IndicTrans2 service returned an invalid translation count",
    );
  }
  return result.translations;
};

const translateUniqueTexts = async (
  texts: string[],
): Promise<Map<string, string>> => {
  const uniqueTexts = [
    ...new Set(texts.map((text) => text.trim()).filter(Boolean)),
  ];
  const translations = new Map<string, string>();

  for (
    let start = 0;
    start < uniqueTexts.length;
    start += BATCH_SIZE * CONCURRENCY
  ) {
    const batches = Array.from({ length: CONCURRENCY }, (_, offset) =>
      uniqueTexts.slice(
        start + offset * BATCH_SIZE,
        start + (offset + 1) * BATCH_SIZE,
      ),
    ).filter((batch) => batch.length > 0);
    const translatedBatches = await Promise.all(batches.map(translateBatch));

    batches.forEach((batch, batchIndex) => {
      batch.forEach((text, textIndex) => {
        translations.set(text, translatedBatches[batchIndex]![textIndex]!);
      });
    });
  }

  return translations;
};

export const translateLayer = async (data: any[]): Promise<any[]> => {
  const texts: string[] = [];
  for (const record of data) {
    for (const field of TRANSLATABLE_FIELDS) {
      const value = record[field];
      if (Array.isArray(value))
        texts.push(
          ...value.filter((item): item is string => typeof item === "string"),
        );
      else if (typeof value === "string") {
        texts.push(value);
      }
    }
  }

  const translations = await translateUniqueTexts(texts);
  return data.map((record) => {
    const translatedRecord = { ...record };
    for (const field of TRANSLATABLE_FIELDS) {
      const value = record[field];
      if (Array.isArray(value)) {
        translatedRecord[field] = value.map((item: unknown) =>
          typeof item === "string"
            ? (translations.get(item.trim()) ?? item)
            : item,
        );
      } else if (typeof value === "string") {
        translatedRecord[field] = translations.get(value.trim()) ?? value;
      }
    }
    for (const field of CURRENCY_FIELDS) {
      translatedRecord[field] = normalizeCurrency(record[field]);
    }
    return translatedRecord;
  });
};
