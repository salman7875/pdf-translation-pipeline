import { deleteObjectCommand, downloadObject } from "../../libs/s3/object";
import s3Client from "../../libs/s3";
import { db } from "../../prisma/db";
import { main as processDocument } from "../../utils/processing/index.js";

const bucketName = "my-bucket";

export const createDocument = (userId: number, documentUrl: string) =>
  db.orm.public.Document.create({ documentUrl, userId });

export const listDocuments = (userId: number) =>
  db.orm.public.Document.where({ userId }).all();

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
