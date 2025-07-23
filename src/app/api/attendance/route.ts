import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/attendance - Get attendance records
export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role')
    const userClassId = request.headers.get('x-user-class-id')
    const { searchParams } = new URL(request.url)
    
    const classId = searchParams.get('classId')
    const date = searchParams.get('date')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const studentId = searchParams.get('studentId')

    const whereClause: Record<string, unknown> = {}

    // Build where clause based on user role and filters
    if (userRole === 'TEACHER' && userClassId) {
      // Teachers can only see attendance for their class
      const targetClassId = classId || userClassId

      // Case-insensitive comparison for class IDs
      if (classId && classId.toLowerCase() !== userClassId.toLowerCase()) {
        return NextResponse.json(
          { error: 'Access denied - can only view your own class' },
          { status: 403 }
        )
      }

      // Use case-insensitive search for classId (SQLite compatible)
      whereClause.classId = {
        in: [targetClassId, targetClassId.toLowerCase(), targetClassId.toUpperCase()]
      }
    } else if (userRole === 'ADMIN') {
      // Admins can see all attendance or filter by class
      if (classId) {
        // Use case-insensitive search for classId (SQLite compatible)
        whereClause.classId = {
          in: [classId, classId.toLowerCase(), classId.toUpperCase()]
        }
      }
    } else {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Add date filters
    if (date) {
      whereClause.date = date
    } else if (startDate && endDate) {
      whereClause.date = {
        gte: startDate,
        lte: endDate,
      }
    } else if (startDate) {
      whereClause.date = {
        gte: startDate,
      }
    } else if (endDate) {
      whereClause.date = {
        lte: endDate,
      }
    }

    // Add student filter
    if (studentId) {
      whereClause.studentId = studentId
    }

    // Debug logging
    console.log('Attendance API Query:', {
      whereClause,
      classId,
      date,
      startDate,
      endDate,
      studentId
    });

    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            nisn: true,
            gender: true,
            className: true,
          },
        },
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
        { date: 'desc' },
        { className: 'asc' },
        { studentName: 'asc' },
      ],
    })

    console.log('Attendance API Results:', {
      recordCount: attendanceRecords.length,
      records: attendanceRecords.slice(0, 2) // Show first 2 records for debugging
    });

    // If no records found, let's check if there are any records at all
    if (attendanceRecords.length === 0) {
      const totalRecords = await prisma.attendanceRecord.count();
      const sampleRecords = await prisma.attendanceRecord.findMany({
        take: 3,
        select: {
          id: true,
          classId: true,
          date: true,
          studentName: true,
          status: true
        }
      });
      console.log('Debug - Total attendance records in DB:', totalRecords);
      console.log('Debug - Sample records:', sampleRecords);
    }

    return NextResponse.json({
      success: true,
      attendanceRecords,
    })
  } catch (error) {
    console.error('Get attendance error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/attendance - Create attendance record
export async function POST(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role')
    const userClassId = request.headers.get('x-user-class-id')
    
    const attendanceData = await request.json()
    const {
      studentId,
      studentName,
      classId,
      className,
      date,
      status,
      checkInTime,
      notes,
      reason,
    } = attendanceData

    // Validate required fields
    if (!studentId || !studentName || !classId || !className || !date || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check permissions
    if (userRole === 'TEACHER' && userClassId !== classId) {
      return NextResponse.json(
        { error: 'Access denied - can only create attendance for your own class' },
        { status: 403 }
      )
    }

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Check if attendance record already exists for this student and date
    const existingRecord = await prisma.attendanceRecord.findUnique({
      where: {
        studentId_date: {
          studentId,
          date,
        },
      },
    })

    if (existingRecord) {
      // Update existing record
      const updatedRecord = await prisma.attendanceRecord.update({
        where: {
          studentId_date: {
            studentId,
            date,
          },
        },
        data: {
          status,
          checkInTime,
          notes,
          reason,
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              nisn: true,
              gender: true,
              className: true,
            },
          },
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

      return NextResponse.json({
        success: true,
        attendanceRecord: updatedRecord,
        message: 'Attendance record updated',
      })
    } else {
      // Create new record
      const newRecord = await prisma.attendanceRecord.create({
        data: {
          studentId,
          studentName,
          classId,
          className,
          date,
          status,
          checkInTime,
          notes,
          reason,
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              nisn: true,
              gender: true,
              className: true,
            },
          },
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

      return NextResponse.json({
        success: true,
        attendanceRecord: newRecord,
        message: 'Attendance record created',
      }, { status: 201 })
    }
  } catch (error) {
    console.error('Create/Update attendance error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
