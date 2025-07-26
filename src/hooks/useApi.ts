import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ApiError } from '@/types/api'

// Custom API Error class
class ApiClientError extends Error {
  public status: number
  public data: ApiError

  constructor(status: number, data: ApiError) {
    super(data.error || `HTTP ${status}`)
    this.name = 'ApiClientError'
    this.status = status
    this.data = data
  }
}

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
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        error: 'Network error'
      }))

      const apiError = new ApiClientError(response.status, errorData)
      // Add response property for backward compatibility
      Object.defineProperty(apiError, 'response', {
        value: { status: response.status, data: errorData },
        enumerable: false
      })

      throw apiError
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

  async deleteClass(classId: string) {
    return this.request<{ success: boolean; message: string }>(`/classes?id=${classId}`, {
      method: 'DELETE',
    })
  }

  // Students endpoints
  async getStudents(classId?: string) {
    const query = classId ? `?classId=${classId}` : ''
    return this.request<{ success: boolean; data: Student[] }>(`/students${query}`)
  }

  async createStudent(studentData: Partial<Student>) {
    return this.request<{ success: boolean; data: Student }>('/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    })
  }

  async updateStudent(studentId: string, studentData: Partial<Student>) {
    return this.request<{ success: boolean; student: Student }>(`/students/${studentId}`, {
      method: 'PUT',
      body: JSON.stringify(studentData),
    })
  }

  async deleteStudent(studentId: string) {
    return this.request<{ success: boolean; message: string }>(`/students/${studentId}`, {
      method: 'DELETE',
    })
  }

  // Attendance endpoints
  async getAttendance(params?: {
    classId?: string
    date?: string
    startDate?: string
    endDate?: string
    studentId?: string
    enabled?: boolean
  }) {
    if (!params) {
      return this.request<{ success: boolean; attendanceRecords: AttendanceRecord[] }>('/attendance')
    }

    // Filter out the 'enabled' parameter as it's only for React Query
    const { enabled, ...apiParams } = params
    const query = Object.keys(apiParams).length > 0
      ? '?' + new URLSearchParams(apiParams as Record<string, string>).toString()
      : ''
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
export function useUsers(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.getUsers(),
    enabled: options?.enabled ?? true,
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

export function useDeleteClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (classId: string) => apiClient.deleteClass(classId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
    },
  })
}

// Students hooks
export function useStudents(classId?: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['students', classId],
    queryFn: () => apiClient.getStudents(classId),
    enabled: enabled,
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

export function useUpdateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ studentId, studentData }: { studentId: string; studentData: Partial<Student> }) =>
      apiClient.updateStudent(studentId, studentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['classes'] })
    },
  })
}

export function useDeleteStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (studentId: string) => apiClient.deleteStudent(studentId),
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
    queryKey: ['attendance', params?.classId, params?.date, params?.startDate, params?.endDate, params?.studentId],
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

// Generic API hook for direct HTTP calls
export function useApi() {
  const makeRequest = async (endpoint: string, options: RequestInit = {}) => {
    const url = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    // Add auth headers if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    // Add user role and class headers for compatibility with existing API
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        headers['x-user-role'] = user.role
        if (user.classId) {
          headers['x-user-class-id'] = user.classId
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        success: false,
        message: 'Network error'
      }))
      throw new Error(errorData.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  return {
    get: (endpoint: string) => makeRequest(endpoint, { method: 'GET' }),
    post: (endpoint: string, data?: unknown) => makeRequest(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
    put: (endpoint: string, data?: unknown) => makeRequest(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
    del: (endpoint: string) => makeRequest(endpoint, { method: 'DELETE' }),
  }
}
