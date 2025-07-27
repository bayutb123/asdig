import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/students - Get students
export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role')
    const userClassId = request.headers.get('x-user-class-id')

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')

    // Debug logging
    console.log('Students API Debug:', {
      userRole,
      userClassId,
      classId,
      url: request.url
    });

    // Role-based access control
    if (userRole === 'TEACHER') {
      // Teachers can only access students from their own class
      if (!userClassId) {
        return NextResponse.json(
          { success: false, message: 'Teacher class not assigned' },
          { status: 403 }
        )
      }

      // If classId is specified, it must match teacher's class (case-insensitive)
      if (classId && classId.toLowerCase() !== userClassId.toLowerCase()) {
        return NextResponse.json(
          { success: false, message: 'Access denied - can only view your own class' },
          { status: 403 }
        )
      }
    } else if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Admin or teacher access required' },
        { status: 403 }
      )
    }

    // Build where clause based on role and filters
    let whereClause: Record<string, unknown> = {}

    if (userRole === 'TEACHER') {
      // Teachers can only see their own class students (case-insensitive)
      const targetClassId = classId || userClassId
      if (targetClassId) {
        whereClause = {
          classId: {
            in: [targetClassId, targetClassId.toLowerCase(), targetClassId.toUpperCase()]
          }
        }
      }
    } else if (classId) {
      // Admins can filter by any class (case-insensitive)
      whereClause = {
        classId: {
          in: [classId, classId.toLowerCase(), classId.toUpperCase()]
        }
      }
    }

    const students = await prisma.student.findMany({
      where: whereClause,
      include: {
        class: {
          select: {
            id: true,
            name: true,
            // grade: true, // Will be available after Prisma regeneration
            // section: true, // Will be available after Prisma regeneration
            // teacherName: true, // Will be available after Prisma regeneration
          },
        },
      },
      orderBy: [
        { class: { name: 'asc' } },
        { name: 'asc' },
      ],
    })

    // Transform data to include className
    const transformedStudents = students.map(student => ({
      ...student,
      className: student.class?.name || 'Tidak ada kelas',
      class: undefined // Remove the nested class object
    }))

    console.log('Students API - Raw students from DB:', {
      count: students.length,
      firstStudent: students[0] ? {
        id: students[0].id,
        name: students[0].name,
        classId: students[0].classId
      } : null
    });

    console.log('Students API - Transformed students:', {
      count: transformedStudents.length,
      firstStudent: transformedStudents[0] ? {
        id: transformedStudents[0].id,
        name: transformedStudents[0].name,
        classId: transformedStudents[0].classId
      } : null
    });

    const response = {
      success: true,
      data: transformedStudents,
    };

    console.log('Students API Response:', response);

    return NextResponse.json(response)
  } catch (error) {
    console.error('Get students error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
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
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      nisn,
      classId,
      gender,
      birthDate,
      address,
      parentName,
      parentPhone,
      enrollmentStatus = 'ACTIVE'
    } = body

    // Validate required fields
    if (!name || !nisn || !classId || !gender || !birthDate || !address || !parentName || !parentPhone) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if NISN already exists
    const existingStudent = await prisma.student.findUnique({
      where: { nisn }
    })

    if (existingStudent) {
      return NextResponse.json(
        { success: false, message: 'NISN sudah terdaftar' },
        { status: 400 }
      )
    }

    // Check if class exists
    const classExists = await prisma.class.findUnique({
      where: { id: classId }
    })

    if (!classExists) {
      return NextResponse.json(
        { success: false, message: 'Kelas tidak ditemukan' },
        { status: 400 }
      )
    }

    // Generate unique ID
    const studentId = `student-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Create student
    const student = await prisma.student.create({
      data: {
        id: studentId,
        name,
        nisn,
        classId,
        // className: classExists.name, // Will be available after Prisma regeneration
        gender,
        birthDate: birthDate, // Keep as string, don't convert to Date
        address,
        parentName,
        parentPhone,
        // enrollmentStatus: enrollmentStatus // Will be available after Prisma regeneration
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            // grade: true, // Will be available after Prisma regeneration
            // section: true, // Will be available after Prisma regeneration
            // teacherName: true, // Will be available after Prisma regeneration
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
      data: {
        ...student,
        className: student.class?.name || 'Tidak ada kelas',
        class: undefined // Remove the nested class object
      }
    })
  } catch (error) {
    console.error('Create student error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
