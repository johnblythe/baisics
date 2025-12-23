import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

const PROTECTED_PATHS = [
  '/dashboard',
  '/program',
  '/check-in',
]

const PUBLIC_PATHS = [
  '/program/review',
]

export async function middleware(request: NextRequest) {
  // Allow specific public paths even if parent is protected
  const isPublicPath = PUBLIC_PATHS.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )
  if (isPublicPath) {
    return NextResponse.next()
  }

  const requiresAuth = PROTECTED_PATHS.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (!requiresAuth) {
    return NextResponse.next()
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  })

  if (!token?.sub) {
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