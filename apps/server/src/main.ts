import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import express from "express";
import authRoutes from "./modules/auth/auth.routes";
import documentRoutes from "./modules/document/document.routes";
import { authorizationMiddleware } from "./middleware/authorization.middleware";

config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json());
app.use(authorizationMiddleware);

app.get("/health", (_req, res) => {
  res.json({ success: true, message: "Server is healthy" });
});
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
