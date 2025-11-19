ALTER TABLE "scan2cal_calendar"
  DROP CONSTRAINT IF EXISTS "scan2cal_calendar_account_id_scan2cal_account_googleAccountId_fk";
--> statement-breakpoint

ALTER TABLE "scan2cal_uploads"
  DROP CONSTRAINT IF EXISTS "scan2cal_uploads_user_id_scan2cal_account_googleAccountId_fk";
--> statement-breakpoint

ALTER TABLE "scan2cal_account"
  ALTER COLUMN "googleAccountId" DROP DEFAULT;
--> statement-breakpoint

ALTER TABLE "scan2cal_account"
  DROP CONSTRAINT IF EXISTS "scan2cal_account_pkey";
--> statement-breakpoint

ALTER TABLE "scan2cal_account"
  ADD COLUMN IF NOT EXISTS "id" integer;
--> statement-breakpoint

CREATE SEQUENCE IF NOT EXISTS "scan2cal_account_id_seq" OWNED BY "scan2cal_account"."id";
--> statement-breakpoint

ALTER TABLE "scan2cal_account"
  ALTER COLUMN "id" SET DEFAULT nextval('scan2cal_account_id_seq');
--> statement-breakpoint

UPDATE "scan2cal_account"
SET "id" = nextval('scan2cal_account_id_seq')
WHERE "id" IS NULL;
--> statement-breakpoint

ALTER TABLE "scan2cal_account"
  ALTER COLUMN "id" SET NOT NULL;
--> statement-breakpoint

ALTER TABLE "scan2cal_account"
  ADD CONSTRAINT "scan2cal_account_pkey" PRIMARY KEY ("id");
--> statement-breakpoint

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'scan2cal_account_googleAccountId_unique'
  ) THEN
    ALTER TABLE "scan2cal_account"
      ADD CONSTRAINT "scan2cal_account_googleAccountId_unique" UNIQUE ("googleAccountId");
  END IF;
END $$;
--> statement-breakpoint

ALTER TABLE "scan2cal_calendar"
  ADD COLUMN IF NOT EXISTS "account_id_new" integer;
--> statement-breakpoint

UPDATE "scan2cal_calendar" AS c
SET "account_id_new" = a."id"
FROM "scan2cal_account" AS a
WHERE c."account_id" = a."googleAccountId";
--> statement-breakpoint

ALTER TABLE "scan2cal_calendar"
  DROP COLUMN IF EXISTS "account_id";
--> statement-breakpoint

ALTER TABLE "scan2cal_calendar"
  RENAME COLUMN "account_id_new" TO "account_id";
--> statement-breakpoint

ALTER TABLE "scan2cal_calendar"
  ADD CONSTRAINT "scan2cal_calendar_account_id_scan2cal_account_id_fk"
  FOREIGN KEY ("account_id") REFERENCES "public"."scan2cal_account"("id")
  ON UPDATE no action ON DELETE no action;
--> statement-breakpoint

ALTER TABLE "scan2cal_uploads"
  ADD COLUMN IF NOT EXISTS "user_id_new" integer;
--> statement-breakpoint

UPDATE "scan2cal_uploads" AS u
SET "user_id_new" = a."id"
FROM "scan2cal_account" AS a
WHERE u."user_id" = a."googleAccountId";
--> statement-breakpoint

ALTER TABLE "scan2cal_uploads"
  DROP COLUMN IF EXISTS "user_id";
--> statement-breakpoint

ALTER TABLE "scan2cal_uploads"
  RENAME COLUMN "user_id_new" TO "user_id";
--> statement-breakpoint

ALTER TABLE "scan2cal_uploads"
  ADD CONSTRAINT "scan2cal_uploads_user_id_scan2cal_account_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."scan2cal_account"("id")
  ON UPDATE no action ON DELETE no action;
--> statement-breakpoint

ALTER TABLE "scan2cal_uploads"
  ADD COLUMN IF NOT EXISTS "clean_key" varchar(255);
--> statement-breakpoint

ALTER TABLE "scan2cal_uploads"
  DROP COLUMN IF EXISTS "events_json";
