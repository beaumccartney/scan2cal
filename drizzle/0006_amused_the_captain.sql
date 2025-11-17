ALTER TABLE "scan2cal_uploads" ALTER COLUMN "upload_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "scan2cal_uploads" ALTER COLUMN "upload_id" SET DEFAULT gen_random_uuid();