import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { presignMany } from "~/server/lib/s3presign";
import { isVaildS3 } from "../../lib/isVaildS3";
import { PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

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
// put all the file in the array. 
const Output = z.array(SignedItem);
export const s3Router = createTRPCRouter({
presign: publicProcedure
    .input(Input)
    .output(Output)
    .mutation(async ({ input }) => {
      // RN, we dont have the user id. Next step, use the current user ID.
      const userId = "anonymous";

     
      const list =
        "files" in input
          ? input.files.map((f) => ({ name: f.filename, type: f.contentType }))
          : [{ name: input.filename, type: input.contentType }];

     // sign the presign url to each object.
      const results = await presignMany(list, userId);

      return results; // return the final results.
    }),

  // this part just update the information in the database
  confirm: publicProcedure
    .input(z.object({ key: z.string(), etag: z.string().optional(), size: z.number().optional() }))
    .mutation(async ({ input  }) => {
      const bucket = process.env.AWS_S3_BUCKET!;
      const head = await isVaildS3.send(
        new HeadObjectCommand({ Bucket: bucket, Key: input.key })
      );

    
      // await ctx.db.uploads.update(...)

      return {
        ok: true,
        size: Number(head.ContentLength ?? input.size ?? 0),
        etag: head.ETag?.replaceAll('"', "") ?? input.etag ?? null,
      };
    }),
});