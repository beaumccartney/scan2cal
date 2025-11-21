import { and, eq } from "drizzle-orm";
import { uploads } from "./../../db/schema";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { presignMany } from "~/server/lib/s3/s3Presign";
import { TRPCError } from "@trpc/server";
import { ListObjectsV2Command, DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { readTextFromS3 } from "~/server/lib/s3/readTextFromS3";


/* ---------- Zod Schemas ---------- */
const FileInput = z.object({
  filename: z.string(),
  contentType: z.string().default("application/octet-stream"),
});

// Single file
const Single = FileInput;

// multi files
const Multi = z.object({
  files: z.array(FileInput).min(1),
});

// s3 presign need to get that is it single file or multi files.
const Input = z.union([Single, Multi]);

// sign the object
const SignedItem = z.object({
  url: z.string(),
  key: z.string(),
  contentType: z.string(),
});
// HELPER FUNCTION
// convert upload file to cleaned
// Just replace the name
// change the url from uploaded/././xx.pdf to cleand/xx.txt. It is actully the url from s3
function deriveCleanKey(uploadKey: string) {
  const segments = uploadKey.split("/");
  if (segments[0] === "uploads") {
    segments[0] = "cleaned";
  }
  const fileName = segments.pop() ?? "file";
  const baseName = fileName.replace(/\.[^.]+$/, "");
  const cleanFileName = `${baseName}.txt`;
  const cleanSegments = [...segments, cleanFileName];
  return cleanSegments.join("/");
}

// put all the file in the array.
const Output = z.array(SignedItem);
export const s3Router = createTRPCRouter({
  
  presign: protectedProcedure
    .input(Input)
    .output(Output)
    .mutation(async ({ input, ctx }) => {
      // get current usr id
      const accountId = ctx.userSession?.user.accountId;
      // get the unique google account id 
      const googleAccountId = ctx.userSession?.user.googleAccountId;
      // check the current account exist or not
    if (!accountId) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "No user session" });
    }
   // create user folder unique key. 
    const userFolderKey = googleAccountId ?? String(accountId);

 // check current user id
    console.log("current userID"+ userFolderKey);
      const list =
        "files" in input
          ? input.files.map((f) => ({ name: f.filename, type: f.contentType }))
          : [{ name: input.filename, type: input.contentType }];

      // sign the presign url to each object.
      const results = await presignMany(list, userFolderKey);

      return results; // return the final results.
    }),

  // this part just update the information in the database
  confirm: protectedProcedure
    .input(
      z.object({
        key: z.string(),
        etag: z.string().optional(),
        size: z.number().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const bucket = process.env.AWS_S3_BUCKET!;
      const currentUser = ctx.userSession?.user.accountId;
      
      if (!currentUser) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "No user session" });
      }
      console.log(currentUser);
      // to get cleaned url then store it in database
      const cleanKey = deriveCleanKey(input.key);
      console.log(`This is current: ${cleanKey}`);
      await ctx.db.insert(uploads).values({
        user_id: currentUser,
        bucket_name: bucket,
        name: input.key,
        status:"uploaded",
        url: `https://${bucket}  .s3.amazonaws.com/${input.key}`,
        clean_key: cleanKey,
      });
    }),
    // get all clean Files from the S3
  listCleanFolder: protectedProcedure.query(async ({ ctx }) => {
    const googleAccountId = ctx.userSession?.user.googleAccountId;
    if (!googleAccountId) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "No user session" });
    }
    const bucket = process.env.AWS_S3_BUCKET;
    const region = process.env.AWS_REGION;
    if (!bucket) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Missing S3 bucket configuration",
      });
    }

    const prefix = `cleaned/${googleAccountId}/`;
    const s3 = new S3Client({region});
    const res = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
      }),
    );

    return {
      prefix,
      objects:
        res.Contents?.map((obj) => ({
          key: obj.Key ?? "",
          size: obj.Size ?? 0,
          lastModified: obj.LastModified?.toISOString() ?? null,
        })) ?? [],
    };
  }),
// list all current user uploads router
  listUploads: protectedProcedure.query(async ({ ctx }) => {
    const currentUser = ctx.userSession?.user.accountId;
    if (!currentUser) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    // check from uploads database
    return ctx.db
      .select()
      .from(uploads)
      .where(eq(uploads.user_id, currentUser))
      .orderBy(uploads.upload_time);
  }),
// to get the clean text router
  getCleanText: protectedProcedure
    .input(z.object({ uploadId: z.number() }))
    .query(async ({ ctx, input }) => {
      const currentUser = ctx.userSession?.user.accountId;
      if (!currentUser) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const upload = await ctx.db.query.uploads.findFirst({
        where: (upload) =>
          and(eq(upload.upload_id, input.uploadId), eq(upload.user_id, currentUser)),
      });

      if (!upload) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Upload not found" });
      }
      if (!upload.clean_key) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Clean key not available yet",
        });
      }
      const text = await readTextFromS3(upload.clean_key);
      return { text, cleanKey: upload.clean_key };
    }),
// delete upload file router
  deleteUpload: protectedProcedure
    .input(z.object({ uploadId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const currentUser = ctx.userSession?.user.accountId;
      if (!currentUser) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      // search the file from the upload table
      const upload = await ctx.db.query.uploads.findFirst({
        where: (upload) =>
          and(eq(upload.upload_id, input.uploadId), eq(upload.user_id, currentUser)),
      });
      if (!upload) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Upload not found" });
      }

      const bucket = upload.bucket_name ?? process.env.AWS_S3_BUCKET;
      if (!bucket) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Missing bucket",
        });
      }
      const region = process.env.AWS_REGION;
      const s3 = new S3Client({region});

      const keysToDelete = [upload.name, upload.clean_key].filter(Boolean) as string[];
      for (const key of keysToDelete) {
        console.log(`Deleting Current S3 object: ${key}`);
        await s3.send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
          }),
        );
      }
      // delete from database
      await ctx.db.delete(uploads).where(eq(uploads.upload_id, input.uploadId));
      return { success: true };
    }),
});
