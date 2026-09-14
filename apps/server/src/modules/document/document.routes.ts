import express from "express";
import { documentController } from "./document.controllers";

const router = express.Router();

router.post("/upload", documentController.uploadDocument);
router.post("/signed-url", documentController.getPresignedUrl);
router.post("/:id/process", documentController.processDocument);
router.get("/", documentController.getDocuments);
router.get("/:id", documentController.getDocumentById);
router.delete("/:id", documentController.deleteDocument);

export default router;
