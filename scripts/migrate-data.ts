import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'
import classesDataJSON from '../src/data/classesData.json'
import studentsDataJSON from '../src/data/studentsData.json'
import attendanceDataJSON from '../src/data/attendanceData.json'

const prisma = new PrismaClient()

interface ClassesDataStructure {
  metadata: {
    totalClasses: number
    totalTeachers: number
    totalAdmins: number
    generatedAt: string
  }
  classes: Array<{
    id: string
    name: string
    grade: number
    section: string
    teacherId: string
    teacherName: string
    studentCount: number
  }>
  teachers: Array<{
    id: string
    name: string
    nip: string
    username: string
    password: string
    classId: string
    className: string
    subject?: string
    phone?: string
    email?: string
    role: 'teacher'
  }>
  admins: Array<{
    id: string
    name: string
    nip: string
    username: string
    password: string
    position: string
    phone?: string
    email?: string
    role: 'admin'
  }>
}

interface StudentsDataStructure {
  metadata: {
    totalStudents: number
    totalClasses: number
    studentsPerClass: number
    generatedAt: string
  }
  students: Array<{
    id: string
    name: string
    class: string
    nisn: string
    gender: 'L' | 'P'
    birthDate: string
    address: string
    parentName: string
    parentPhone: string
    status: 'Hadir' | 'Terlambat' | 'Tidak Hadir' | 'Izin'
    checkInTime?: string
    notes?: string
  }>
}

interface AttendanceDataStructure {
  metadata: {
    totalRecords: number
    dateRange: {
      start: string
      end: string
    }
    generatedAt: string
    schoolDays: number
    classes: string[]
    studentsPerClass: number
    totalStudents: number
    attendancePatterns: {
      present: number
      late: number
      absent: number
      excused: number
    }
  }
  attendanceRecords: Array<{
    id: string
    studentId: string
    studentName: string
    className: string
    date: string
    status: 'Hadir' | 'Terlambat' | 'Tidak Hadir' | 'Izin'
    checkInTime?: string
    notes?: string
    reason?: string
  }>
  students: Array<{
    id: string
    name: string
    className: string
    nisn: string
    gender: string
  }>
  teachers: {
    [className: string]: string
  }
  excuseReasons: string[]
}

async function migrateData() {
  console.log('🚀 Starting data migration...')

  try {
    // Load JSON data
    const classesData = classesDataJSON as ClassesDataStructure
    const studentsData = studentsDataJSON as StudentsDataStructure
    const attendanceData = attendanceDataJSON as unknown as AttendanceDataStructure

    console.log('📊 Data loaded:')
    console.log(`- Classes: ${classesData.classes.length}`)
    console.log(`- Teachers: ${classesData.teachers.length}`)
    console.log(`- Admins: ${classesData.admins.length}`)
    console.log(`- Students: ${studentsData.students.length}`)
    console.log(`- Attendance Records: ${attendanceData.attendanceRecords.length}`)

    // Clear existing data
    console.log('🧹 Clearing existing data...')
    await prisma.attendanceRecord.deleteMany()
    await prisma.student.deleteMany()
    await prisma.class.deleteMany()
    await prisma.user.deleteMany()

    // Migrate Classes
    console.log('📚 Migrating classes...')
    for (const classItem of classesData.classes) {
      await prisma.class.create({
        data: {
          id: classItem.id,
          name: classItem.name,
          grade: classItem.grade,
          section: classItem.section,
          teacherId: classItem.teacherId,
          teacherName: classItem.teacherName,
          studentCount: classItem.studentCount,
        },
      })
    }

    // Migrate Teachers
    console.log('👨‍🏫 Migrating teachers...')
    for (const teacher of classesData.teachers) {
      const hashedPassword = await hashPassword(teacher.password)
      await prisma.user.create({
        data: {
          id: teacher.id,
          name: teacher.name,
          nip: teacher.nip,
          username: teacher.username,
          password: hashedPassword,
          role: 'TEACHER',
          classId: teacher.classId,
          className: teacher.className,
          subject: teacher.subject,
          phone: teacher.phone,
          email: teacher.email,
        },
      })
    }

    // Migrate Admins
    console.log('👨‍💼 Migrating admins...')
    for (const admin of classesData.admins) {
      const hashedPassword = await hashPassword(admin.password)
      await prisma.user.create({
        data: {
          id: admin.id,
          name: admin.name,
          nip: admin.nip,
          username: admin.username,
          password: hashedPassword,
          role: 'ADMIN',
          position: admin.position,
          phone: admin.phone,
          email: admin.email,
        },
      })
    }

    // Migrate Students
    console.log('👨‍🎓 Migrating students...')
    for (const student of studentsData.students) {
      // Map status to enum values
      let status: 'HADIR' | 'TERLAMBAT' | 'TIDAK_HADIR' | 'IZIN'
      switch (student.status) {
        case 'Hadir':
          status = 'HADIR'
          break
        case 'Terlambat':
          status = 'TERLAMBAT'
          break
        case 'Tidak Hadir':
          status = 'TIDAK_HADIR'
          break
        case 'Izin':
          status = 'IZIN'
          break
        default:
          status = 'HADIR'
      }

      const classId = student.class.toLowerCase().replace(/\s+/g, '') // Convert "1A" to "1a"

      await prisma.student.create({
        data: {
          id: student.id,
          name: student.name,
          classId: classId,
          className: student.class,
          nisn: student.nisn,
          gender: student.gender,
          birthDate: student.birthDate,
          address: student.address,
          parentName: student.parentName,
          parentPhone: student.parentPhone,
          status: status,
          checkInTime: student.checkInTime,
          notes: student.notes,
        },
      })
    }

    // Migrate Attendance Records
    console.log('📋 Migrating attendance records...')
    for (const record of attendanceData.attendanceRecords) {
      // Map status to enum values
      let status: 'HADIR' | 'TERLAMBAT' | 'TIDAK_HADIR' | 'IZIN'
      switch (record.status) {
        case 'Hadir':
          status = 'HADIR'
          break
        case 'Terlambat':
          status = 'TERLAMBAT'
          break
        case 'Tidak Hadir':
          status = 'TIDAK_HADIR'
          break
        case 'Izin':
          status = 'IZIN'
          break
        default:
          status = 'HADIR'
      }

      // Convert className to classId format
      const classId = record.className.toLowerCase().replace(/\s+/g, '') // Convert "1A" to "1a"

      try {
        await prisma.attendanceRecord.create({
          data: {
            id: record.id,
            studentId: record.studentId,
            studentName: record.studentName,
            classId: classId,
            className: record.className,
            date: record.date,
            status: status,
            checkInTime: record.checkInTime,
            notes: record.notes,
            reason: record.reason,
          },
        })
      } catch (error) {
        console.warn(`⚠️ Skipping attendance record ${record.id} - student or class not found`)
        // eslint-disable-next-line no-continue
        continue
      }
    }

    console.log('✅ Data migration completed successfully!')
    console.log('📊 Final counts:')
    
    const counts = await Promise.all([
      prisma.user.count(),
      prisma.class.count(),
      prisma.student.count(),
      prisma.attendanceRecord.count(),
    ])

    console.log(`- Users: ${counts[0]}`)
    console.log(`- Classes: ${counts[1]}`)
    console.log(`- Students: ${counts[2]}`)
    console.log(`- Attendance Records: ${counts[3]}`)

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration if this file is executed directly
/* eslint-disable @typescript-eslint/no-var-requires */
if (require.main === module) {
  migrateData()
    .then(() => {
      console.log('🎉 Migration completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error)
      process.exit(1)
    })
}

export default migrateData
