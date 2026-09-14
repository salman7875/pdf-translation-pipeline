import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { S3Client } from "@aws-sdk/client-s3";

config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

const configuredEndpoint = process.env.AWS_ENDPOINT_URL;
const endpoint =
  process.env.NODE_ENV !== "production"
    ? configuredEndpoint?.replace("http://floci:4566", "http://localhost:4566")
    : configuredEndpoint;

const s3Client = new S3Client({
  region: process.env.AWS_DEFAULT_REGION || "us-east-1",
  forcePathStyle: true,
  ...(endpoint && {
    endpoint,
  }),
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export default s3Client;
