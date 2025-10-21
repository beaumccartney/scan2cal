import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const googleClient = process.env.GOOGLE_CLIENT_ID;
const googleSecret = process.env.GOOGLE_CLIENT_SECRET;

export const { auth, signIn, signOut, handlers } = NextAuth({
  providers: [
    Google({
      clientId: googleClient,
      clientSecret: googleSecret,
    }),
  ],
});
