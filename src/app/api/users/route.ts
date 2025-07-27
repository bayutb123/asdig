import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

// GET /api/users - Get all users (admins only)
export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role')
    
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        // nip: true, // Will be available after Prisma regeneration
        username: true,
        role: true,
        // phone: true, // Will be available after Prisma regeneration
        // email: true, // Will be available after Prisma regeneration
        classId: true,
        // className: true, // Will be available after Prisma regeneration
        // subject: true, // Will be available after Prisma regeneration
        // position: true, // Will be available after Prisma regeneration
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json({
      success: true,
      users,
    })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/users - Create new user (admins only)
export async function POST(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role')
    
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const userData = await request.json()
    const {
      id,
      name,
      nip,
      username,
      password,
      role,
      phone,
      email,
      classId,
      className,
      subject,
      position,
    } = userData

    // Validate required fields
    if (!id || !name || !nip || !username || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id },
          { username },
          // { nip }, // Will be available after Prisma regeneration
        ],
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this ID, username, or NIP already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const newUser = await prisma.user.create({
      data: {
        id,
        name,
        // nip, // Will be available after Prisma regeneration
        username,
        password: hashedPassword,
        role,
        // phone, // Will be available after Prisma regeneration
        // email, // Will be available after Prisma regeneration
        classId,
        // className, // Will be available after Prisma regeneration
        // subject, // Will be available after Prisma regeneration
        // position, // Will be available after Prisma regeneration
      },
      select: {
        id: true,
        name: true,
        // nip: true, // Will be available after Prisma regeneration
        username: true,
        role: true,
        // phone: true, // Will be available after Prisma regeneration
        // email: true, // Will be available after Prisma regeneration
        classId: true,
        // className: true, // Will be available after Prisma regeneration
        // subject: true, // Will be available after Prisma regeneration
        // position: true, // Will be available after Prisma regeneration
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      user: newUser,
    }, { status: 201 })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
