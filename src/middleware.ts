import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

const PROTECTED_PATHS = [
  '/dashboard',
  '/program',
  '/check-in',
]

export async function middleware(request: NextRequest) {
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