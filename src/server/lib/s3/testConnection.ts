import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

export async function testBucketConnection() {
  const bucketName = process.env.AWS_S3_BUCKET;
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  // sanity check
  if (!bucketName || !region || !accessKeyId || !secretAccessKey) {
    console.error("Missing required AWS environment variables.");
    console.error({
      AWS_S3_BUCKET: bucketName,
      AWS_REGION: region,
      AWS_ACCESS_KEY_ID: accessKeyId,
      AWS_SECRET_ACCESS_KEY: secretAccessKey,
    });
    return;
  }

  const s3 = new S3Client({
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  try {
    const res = await s3.send(new ListObjectsV2Command({ Bucket: bucketName }));
    console.log(`Connected to bucket "${bucketName}"`);
    console.log(`Found ${res.Contents?.length ?? 0} objects.`);
    return s3;
  } catch (err) {
    console.error(`Failed to access bucket "${bucketName}"`);
    console.error(err);
  }
}
