import express from "express";
import { authController } from "./auth.controllers";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authController.me);

export default router;
