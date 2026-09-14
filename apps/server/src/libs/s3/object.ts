import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import s3Client from "./index.js";

type CreateObjectT = {
  bucketName: string;
  key: string;
  contentType: string;
};

export const createObjectCommand = async ({
  bucketName,
  key,
  contentType,
}: CreateObjectT) => {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  return command;
};

export const getObjectCommand = async ({
  bucketName,
  key,
}: {
  bucketName: string;
  key: string;
}) => {
  const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
  return command;
};

export const downloadObject = async ({
  bucketName,
  key,
}: {
  bucketName: string;
  key: string;
}) => {
  const response = await s3Client.send(
    new GetObjectCommand({ Bucket: bucketName, Key: key }),
  );

  if (!response.Body) {
    throw new Error("Uploaded document has no content");
  }

  return Buffer.from(await response.Body.transformToByteArray());
};

export const deleteObjectCommand = async ({
  bucketName,
  key,
}: {
  bucketName: string;
  key: string;
}) => new DeleteObjectCommand({ Bucket: bucketName, Key: key });
