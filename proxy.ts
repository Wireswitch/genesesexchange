import { auth } from "@/auth";
import { NextResponse } from "next/server";

const roleForPrefix: Record<string, string[]> = {
  "/project-owner": ["PROJECT_OWNER", "ADMIN"],
  "/capital-provider": ["CAPITAL_PROVIDER", "ADMIN"],
  "/admin": ["ADMIN", "ANALYST", "COMPLIANCE"],
};

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const prefix = Object.keys(roleForPrefix).find((p) => pathname.startsWith(p));
  if (!prefix) return NextResponse.next();

  const session = req.auth;
  if (!session?.user) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const allowed = roleForPrefix[prefix];
  if (!allowed.includes(session.user.role)) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/project-owner/:path*", "/capital-provider/:path*", "/admin/:path*"],
};
