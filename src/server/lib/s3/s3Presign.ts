import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { testBucketConnection } from "./testConnection";
import { randomUUID } from "crypto";
import { api } from "~/trpc/react";
export async function presignMany(
  files: { name: string; type: string }[],
  userId: string,
) {
  const bucket = process.env.AWS_S3_BUCKET!;
  const today = new Date();
  // think create the unique identify.
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  const s3 = new S3Client();
  await testBucketConnection();

  const results = await Promise.all(
    files.map(async (f) => {
      const originalName = f.name;
      const lastDot = originalName.lastIndexOf(".");

      let baseName = originalName;
      let ext = "";

      if (lastDot > 0 && lastDot < originalName.length - 1) {
        baseName = originalName.slice(0, lastDot);
        ext = originalName.slice(lastDot + 1);
      }

      const slug = baseName
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9._-]/g, "");

      const finalName = ext ? `${slug}.${ext}` : slug;

      const key = `uploads/${userId}/${y}/${m}/${d}/${randomUUID()}-${finalName}`;
      const cmd = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: f.type || "application/octet-stream",
      });
      // create the presign.
      const url = await getSignedUrl(s3, cmd, {
        expiresIn: 60,
      }); // 60s vaild
      return { url, key, contentType: f.type };
    }),
  );

  console.log(
    "Presigned URLs generated for files:",
    results.map((r) => r.key),
  );

  // when the client side get the persign form the backend. Client would use put option to submit all the file one by one
  return results;
}
