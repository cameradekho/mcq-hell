// middleware.ts
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })
  
  // Public routes - allow root, all /form/* paths, and auth endpoints
  if (
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/form') ||
    request.nextUrl.pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next()
  }

  // Protected routes - require authentication
  if (!token) {
    // Redirect unauthenticated users to the form page
    return NextResponse.redirect(new URL('/form', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
