import type { Request, Response } from "express";

const getPresignedUrl = async (req: Request, res: Response) => {
  try {
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
