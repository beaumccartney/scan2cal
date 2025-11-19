import { uploads } from "./../../db/schema";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { presignMany } from "~/server/lib/s3/s3Presign";
import { TRPCError } from "@trpc/server";

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
  presign: protectedProcedure
    .input(Input)
    .output(Output)
    .mutation(async ({ input, ctx }) => {
      // RN, we dont have the user id. Next step, use the current user ID.
      // const userId = z.number().parse(ctx.userSession!.user.accountId);
      const accountId = ctx.userSession?.user.accountId;
      const googleAccountId = ctx.userSession?.user.googleAccountId;

    if (!accountId) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "No user session" });
    }

    const userFolderKey = googleAccountId ?? String(accountId);


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
      await ctx.db.insert(uploads).values({
        user_id: currentUser,
        bucket_name: bucket,
        name: input.key,
        status:"uploaded",
        url: `https://${bucket}.s3.amazonaws.com/${input.key}`,
      });
    }),
});
