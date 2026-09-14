import {
  CreateBucketCommand,
  ListBucketsCommand,
  PutBucketCorsCommand,
} from "@aws-sdk/client-s3";
import s3Client from "./index.js";

export const initBucketCors = async (bucketName = "my-bucket") => {
  try {
    const bucketInfo = await s3Client.send(
      new ListBucketsCommand({ BucketRegion: "us-east-1" }),
    );

    const bucketExists = bucketInfo.Buckets?.some(
      (bucket) => bucket.Name === bucketName,
    );

    if (!bucketExists) {
      await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
    }

    await s3Client.send(
      new PutBucketCorsCommand({
        Bucket: bucketName,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedHeaders: ["*"],
              AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
              AllowedOrigins: [
                process.env.WEB_ORIGIN ?? "http://localhost:3001",
                "http://localhost:3000",
              ],
              ExposeHeaders: ["ETag"],
            },
          ],
        },
      }),
    );
    console.log(`CORS successfully configured for bucket: ${bucketName}`);
  } catch (err) {
    console.error("Failed to configure bucket CORS:", err);
  }
};
