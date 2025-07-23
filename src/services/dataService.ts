/**
 * Data Service - Centralized data access layer
 * Replaces direct JSON imports with API calls
 */

import { apiClient } from '@/hooks/useApi'

// Types
export interface User {
  id: string
  name: string
  nip: string
  username: string
  role: 'TEACHER' | 'ADMIN'
  phone?: string
  email?: string
  classId?: string
  className?: string
  subject?: string
  position?: string
  createdAt: string
  updatedAt: string
}

export interface ClassInfo {
  id: string
  name: string
  grade: number
  section: string
  teacherId: string
  teacherName: string
  studentCount: number
  createdAt: string
  updatedAt: string
}

export interface Student {
  id: string
  name: string
  classId: string
  className: string
  nisn: string
  gender: 'L' | 'P'
  birthDate: string
  address: string
  parentName: string
  parentPhone: string
  enrollmentStatus: 'ACTIVE' | 'INACTIVE'
  status: 'HADIR' | 'TERLAMBAT' | 'TIDAK_HADIR' | 'IZIN'
  checkInTime?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface AttendanceRecord {
  id: string
  studentId: string
  studentName: string
  classId: string
  className: string
  date: string
  status: 'HADIR' | 'TERLAMBAT' | 'TIDAK_HADIR' | 'IZIN'
  checkInTime?: string
  notes?: string
  reason?: string
  createdAt: string
  updatedAt: string
}

// Legacy type aliases for backward compatibility
export type Teacher = User & { role: 'TEACHER' }
export type Admin = User & { role: 'ADMIN' }

// Data Service Class
class DataService {
  // Users
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await apiClient.getUsers()
      return response.users
    } catch (error) {
      console.error('Failed to fetch users:', error)
      return []
    }
  }

  async getAllTeachers(): Promise<Teacher[]> {
    const users = await this.getAllUsers()
    return users.filter(user => user.role === 'TEACHER') as Teacher[]
  }

  async getAllAdmins(): Promise<Admin[]> {
    const users = await this.getAllUsers()
    return users.filter(user => user.role === 'ADMIN') as Admin[]
  }

  async getUserById(id: string): Promise<User | undefined> {
    const users = await this.getAllUsers()
    return users.find(user => user.id === id)
  }

  async getTeacherById(id: string): Promise<Teacher | undefined> {
    const teachers = await this.getAllTeachers()
    return teachers.find(teacher => teacher.id === id)
  }

  async getAdminById(id: string): Promise<Admin | undefined> {
    const admins = await this.getAllAdmins()
    return admins.find(admin => admin.id === id)
  }

  // Classes
  async getAllClasses(): Promise<ClassInfo[]> {
    try {
      const response = await apiClient.getClasses()
      return response.classes
    } catch (error) {
      console.error('Failed to fetch classes:', error)
      return []
    }
  }

  async getClassById(id: string): Promise<ClassInfo | undefined> {
    const classes = await this.getAllClasses()
    return classes.find(cls => cls.id === id)
  }

  // Students
  async getAllStudents(): Promise<Student[]> {
    try {
      const response = await apiClient.getStudents()
      return response.students
    } catch (error) {
      console.error('Failed to fetch students:', error)
      return []
    }
  }

  async getStudentsByClass(classId: string): Promise<Student[]> {
    try {
      const response = await apiClient.getStudents(classId)
      return response.students
    } catch (error) {
      console.error('Failed to fetch students for class:', classId, error)
      return []
    }
  }

  async getStudentById(id: string): Promise<Student | undefined> {
    const students = await this.getAllStudents()
    return students.find(student => student.id === id)
  }

  // Attendance
  async getAttendanceRecords(params?: {
    classId?: string
    date?: string
    startDate?: string
    endDate?: string
    studentId?: string
  }): Promise<AttendanceRecord[]> {
    try {
      const response = await apiClient.getAttendance(params)
      return response.attendanceRecords
    } catch (error) {
      console.error('Failed to fetch attendance records:', error)
      return []
    }
  }

  async getAttendanceByDate(date: string): Promise<AttendanceRecord[]> {
    return this.getAttendanceRecords({ date })
  }

  async getAttendanceByClass(classId: string): Promise<AttendanceRecord[]> {
    return this.getAttendanceRecords({ classId })
  }

  async getAttendanceByClassAndDate(classId: string, date: string): Promise<AttendanceRecord[]> {
    return this.getAttendanceRecords({ classId, date })
  }

  async getAttendanceByClassAndDateRange(
    classId: string, 
    startDate: string, 
    endDate: string
  ): Promise<AttendanceRecord[]> {
    return this.getAttendanceRecords({ classId, startDate, endDate })
  }

  async getAttendanceByStudent(studentId: string): Promise<AttendanceRecord[]> {
    return this.getAttendanceRecords({ studentId })
  }

  // Utility functions
  async getAvailableDates(): Promise<string[]> {
    const records = await this.getAttendanceRecords()
    const dates = [...new Set(records.map(record => record.date))]
    return dates.sort()
  }

  // Authentication helpers (for backward compatibility)
  async validateUserCredentials(username: string, password: string): Promise<User | null> {
    try {
      const response = await apiClient.login(username, password)
      return response.success ? response.user : null
    } catch (error) {
      console.error('Failed to validate credentials:', error)
      return null
    }
  }

  async validateTeacherCredentials(username: string, password: string): Promise<Teacher | null> {
    const user = await this.validateUserCredentials(username, password)
    return user && user.role === 'TEACHER' ? user as Teacher : null
  }

  async validateAdminCredentials(username: string, password: string): Promise<Admin | null> {
    const user = await this.validateUserCredentials(username, password)
    return user && user.role === 'ADMIN' ? user as Admin : null
  }

  // Type guards
  isTeacher(user: User): user is Teacher {
    return user.role === 'TEACHER'
  }

  isAdmin(user: User): user is Admin {
    return user.role === 'ADMIN'
  }

  // Create/Update operations
  async createAttendanceRecord(data: Partial<AttendanceRecord>): Promise<AttendanceRecord | null> {
    try {
      const response = await apiClient.createAttendance(data)
      return response.attendanceRecord
    } catch (error) {
      console.error('Failed to create attendance record:', error)
      return null
    }
  }

  async createStudent(data: Partial<Student>): Promise<Student | null> {
    try {
      const response = await apiClient.createStudent(data)
      return response.student
    } catch (error) {
      console.error('Failed to create student:', error)
      return null
    }
  }

  async createClass(data: Partial<ClassInfo>): Promise<ClassInfo | null> {
    try {
      const response = await apiClient.createClass(data)
      return response.class
    } catch (error) {
      console.error('Failed to create class:', error)
      return null
    }
  }

  async createUser(data: Partial<User>): Promise<User | null> {
    try {
      const response = await apiClient.createUser(data)
      return response.user
    } catch (error) {
      console.error('Failed to create user:', error)
      return null
    }
  }
}

