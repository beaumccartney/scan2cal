// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { s3 } from "bun";
import { sql } from "drizzle-orm";
import { index, pgTableCreator } from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see hcttps://orm.drizzle.team/docs/goodies#multi-projet-schema
 */
export const createTable = pgTableCreator((name) => `scan2cal_${name}`);

export const accounts = createTable("account", (d) => ({
  googleAccountId: d.varchar({ length: 255 }).primaryKey().default("AccountID"),
  refresh_token: d.text(),
  access_token: d.text(),
  expires_at: d.integer(),
  token_type: d.varchar({ length: 255 }),
  scope: d.varchar({ length: 255 }),
  id_token: d.text(),
  session_state: d.varchar({ length: 255 }),
  s3_folder: d.varchar({ length: 255 }),
  created_at: d.timestamp().defaultNow(),
}));

export const calendar = createTable("calendar", (d) => ({
  calendar_id: d.serial().primaryKey(),
  name: d.varchar({ length: 255 }),
  description: d.text(),
  events: d.json(),
  created_at: d.timestamp().defaultNow(),
  account_id: d
    .varchar({ length: 255 })
    .references(() => accounts.googleAccountId),
}));

export const uploads = createTable("uploads", (d) => ({
  upload_id: d.serial().primaryKey(),
  user_id: d
    .varchar({ length: 255 })
    .references(() => accounts.googleAccountId),
  bucket_name: d.varchar({ length: 255 }),
  name: d.varchar({ length: 255 }),
  url: d.text(),
  upload_time: d.timestamp().defaultNow(),
  status: d.varchar({ length: 500 }),
  clean_key: d.varchar({ length: 255 }), 
 // events_json: d.json(),
}));

// export const indexUserId = index("uploads_user_id_index")
//   .on(uploads)
//   .columns(uploads.user_id);
