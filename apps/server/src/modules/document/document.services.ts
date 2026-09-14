import { deleteObjectCommand, downloadObject } from "../../libs/s3/object";
import s3Client from "../../libs/s3";
import { db } from "../../prisma/db";
import { processDocument } from "../../utils/processing/index.js";

const bucketName = "my-bucket";

export type DocumentListFilters = {
  buyerName?: string;
  sellerName?: string;
  houseNumber?: string;
  surveyNumber?: string;
  documentNumber?: string;
};

export const createDocument = (userId: number, documentUrl: string) =>
  db.orm.public.Document.create({ documentUrl, userId });

const matchingTranslationIds = async (filters: DocumentListFilters) => {
  const translationIdSets: Set<number>[] = [];

  if (filters.buyerName) {
    const claimants = await db.orm.public.Claimant.where((claimant) =>
      claimant.name.ilike(`%${filters.buyerName}%`),
    ).all();
    translationIdSets.push(
      new Set(claimants.map((claimant) => claimant.translationId)),
    );
  }

  if (filters.sellerName) {
    const executants = await db.orm.public.Executant.where((executant) =>
      executant.name.ilike(`%${filters.sellerName}%`),
    ).all();
    translationIdSets.push(
      new Set(executants.map((executant) => executant.translationId)),
    );
  }

  if (filters.houseNumber) {
    const translations = await db.orm.public.Translation.where((record) =>
      record.plotNo.ilike(`%${filters.houseNumber}%`),
    ).all();
    translationIdSets.push(new Set(translations.map((record) => record.id)));
  }

  if (filters.surveyNumber) {
    const translations = await db.orm.public.Translation.where((record) =>
      record.surveyNo.ilike(`%${filters.surveyNumber}%`),
    ).all();
    translationIdSets.push(new Set(translations.map((record) => record.id)));
  }

  if (filters.documentNumber) {
    const translations = await db.orm.public.Translation.where((record) =>
      record.documentNo.ilike(`%${filters.documentNumber}%`),
    ).all();
    translationIdSets.push(new Set(translations.map((record) => record.id)));
  }

  if (translationIdSets.length === 0) {
    return null;
  }

  return [...translationIdSets[0]!].filter((id) =>
    translationIdSets.every((ids) => ids.has(id)),
  );
};

const attachTranslationParties = async <T extends { id: number }>(
  documents: T[],
  translations: Array<{ id: number; documentId: number }>,
) => {
  if (translations.length === 0) {
    return documents.map((document) => ({ ...document, translations: [] }));
  }

  const translationIds = translations.map((translation) => translation.id);
  const [executants, claimants] = await Promise.all([
    db.orm.public.Executant.where((executant) =>
      executant.translationId.in(translationIds),
    ).all(),
    db.orm.public.Claimant.where((claimant) =>
      claimant.translationId.in(translationIds),
    ).all(),
  ]);

  return documents.map((document) => ({
    ...document,
    translations: translations
      .filter((translation) => translation.documentId === document.id)
      .map((translation) => ({
        ...translation,
        executants: executants.filter(
          (executant) => executant.translationId === translation.id,
        ),
        claimants: claimants.filter(
          (claimant) => claimant.translationId === translation.id,
        ),
      })),
  }));
};

export const listDocuments = async (
  userId: number,
  filters: DocumentListFilters = {},
) => {
  const documents = await db.orm.public.Document.where({ userId }).all();
  const translationIds = await matchingTranslationIds(filters);

  if (translationIds === null) {
    const documentIds = documents.map((document) => document.id);
    const translations =
      documentIds.length === 0
        ? []
        : await db.orm.public.Translation.where((translation) =>
            translation.documentId.in(documentIds),
          ).all();
    return attachTranslationParties(documents, translations);
  }

  if (translationIds.length === 0) {
    return [];
  }

  const translations = await db.orm.public.Translation.where((translation) =>
    translation.id.in(translationIds),
  ).all();
  const documentIds = new Set(
    translations.map((translation) => translation.documentId),
  );

  const filteredDocuments = documents.filter((document) =>
    documentIds.has(document.id),
  );
  const filteredDocumentIds = filteredDocuments.map((document) => document.id);
  const filteredTranslations = await db.orm.public.Translation.where(
    (translation) => translation.documentId.in(filteredDocumentIds),
  ).all();

  return attachTranslationParties(filteredDocuments, filteredTranslations);
};

export const findDocumentById = (userId: number, id: number) =>
  db.orm.public.Document.where({ userId, id }).first();

export const removeDocument = async (userId: number, id: number) => {
  const document = await findDocumentById(userId, id);

  if (!document) {
    return null;
  }

  await s3Client.send(
    await deleteObjectCommand({ bucketName, key: document.documentUrl }),
  );
  await db.orm.public.Document.where({ userId, id }).delete();

  return document;
};

const asString = (value: unknown) => (typeof value === "string" ? value : "");

const asStringArray = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

export const processAndSaveDocument = async (userId: number, id: number) => {
  const document = await findDocumentById(userId, id);

  if (!document) {
    return null;
  }

  const file = await downloadObject({ bucketName, key: document.documentUrl });
  const records = await processDocument(file);
  const translations = [];

  for (const record of records) {
    const translation = await db.orm.public.Translation.create({
      documentId: document.id,
      srNo: String(record["Sr.No"] ?? ""),
      documentNo: asString(record["Document No.& Year"]),
      dateOfExecution: asStringArray(
        record[
          "Date of Execution & Date of Presentation & Date of Registration"
        ],
      ).join(" "),
      nature: asString(record.Nature),
      volNo: asString(record["Vol.No & Page.No"]),
      considerationValue: asString(record["Consideration Value"]),
      marketValue: asString(record["Market Value"]),
      prNumber: asString(record["PR Number"]),
      propertyType: asString(record["Property Type"]),
      propertyExtent: asString(record["Property Extent"]),
      documentRemarks: asString(record["Document Remarks"]),
      plotNo: asString(record["Plot No"]),
      surveyNo: asStringArray(record["Survey No"]).join(", "),
      boundaryDetail: asString(record["Boundary Details"]),
      scheduleRemarks: asString(record["Schedule Remarks"]),
      executants: (builder) =>
        builder.create(
          asStringArray(record["Name of Executant(s)"]).map((name) => ({
            name,
          })),
        ),
      claimants: (builder) =>
        builder.create(
          asStringArray(record["Name of Claimant(s)"]).map((name) => ({
            name,
          })),
        ),
    });
    translations.push(translation);
  }

  return { document, translations };
};
