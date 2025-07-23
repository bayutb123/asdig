import { NextRequest, NextResponse } from 'next/server'

// Simple JWT payload parsing for edge runtime (without verification)
function parseJWTPayload(token: string) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = parts[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))

    // Check if token is expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return null
    }

    return decoded
  } catch {
    return null
  }
}

function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

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

    // Parse JWT payload (edge runtime compatible)
    const payload = parseJWTPayload(token)
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

  // For protected pages (non-API), we'll handle auth client-side for now
  // since we're using localStorage instead of cookies
  // TODO: Implement proper cookie-based auth for SSR

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
