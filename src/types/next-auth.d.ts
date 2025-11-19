import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id?: string | null;
      accountId?: number | null;
      googleAccountId?: string | null;
    };
  }

  interface User {
    accountId?: number | null;
    googleAccountId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accountId?: number | null;
    googleAccountId?: string | null;
  }
}
