import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value; // "STUDENT" | "MENTOR" | "ADMIN"

  // 1. If accessing auth pages while already logged in
  if (token && (pathname === "/auth/login" || pathname === "/auth/signup")) {
    if (role === "MENTOR" || role === "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.redirect(new URL("/submit", req.url));
  }

  // 2. Mentor & Admin-only routes
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    if (role !== "MENTOR" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/submit", req.url));
    }
  }

  // 3. Student-protected routes
  if (pathname.startsWith("/submit") || pathname.startsWith("/my-submissions")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/submit/:path*",
    "/my-submissions/:path*",
    "/auth/:path*",
  ],
};
