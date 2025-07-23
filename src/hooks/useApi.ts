import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Types
interface User {
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

interface Class {
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

interface Student {
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
  status: 'HADIR' | 'TERLAMBAT' | 'TIDAK_HADIR' | 'IZIN'
  checkInTime?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

interface AttendanceRecord {
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

// API client with authentication
class ApiClient {
  private baseUrl = '/api'
  private token: string | null = null

  setToken(token: string | null) {
    this.token = token
    // Also try to get token from localStorage if not provided
    if (!token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth-token')
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Auth endpoints
  async login(username: string, password: string) {
    return this.request<{ success: boolean; user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  }

  async logout() {
    return this.request<{ success: boolean }>('/auth/logout', {
      method: 'POST',
    })
  }

  // Users endpoints
  async getUsers() {
    return this.request<{ success: boolean; users: User[] }>('/users')
  }

  async createUser(userData: Partial<User>) {
    return this.request<{ success: boolean; user: User }>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  // Classes endpoints
  async getClasses() {
    return this.request<{ success: boolean; classes: Class[] }>('/classes')
  }

  async createClass(classData: Partial<Class>) {
    return this.request<{ success: boolean; class: Class }>('/classes', {
      method: 'POST',
      body: JSON.stringify(classData),
    })
  }

  // Students endpoints
  async getStudents(classId?: string) {
    const query = classId ? `?classId=${classId}` : ''
    return this.request<{ success: boolean; students: Student[] }>(`/students${query}`)
  }

  async createStudent(studentData: Partial<Student>) {
    return this.request<{ success: boolean; student: Student }>('/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    })
  }

  // Attendance endpoints
  async getAttendance(params?: {
    classId?: string
    date?: string
    startDate?: string
    endDate?: string
    studentId?: string
  }) {
    const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : ''
    return this.request<{ success: boolean; attendanceRecords: AttendanceRecord[] }>(`/attendance${query}`)
  }

  async createAttendance(attendanceData: Partial<AttendanceRecord>) {
    return this.request<{ success: boolean; attendanceRecord: AttendanceRecord }>('/attendance', {
      method: 'POST',
      body: JSON.stringify(attendanceData),
    })
  }
}

export const apiClient = new ApiClient()

// Initialize API client with stored token
if (typeof window !== 'undefined') {
  const storedToken = localStorage.getItem('auth-token')
  if (storedToken) {
    apiClient.setToken(storedToken)
  }
}

// React Query hooks

// Users hooks
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.getUsers(),
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (userData: Partial<User>) => apiClient.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

// Classes hooks
export function useClasses() {
  return useQuery({
    queryKey: ['classes'],
    queryFn: () => apiClient.getClasses(),
  })
}

export function useCreateClass() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (classData: Partial<Class>) => apiClient.createClass(classData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
    },
  })
}

// Students hooks
export function useStudents(classId?: string) {
  return useQuery({
    queryKey: ['students', classId],
    queryFn: () => apiClient.getStudents(classId),
  })
}

export function useCreateStudent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (studentData: Partial<Student>) => apiClient.createStudent(studentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['classes'] })
    },
  })
}

// Attendance hooks
export function useAttendance(params?: {
  classId?: string
  date?: string
  startDate?: string
  endDate?: string
  studentId?: string
  enabled?: boolean
}) {
  return useQuery({
    queryKey: ['attendance', params],
    queryFn: () => apiClient.getAttendance(params),
    enabled: params?.enabled !== false,
  })
}

export function useCreateAttendance() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (attendanceData: Partial<AttendanceRecord>) => apiClient.createAttendance(attendanceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
    },
  })
}

// Auth hooks
export function useLogin() {
  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      apiClient.login(username, password),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: () => apiClient.logout(),
    onSuccess: () => {
      // Clear all cached data on logout
      queryClient.clear()
    },
  })
}
