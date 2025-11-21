CREATE TABLE "scan2cal_calendar" (
	"events" json,
	"created_at" timestamp DEFAULT now(),
	"account_id" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "scan2cal_uploads" (
	"upload_id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255),
	"bucket_name" varchar(255),
	"name" varchar(255),
	"url" text,
	"upload_time" timestamp DEFAULT now(),
	"status" varchar(500),
	"events_json" json
);
--> statement-breakpoint
DROP TABLE "scan2cal_post" CASCADE;--> statement-breakpoint
ALTER TABLE "scan2cal_account" ADD COLUMN "s3_folder" varchar(255);--> statement-breakpoint
ALTER TABLE "scan2cal_account" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "scan2cal_calendar" ADD CONSTRAINT "scan2cal_calendar_account_id_scan2cal_account_googleAccountId_fk" FOREIGN KEY ("account_id") REFERENCES "public"."scan2cal_account"("googleAccountId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scan2cal_uploads" ADD CONSTRAINT "scan2cal_uploads_user_id_scan2cal_account_googleAccountId_fk" FOREIGN KEY ("user_id") REFERENCES "public"."scan2cal_account"("googleAccountId") ON DELETE no action ON UPDATE no action;