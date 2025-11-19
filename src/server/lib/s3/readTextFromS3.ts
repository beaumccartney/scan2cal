// src/server/lib/s3/readTextFromS3.ts
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";

const s3 = new S3Client({ region: process.env.AWS_REGION });

function streamToString(stream: Readable) {
  const chunks: Buffer[] = [];
  return new Promise<string>((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    stream.on("error", reject);
  });
}

export async function readTextFromS3(key: string, bucket?: string) {
  const Bucket = bucket ?? process.env.AWS_S3_BUCKET!;

  const res = await s3.send(
    new GetObjectCommand({
      Bucket,
      Key: key,
    }),
  );

  return await streamToString(res.Body as Readable);
}