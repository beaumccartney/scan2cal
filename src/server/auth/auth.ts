import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { accounts } from "../db/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";

const googleClient = process.env.GOOGLE_CLIENT_ID;
const googleSecret = process.env.GOOGLE_CLIENT_SECRET;
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not defined");
}

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

    async jwt({ token, account }) {
      if (account?.providerAccountId) {
        token.googleAccountId = account.providerAccountId;
        token.accountId = null;
      }

      if (token.googleAccountId && token.accountId == null) {
        const rows = await db
          .select({ id: accounts.id })
          .from(accounts)
          .where(eq(accounts.googleAccountId, token.googleAccountId))
          .limit(1);

        token.accountId = rows[0]?.id ?? null;
      }

      return token;
    },

    async session({ session, token }) {
      const accountId =
        typeof token.accountId === "number" ? token.accountId : null;
      session.user.id = accountId !== null ? accountId.toString() : null;
      session.user.accountId = accountId;
      session.user.googleAccountId = token.googleAccountId ?? null;
      return session;
    },
    // async jwt({ token, account }) {
    //   if (account) {
    //     token.googleAccountId = account.providerAccountId;
    //   }
    //   return token;
    // },

    // async session({ session, token }) {
    //   session.user.googleAccountId = token.googleAccountId;
    //   return session;
    // },
  },

  // async signOut() {
  //   await db
  //     .delete(accounts)
  //     .where(eq(accounts.googleAccountId, session?.user?.id));
  // },
});
