import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import { accounts } from "../db/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { type Adapter } from "@auth/core/adapters";
import { DrizzleAdapter } from "@auth/core/adapters";

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

      const userExists = await db
        .select()
        .from(accounts)
        .where(eq(accounts.googleAccountId, account.providerAccountId));

      // if user doesn't exist in database redirecit to signup page

      if (!userExists) {
        return false;
      } else {
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
      }

      return true;
    },

    async jwt({ token, account }) {
      if (account?.providerAccountId) {
        token.googleAccountId = account.providerAccountId;
      }
      return token;
    },

    async session({ session, token }) {
      if (token.googleAccountId) {
        session.user.id = token.googleAccountId;
      }
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
