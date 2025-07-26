import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Check environment variables
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET environment variable is not set')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL environment variable is not set')
      return NextResponse.json(
        { error: 'Database configuration error' },
        { status: 500 }
      )
    }

    const { username, password } = await request.json()

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        class: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
      classId: user.classId || undefined,
    })

    // Return user data (without password) and token
    const { password: _password, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token,
    })
  } catch (error) {
    console.error('Login error:', error)

    // Provide more specific error information in development
    const isDevelopment = process.env.NODE_ENV === 'development'
    const errorMessage = isDevelopment && error instanceof Error
      ? `Internal server error: ${error.message}`
      : 'Internal server error'

    return NextResponse.json(
      {
        error: errorMessage,
        ...(isDevelopment && { stack: error instanceof Error ? error.stack : undefined })
      },
      { status: 500 }
    )
  }
}
