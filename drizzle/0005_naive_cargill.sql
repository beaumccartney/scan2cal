ALTER TABLE "scan2cal_calendar" ADD COLUMN "calendar_id" serial PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "scan2cal_calendar" ADD COLUMN "name" varchar(255);--> statement-breakpoint
ALTER TABLE "scan2cal_calendar" ADD COLUMN "description" text;