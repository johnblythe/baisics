import { auth } from "@/auth"

export default auth((req) => {
  if (!req.auth && !req.nextUrl.pathname.startsWith('/program/review')) {
    const newUrl = new URL('/auth/signin', req.nextUrl.origin)
    return Response.redirect(newUrl)
  }
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/program/:path*',
    '/check-in/:path*',
  ]
} 