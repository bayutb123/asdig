import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/students/[id] - Get single student
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userRole = request.headers.get('x-user-role')

    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params
    const student = await prisma.student.findUnique({
      where: { id },
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

    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...student,
        className: student.class?.name || 'Tidak ada kelas',
        class: undefined // Remove the nested class object
      }
    })
  } catch (error) {
    console.error('Get student error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/students/[id] - Update student
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userRole = request.headers.get('x-user-role')

    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params

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
      enrollmentStatus
    } = body

    // Validate required fields
    if (!name || !nisn || !classId || !gender || !birthDate || !address || !parentName || !parentPhone) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id }
    })

    if (!existingStudent) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      )
    }

    // Check if NISN already exists for another student
    const nisnExists = await prisma.student.findFirst({
      where: {
        nisn,
        id: { not: id }
      }
    })

    if (nisnExists) {
      return NextResponse.json(
        { success: false, message: 'NISN sudah terdaftar untuk siswa lain' },
        { status: 400 }
      )
    }

    // Check if new class exists
    const newClass = await prisma.class.findUnique({
      where: { id: classId }
    })

    if (!newClass) {
      return NextResponse.json(
        { success: false, message: 'Kelas tidak ditemukan' },
        { status: 400 }
      )
    }

    // Update student counts if class changed
    if (existingStudent.classId !== classId) {
      // Decrease count from old class
      await prisma.class.update({
        where: { id: existingStudent.classId },
        data: {
          studentCount: {
            decrement: 1,
          },
        },
      })

      // Increase count for new class
      await prisma.class.update({
        where: { id: classId },
        data: {
          studentCount: {
            increment: 1,
          },
        },
      })
    }

    // Update student
    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        name,
        nisn,
        classId,
        // className: newClass.name, // Will be available after Prisma regeneration
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

    return NextResponse.json({
      success: true,
      data: {
        ...updatedStudent,
        className: updatedStudent.class?.name || 'Tidak ada kelas',
        class: undefined // Remove the nested class object
      }
    })
  } catch (error) {
    console.error('Update student error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/students/[id] - Delete student
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userRole = request.headers.get('x-user-role')

    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id }
    })

    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      )
    }

    // Delete all attendance records for this student first
    await prisma.attendanceRecord.deleteMany({
      where: { studentId: id }
    })

    // Delete student
    await prisma.student.delete({
      where: { id }
    })

    // Update class student count
    await prisma.class.update({
      where: { id: student.classId },
      data: {
        studentCount: {
          decrement: 1,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Student deleted successfully'
    })
  } catch (error) {
    console.error('Delete student error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
