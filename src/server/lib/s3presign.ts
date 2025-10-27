import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { isVaildS3 } from "./isVaildS3";
import { randomUUID} from "crypto";
export async function presignMany(files: {name: string; type: string}[], userId: string) {
  const bucket = process.env.AWS_S3_BUCKET!;
  const today = new Date();
 // think create the unique identify.
  const y = today.getFullYear();
  const m = String(today.getMonth()+1).padStart(2,"0");
  const d = String(today.getDate()).padStart(2,"0");

  const results = await Promise.all(files.map(async (f) => {
    const ext = f.name.split(".").pop() ?? "bin";
    const slug = f.name.replace(/\s+/g,"-").replace(/[^a-zA-Z0-9._-]/g,"");
    // create the random UUID in the url
    const key = `uploads/${userId}/${y}/${m}/${d}/${randomUUID()}-${slug}.${ext}`;

    const cmd = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: f.type || "application/octet-stream",
    });
    // create the presign.
    const url = await getSignedUrl(isVaildS3, cmd, { expiresIn: 60 }); // 60s vaild
    return { url, key, contentType: f.type };
  }));
// when the client side get the persign form the backend. Client would use put option to submit all the file one by one 
  return results; 
}