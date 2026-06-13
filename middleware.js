import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("auth-token-fallback")?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/studio") && !token) {
    return NextResponse.redirect(
      new URL("/login?error=unauthorized", request.url),
    );
  }

  if ((pathname === "/login" || pathname === "/signup") && token) {
    return NextResponse.redirect(new URL("/studio", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/studio/:path*", "/login", "/signup"],
};