// Export singleton instance
export const dataService = new DataService()

// Export individual functions for backward compatibility
export const getAllClasses = () => dataService.getAllClasses()
export const getAllTeachers = () => dataService.getAllTeachers()
export const getAllAdmins = () => dataService.getAllAdmins()
export const getAllStudents = () => dataService.getAllStudents()
export const getClassById = (id: string) => dataService.getClassById(id)
export const getTeacherById = (id: string) => dataService.getTeacherById(id)
export const getAdminById = (id: string) => dataService.getAdminById(id)
export const getUserById = (id: string) => dataService.getUserById(id)
export const getStudentById = (id: string) => dataService.getStudentById(id)
export const getStudentsByClass = (classId: string) => dataService.getStudentsByClass(classId)
export const getAttendanceByDate = (date: string) => dataService.getAttendanceByDate(date)
export const getAttendanceByClass = (classId: string) => dataService.getAttendanceByClass(classId)
export const getAttendanceByClassAndDate = (classId: string, date: string) => 
  dataService.getAttendanceByClassAndDate(classId, date)
export const getAttendanceByClassAndDateRange = (classId: string, startDate: string, endDate: string) => 
  dataService.getAttendanceByClassAndDateRange(classId, startDate, endDate)
export const getAvailableDates = () => dataService.getAvailableDates()
export const validateUserCredentials = (username: string, password: string) => 
  dataService.validateUserCredentials(username, password)
export const validateTeacherCredentials = (username: string, password: string) => 
  dataService.validateTeacherCredentials(username, password)
export const validateAdminCredentials = (username: string, password: string) => 
  dataService.validateAdminCredentials(username, password)
export const isTeacher = (user: User) => dataService.isTeacher(user)
export const isAdmin = (user: User) => dataService.isAdmin(user)

// Export combined users for backward compatibility
export const getAllUsersData = async (): Promise<User[]> => {
  const [teachers, admins] = await Promise.all([
    dataService.getAllTeachers(),
    dataService.getAllAdmins()
  ])
  return [...teachers, ...admins]
}
