import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "PROJECT_OWNER" | "CAPITAL_PROVIDER" | "ADMIN" | "ANALYST" | "COMPLIANCE";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "PROJECT_OWNER" | "CAPITAL_PROVIDER" | "ADMIN" | "ANALYST" | "COMPLIANCE";
  }
}
