import { auth } from "@/auth"
import { NextResponse } from 'next/server'

const PUBLIC_PATHS = [
  '/program/review',
]

export default auth((req) => {
  const { pathname } = req.nextUrl

  // Allow specific public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  console.log("🛡️ Middleware:", { path: pathname, hasAuth: !!req.auth, userId: req.auth?.user?.id });

  if (!req.auth) {
    return NextResponse.redirect(new URL('/auth/signin', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/program/:path*',
    '/check-in/:path*',
  ]
} 