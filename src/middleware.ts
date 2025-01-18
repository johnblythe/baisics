import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

const PROTECTED_PATHS = [
  '/dashboard',
  '/program',
  '/check-in',
]

const SUBSCRIPTION_COOKIE = 'sub_status'

export async function middleware(request: NextRequest) {
  const requiresSubscription = PROTECTED_PATHS.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (!requiresSubscription) {
    return NextResponse.next()
  }

  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  })

  if (!token?.sub) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Check cookie first
  const subStatus = request.cookies.get(SUBSCRIPTION_COOKIE)
  if (subStatus?.value) {
    try {
      const { status, validUntil } = JSON.parse(subStatus.value)
      if (status === 'ACTIVE' && new Date(validUntil) > new Date()) {
        return NextResponse.next()
      }
    } catch (e) {
      // Invalid cookie, will fetch from DB
    }
  }

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: token.sub },
      select: {
        status: true,
        currentPeriodEnd: true,
      }
    })

    if (!subscription || subscription.status !== 'ACTIVE') {
      return NextResponse.redirect(new URL('/upgrade', request.url))
    }

    // Set cookie and continue
    const response = NextResponse.next()
    response.cookies.set(
      SUBSCRIPTION_COOKIE,
      JSON.stringify({
        status: subscription.status,
        validUntil: subscription.currentPeriodEnd.toISOString()
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: subscription.currentPeriodEnd
      }
    )
    return response

  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.redirect(new URL('/upgrade', request.url))
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/program/:path*',
    '/check-in/:path*',
  ]
} 