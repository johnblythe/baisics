import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = [
  '/program/review',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow specific public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Auth.js v5: need salt param for getToken to work
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    salt: request.nextUrl.protocol === 'https:'
      ? '__Secure-authjs.session-token'
      : 'authjs.session-token',
  })

  if (process.env.NODE_ENV === 'development') {
    console.log("🛡️ Middleware:", { path: pathname, hasToken: !!token, sub: token?.sub });
  }

  if (!token) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/program/:path*',
    '/check-in/:path*',
  ]
} 