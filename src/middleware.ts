import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "advisor_session";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-only-insecure-secret-change-in-prod",
);

const ADMIN_ROLES = ["ADMIN", "PARTNER_MANAGER", "MARKETING_OPS", "SALES"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isPartnerRoute = pathname.startsWith("/partner");

  if (!isAdminRoute && !isPartnerRoute) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string;

    if (isAdminRoute && !ADMIN_ROLES.includes(role)) {
      return NextResponse.redirect(new URL("/partner", req.url));
    }
    if (isPartnerRoute && role !== "CA") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/partner/:path*"],
};
