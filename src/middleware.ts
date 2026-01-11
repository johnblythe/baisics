import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  // Allow public paths
  if (
    request.nextUrl.pathname.startsWith("/program/review") ||
    request.nextUrl.pathname.startsWith("/api/auth") ||
    request.nextUrl.pathname.startsWith("/auth")
  ) {
    return NextResponse.next();
  }

  // Protect dashboard and other routes
  // Use custom cookie name to match authOptions.cookies configuration
  const token = await getToken({
    req: request,
    cookieName: 'baisics.session-token',
  });

  if (!token) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/program/:path*",
    "/check-in/:path*",
  ],
};
