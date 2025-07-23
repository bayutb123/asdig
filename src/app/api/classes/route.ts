import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/classes - Get all classes
export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role')
    const userClassId = request.headers.get('x-user-class-id')

    let classes

    if (userRole === 'ADMIN') {
      // Admins can see all classes
      classes = await prisma.class.findMany({
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              nip: true,
              username: true,
              phone: true,
              email: true,
            },
          },
          _count: {
            select: {
              students: true,
            },
          },
        },
        orderBy: [
          { grade: 'asc' },
          { section: 'asc' },
        ],
      })
    } else if (userRole === 'TEACHER' && userClassId) {
      // Teachers can only see their own class
      classes = await prisma.class.findMany({
        where: {
          id: userClassId,
        },
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              nip: true,
              username: true,
              phone: true,
              email: true,
            },
          },
          _count: {
            select: {
              students: true,
            },
          },
        },
      })
    } else {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Update student count based on actual count
    const classesWithUpdatedCount = classes.map(cls => ({
      ...cls,
      studentCount: cls._count.students,
    }))

    return NextResponse.json({
      success: true,
      classes: classesWithUpdatedCount,
    })
  } catch (error) {
    console.error('Get classes error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/classes - Create new class (admins only)
export async function POST(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role')
    
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const classData = await request.json()
    const {
      id,
      name,
      grade,
      section,
      teacherId,
      teacherName,
    } = classData

    // Validate required fields
    if (!id || !name || !grade || !section || !teacherId || !teacherName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if class already exists
    const existingClass = await prisma.class.findFirst({
      where: {
        OR: [
          { id },
          { name },
          { teacherId },
        ],
      },
    })

    if (existingClass) {
      return NextResponse.json(
        { error: 'Class with this ID, name, or teacher already exists' },
        { status: 409 }
      )
    }

    // Create class
    const newClass = await prisma.class.create({
      data: {
        id,
        name,
        grade,
        section,
        teacherId,
        teacherName,
        studentCount: 0,
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            nip: true,
            username: true,
            phone: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      class: newClass,
    }, { status: 201 })
  } catch (error) {
    console.error('Create class error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
