// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

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
}));
