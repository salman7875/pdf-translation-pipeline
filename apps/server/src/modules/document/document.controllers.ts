import type { Request, Response } from "express";
import { createObjectCommand } from "../../libs/s3/object";
import { generateSignedUrl } from "../../libs/s3/signed-url";

const getPresignedUrl = async (req: Request, res: Response) => {
  try {
    const { fileName, fileType } = req.body;
    const s3Key = `uploads/${Date.now()}-${fileName}`;
    const contentType = fileType || "application/octet-stream";

    const command = await createObjectCommand({
      bucketName: "my-bucket",
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
    if (err instanceof Error) {
      res.status(500).json({ sucess: false, message: err.message });
    } else {
      res.status(500).json({ sucess: false, message: err });
    }
  }
};

const uploadDocument = async (req: Request, res: Response) => {
  try {
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ sucess: false, message: err.message });
    } else {
      res.status(500).json({ sucess: false, message: err });
    }
  }
};

const getDocuments = async (req: Request, res: Response) => {
  try {
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ sucess: false, message: err.message });
    } else {
      res.status(500).json({ sucess: false, message: err });
    }
  }
};

const getDocumentById = async (req: Request, res: Response) => {
  try {
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ sucess: false, message: err.message });
    } else {
      res.status(500).json({ sucess: false, message: err });
    }
  }
};

const deleteDocument = async (req: Request, res: Response) => {
  try {
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ sucess: false, message: err.message });
    } else {
      res.status(500).json({ sucess: false, message: err });
    }
  }
};

export const documentController = {
  getPresignedUrl,
  uploadDocument,
  getDocumentById,
  getDocuments,
  deleteDocument,
};
