import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { isVaildS3 } from "./isVaildS3";


// upload the file for back end
export async function uploadToS3(key: string, body: Buffer | string, contentType: string) {
  const cmd = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    Body: body,
    ContentType: contentType,
  });
  await isVaildS3.send(cmd);
  return `s3://${process.env.AWS_S3_BUCKET}/${key}`;
}

// read file from s3
export async function getFromS3(key: string) {
  const cmd = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
  });
  const res = await isVaildS3.send(cmd);
  return res.Body?.transformToString?.(); // AWS SDK v3 的新方法
}

// delete file from s3
export async function deleteFromS3(key: string) {
  const cmd = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
  });
  await isVaildS3.send(cmd);
  return true;
}