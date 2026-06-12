import { NextResponse } from "next/server";

// Routes that unauthenticated users CAN access
const PUBLIC_PATHS = ["/login", "/signup", "/callback"];

// Prefixes that are always allowed (API auth routes, static assets, Next.js internals)
const ALWAYS_ALLOWED_PREFIXES = [
  "/api/auth/",
  "/_next/",
  "/favicon.ico",
  "/logo-",
];

function isPublicPath(pathname) {
  // Exact public paths
  if (PUBLIC_PATHS.includes(pathname)) {
    return true;
  }

  // Always-allowed prefixes
  if (ALWAYS_ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }

  // Static files (images, fonts, etc.)
  if (
    /\.(svg|png|jpg|jpeg|gif|ico|woff2?|ttf|eot|webmanifest|xml|txt)$/.test(
      pathname,
    )
  ) {
    return true;
  }

  return false;
}

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get("auth-token");

  // If the user is authenticated and trying to visit auth pages or root, redirect to studio
  if (
    authToken &&
    (pathname === "/login" || pathname === "/signup" || pathname === "/")
  ) {
    return NextResponse.redirect(new URL("/studio", request.url));
  }

  // If the path is public, allow through
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Protected route — redirect to login if not authenticated
  if (!authToken) {
    const loginUrl = new URL("/login", request.url);
    // Pass the original URL so we can redirect back after login
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Match all paths except the ones Next.js needs internally
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
