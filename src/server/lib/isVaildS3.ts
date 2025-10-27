import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import "dotenv/config";
// set up s3 client
export const isVaildS3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
// test s3 conect successful or not
async function testS3() {
  const bucket = process.env.AWS_S3_BUCKET!;
  try {
    const res = await isVaildS3.send(new ListObjectsV2Command({ Bucket: bucket }));
    console.log(" Connected! Objects:", res.Contents?.length || 0);
  } catch (err) {
    console.error(" Failed:", err);
  }
}

testS3();