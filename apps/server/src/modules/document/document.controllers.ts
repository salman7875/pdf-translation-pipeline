import type { Request, Response } from "express";
import { createObjectCommand, getObjectCommand } from "../../libs/s3/object";
import { generateSignedUrl } from "../../libs/s3/signed-url";
import {
  createDocument,
  findDocumentById,
  listDocuments,
  processAndSaveDocument,
  removeDocument,
} from "./document.services";

const bucketName = "my-bucket";

const getIdParam = (value: unknown) => {
  if (typeof value !== "string") {
    return null;
  }

  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

const sendError = (res: Response, status: number, message: string) => {
  res.status(status).json({ success: false, message });
};

const getPresignedUrl = async (req: Request, res: Response) => {
  try {
    const { fileName, fileType } = req.body as {
      fileName?: unknown;
      fileType?: unknown;
    };

    if (typeof fileName !== "string" || !fileName.trim()) {
      sendError(res, 400, "fileName is required");
      return;
    }

    const s3Key = `uploads/${Date.now()}-${fileName}`;
    const contentType =
      typeof fileType === "string" && fileType
        ? fileType
        : "application/octet-stream";

    const command = await createObjectCommand({
      bucketName,
      key: s3Key,
      contentType,
    });

    let uploadUrl = await generateSignedUrl(command);

    if (process.env.NODE_ENV !== "production" && process.env.AWS_ENDPOINT_URL) {
      uploadUrl = uploadUrl.replace(
        "http://floci:4566",
        "http://localhost:4566",
      );
    }

    res.status(201).json({ success: true, data: { uploadUrl, key: s3Key } });
  } catch (err) {
    sendError(
      res,
      500,
      err instanceof Error ? err.message : "Unable to create upload URL",
    );
  }
};

const uploadDocument = async (req: Request, res: Response) => {
  try {
    const { key } = req.body as { key?: unknown };
    const { id } = req.user;

    if (typeof key !== "string" || !key.startsWith("uploads/")) {
      sendError(res, 400, "A valid uploaded object key is required");
      return;
    }

    const command = await getObjectCommand({ bucketName, key });
    await generateSignedUrl(command);

    const document = await createDocument(id, key);

    res.status(201).json({
      success: true,
      message: "File is uploaded",
      data: document,
    });
  } catch (err) {
    sendError(
      res,
      500,
      err instanceof Error ? err.message : "Unable to save document",
    );
  }
};

const getDocuments = async (req: Request, res: Response) => {
  try {
    const documents = await listDocuments(req.user.id);
    res.json({ success: true, data: documents });
  } catch (err) {
    sendError(
      res,
      500,
      err instanceof Error ? err.message : "Unable to fetch documents",
    );
  }
};

const getDocumentById = async (req: Request, res: Response) => {
  try {
    const id = getIdParam(req.params.id);
    if (!id) {
      sendError(res, 400, "Document id must be a positive integer");
      return;
    }

    const document = await findDocumentById(req.user.id, id);
    if (!document) {
      sendError(res, 404, "Document not found");
      return;
    }

    const command = await getObjectCommand({
      bucketName,
      key: document.documentUrl,
    });
    const downloadUrl = await generateSignedUrl(command);
    res.json({ success: true, data: { ...document, downloadUrl } });
  } catch (err) {
    sendError(
      res,
      500,
      err instanceof Error ? err.message : "Unable to fetch document",
    );
  }
};

const deleteDocument = async (req: Request, res: Response) => {
  try {
    const id = getIdParam(req.params.id);
    if (!id) {
      sendError(res, 400, "Document id must be a positive integer");
      return;
    }

    const document = await removeDocument(req.user.id, id);
    if (!document) {
      sendError(res, 404, "Document not found");
      return;
    }

    res.json({ success: true, message: "Document deleted", data: document });
  } catch (err) {
    sendError(
      res,
      500,
      err instanceof Error ? err.message : "Unable to delete document",
    );
  }
};

const processDocument = async (req: Request, res: Response) => {
  try {
    const id = getIdParam(req.params.id);
    if (!id) {
      sendError(res, 400, "Document id must be a positive integer");
      return;
    }

    const result = await processAndSaveDocument(req.user.id, id);
    if (!result) {
      sendError(res, 404, "Document not found");
      return;
    }

    res.status(201).json({
      success: true,
      message: "Document processed and translated",
      data: result,
    });
  } catch (err) {
    sendError(
      res,
      500,
      err instanceof Error ? err.message : "Unable to process document",
    );
  }
};

export const documentController = {
  getPresignedUrl,
  uploadDocument,
  getDocumentById,
  getDocuments,
  deleteDocument,
  processDocument,
};
