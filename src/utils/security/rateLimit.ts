import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter
// Note: Resets on cold starts, won't sync across instances
// Good enough for basic abuse prevention at launch

const requests = new Map<string, { count: number; reset: number }>()

function getIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

export function checkRateLimit(
  req: NextRequest,
  maxRequests = 10,
  windowMs = 60_000
): { ok: boolean; remaining: number } {
  const ip = getIP(req)
  const key = `${req.nextUrl.pathname}:${ip}`
  const now = Date.now()

  const entry = requests.get(key)

  // New window or expired
  if (!entry || entry.reset < now) {
    requests.set(key, { count: 1, reset: now + windowMs })
    return { ok: true, remaining: maxRequests - 1 }
  }

  // Over limit
  if (entry.count >= maxRequests) {
    return { ok: false, remaining: 0 }
  }

  entry.count++
  return { ok: true, remaining: maxRequests - entry.count }
}

export function rateLimitedResponse() {
  return NextResponse.json(
    { error: 'Too many requests. Please slow down.' },
    { status: 429 }
  )
}
