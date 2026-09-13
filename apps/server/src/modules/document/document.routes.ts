import express from "express";
import { documentController } from "./document.controllers";

const router = express.Router();

router.post("/upload", documentController.uploadDocument);
router.get("/signed-url", documentController.getPresignedUrl);
router.get("/", documentController.getDocuments);
router.get("/:id", documentController.getDocumentById);
router.delete("/:id", documentController.deleteDocument);

export default router;
