import { drizzle } from "drizzle-orm/postgres-js";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { accounts } from "../db/schema";
import postgres from "postgres"; // ✅ you need this driver for drizzle-orm/postgres-js

const googleClient = process.env.GOOGLE_CLIENT_ID;
const googleSecret = process.env.GOOGLE_CLIENT_SECRET;
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not defined");
}
const sql = postgres(process.env.DATABASE_URL);
const db = drizzle(sql);

export const { auth, signIn, signOut, handlers } = NextAuth({
  providers: [
    Google({
      clientId: googleClient,
      clientSecret: googleSecret,
    }),
  ],

  callbacks: {
    async signIn({ profile, account }) {
      if (!profile?.email || !account?.providerAccountId) {
        throw new Error("No Profile Found");
      }

      await db
        .insert(accounts)
        .values({
          googleAccountId: account.providerAccountId,
          refresh_token: account.refresh_token ?? null,
          access_token: account.access_token ?? null,
          expires_at: account.expires_at ?? null,
          token_type: account.token_type ?? null,
          scope: account.scope ?? null,
          id_token: account.id_token ?? null,
        })
        .onConflictDoUpdate({
          target: accounts.googleAccountId,
          set: {
            refresh_token: account.refresh_token ?? null,
            access_token: account.access_token ?? null,
            expires_at: account.expires_at ?? null,
            token_type: account.token_type ?? null,
            scope: account.scope ?? null,
            id_token: account.id_token ?? null,
          },
        });

      return true;
    },
  },
});
