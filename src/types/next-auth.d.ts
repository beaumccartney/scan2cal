import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id?: string | null;
      googleAccountId?: string | null;
    };
  }

  interface User {
    googleAccountId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    googleAccountId?: string | null;
  }
}
