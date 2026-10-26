import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";

const protectedPrefixes = [
  "/days",
  "/calendar",
  "/day",
  "/moments",
  "/notes",
  "/us",
  "/new",
  "/onboarding",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (!isProtected) return NextResponse.next();

  const session = request.cookies.get(SESSION_COOKIE)?.value;
  if (!session) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/days/:path*",
    "/calendar/:path*",
    "/day/:path*",
    "/moments/:path*",
    "/notes/:path*",
    "/us/:path*",
    "/new/:path*",
    "/onboarding/:path*",
  ],
};
