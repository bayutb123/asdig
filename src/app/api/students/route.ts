import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/students - Get students
export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role')
    const userClassId = request.headers.get('x-user-class-id')
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')

    let students

    if (userRole === 'ADMIN') {
      // Admins can see all students or filter by class
      const whereClause = classId ? { classId } : {}
      
      students = await prisma.student.findMany({
        where: whereClause,
        include: {
          class: {
            select: {
              id: true,
              name: true,
              grade: true,
              section: true,
              teacherName: true,
            },
          },
        },
        orderBy: [
          { className: 'asc' },
          { name: 'asc' },
        ],
      })
    } else if (userRole === 'TEACHER' && userClassId) {
      // Teachers can only see students from their class
      const targetClassId = classId || userClassId
      
      if (classId && classId !== userClassId) {
        return NextResponse.json(
          { error: 'Access denied - can only view your own class' },
          { status: 403 }
        )
      }

      students = await prisma.student.findMany({
        where: {
          classId: targetClassId,
        },
        include: {
          class: {
            select: {
              id: true,
              name: true,
              grade: true,
              section: true,
              teacherName: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      })
    } else {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      students,
    })
  } catch (error) {
    console.error('Get students error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/students - Create new student (admins only)
export async function POST(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role')
    
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const studentData = await request.json()
    const {
      id,
      name,
      classId,
      className,
      nisn,
      gender,
      birthDate,
      address,
      parentName,
      parentPhone,
      status = 'HADIR',
      checkInTime,
      notes,
    } = studentData

    // Validate required fields
    if (!id || !name || !classId || !className || !nisn || !gender || !birthDate || !address || !parentName || !parentPhone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if student already exists
    const existingStudent = await prisma.student.findFirst({
      where: {
        OR: [
          { id },
          { nisn },
        ],
      },
    })

    if (existingStudent) {
      return NextResponse.json(
        { error: 'Student with this ID or NISN already exists' },
        { status: 409 }
      )
    }

    // Verify class exists
    const classExists = await prisma.class.findUnique({
      where: { id: classId },
    })

    if (!classExists) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      )
    }

    // Create student
    const newStudent = await prisma.student.create({
      data: {
        id,
        name,
        classId,
        className,
        nisn,
        gender,
        birthDate,
        address,
        parentName,
        parentPhone,
        status,
        checkInTime,
        notes,
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
            section: true,
            teacherName: true,
          },
        },
      },
    })

    // Update class student count
    await prisma.class.update({
      where: { id: classId },
      data: {
        studentCount: {
          increment: 1,
        },
      },
    })

    return NextResponse.json({
      success: true,
      student: newStudent,
    }, { status: 201 })
  } catch (error) {
    console.error('Create student error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
