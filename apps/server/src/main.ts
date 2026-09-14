import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import express from "express";
import authRoutes from "./modules/auth/auth.routes";
import documentRoutes from "./modules/document/document.routes";
import { authorizationMiddleware } from "./middleware/authorization.middleware";
import { initBucketCors } from "./libs/s3/bucket";

config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use((req, res, next) => {
  const origin = "*";
  res.header("Access-Control-Allow-Origin", origin);
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});
app.use(express.json());
app.use(authorizationMiddleware);

app.get("/health", (_req, res) => {
  res.json({ success: true, message: "Server is healthy" });
});
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);

const start = async () => {
  await initBucketCors();
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
};

await start();
