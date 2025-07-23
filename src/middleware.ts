import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'

// Define protected API routes
const protectedApiRoutes = [
  '/api/users',
  '/api/classes',
  '/api/students',
  '/api/attendance',
]

// Define public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/api/auth/login',
  '/api/auth/logout',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if it's an API route that needs protection
  const isProtectedApiRoute = protectedApiRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Check if it's a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // For protected API routes, verify JWT token
  if (isProtectedApiRoute) {
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Add user info to request headers for use in API routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.userId)
    requestHeaders.set('x-user-role', payload.role)
    if (payload.classId) {
      requestHeaders.set('x-user-class-id', payload.classId)
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // For protected pages (non-API), redirect to login if no token in cookies
  const token = request.cookies.get('auth-token')?.value

  if (!token && pathname !== '/login' && pathname !== '/') {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
