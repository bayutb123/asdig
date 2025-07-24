'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useStudents, useAttendance, useCreateAttendance } from '@/hooks/useApi'
import { Student } from '@/services/dataService'

type AttendanceStatus = 'Hadir' | 'Tidak Hadir' | 'Terlambat' | 'Izin' | '-'

interface StudentWithAttendance extends Student {
  attendanceStatus: AttendanceStatus
  checkInTime?: string
  notes: string
}

export default function ManualAttendancePage() {
  const { user } = useAuth()

  // State management
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [attendanceStudents, setAttendanceStudents] = useState<StudentWithAttendance[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Get class ID - for teachers, use their assigned class
  const classId = user?.role === 'TEACHER' ? user.classId : null

  console.log('Manual Attendance Page:', {
    user: user ? { name: user.name, role: user.role, classId: user.classId } : null,
    selectedDate,
    classId,
    userLoaded: !!user,
    shouldCallStudentsAPI: !!(classId && user),
    shouldCallAttendanceAPI: !!(classId && selectedDate && user)
  })

  // API queries - only run if we have a classId and user is loaded
  const { data: studentsData, isLoading: studentsLoading, error: studentsError } = useStudents(
    classId && user ? classId : undefined
  )

  const { data: attendanceData, refetch: attendanceRefetch } = useAttendance({
    classId: classId || '',
    date: selectedDate,
    enabled: !!classId && !!selectedDate && !!user
  })

  const createAttendanceMutation = useCreateAttendance()

  // Extract students and attendance records with useMemo to prevent infinite re-renders
  const students = useMemo(() => studentsData?.data || [], [studentsData?.data])
  const attendanceRecords = useMemo(() => attendanceData?.attendanceRecords || [], [attendanceData?.attendanceRecords])

  console.log('API Data:', {
    studentsCount: students.length,
    attendanceRecordsCount: attendanceRecords.length,
    studentsLoading,
    studentsError: studentsError?.message
  })

  // Status mapping functions
  const mapBackendStatusToFrontend = (backendStatus: string): AttendanceStatus => {
    switch (backendStatus) {
      case 'HADIR': return 'Hadir'
      case 'TIDAK_HADIR': return 'Tidak Hadir'
      case 'TERLAMBAT': return 'Terlambat'
      case 'IZIN': return 'Izin'
      default: return '-'
    }
  }

  const mapFrontendStatusToBackend = (frontendStatus: AttendanceStatus): 'HADIR' | 'TERLAMBAT' | 'TIDAK_HADIR' | 'IZIN' => {
    switch (frontendStatus) {
      case 'Hadir': return 'HADIR'
      case 'Tidak Hadir': return 'TIDAK_HADIR'
      case 'Terlambat': return 'TERLAMBAT'
      case 'Izin': return 'IZIN'
      case '-': return 'TIDAK_HADIR'
      default: return 'TIDAK_HADIR'
    }
  }

  // Process students with attendance data using useMemo to prevent infinite re-renders
  const processedStudents = useMemo(() => {
    if (students.length === 0) {
      return []
    }

    console.log('Processing students with attendance data...')

    const studentsWithAttendance: StudentWithAttendance[] = students.map(student => {
      const existingRecord = attendanceRecords.find(record => record.studentId === student.id)

      const result: StudentWithAttendance = {
        ...student,
        enrollmentStatus: (student as Student & { enrollmentStatus?: string }).enrollmentStatus || 'ACTIVE', // Provide default if missing
        attendanceStatus: existingRecord ? mapBackendStatusToFrontend(existingRecord.status) : '-' as AttendanceStatus,
        checkInTime: existingRecord?.checkInTime || undefined,
        notes: existingRecord?.notes || ''
      }

      if (existingRecord) {
        console.log(`Student ${student.name}: Found record with status ${existingRecord.status} -> ${result.attendanceStatus}`)
      }

      return result
    })

    console.log('Processed attendance students:', {
      total: studentsWithAttendance.length,
      withAttendance: studentsWithAttendance.filter(s => s.attendanceStatus !== '-').length
    })

    return studentsWithAttendance
  }, [students, attendanceRecords])

  // Update attendanceStudents when processedStudents changes
  useEffect(() => {
    setAttendanceStudents(processedStudents)
  }, [processedStudents])

  // Handle status change
  const handleStatusChange = (studentId: string, newStatus: AttendanceStatus) => {
    setAttendanceStudents(prev => 
      prev.map(student => 
        student.id === studentId 
          ? { ...student, attendanceStatus: newStatus }
          : student
      )
    )
    setHasChanges(true)
  }

  // Handle notes change
  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendanceStudents(prev => 
      prev.map(student => 
        student.id === studentId 
          ? { ...student, notes }
          : student
      )
    )
    setHasChanges(true)
  }

  // Save attendance
  const handleSave = async () => {
    if (!classId || !selectedDate) {
      setSaveMessage('Kelas dan tanggal harus dipilih')
      return
    }

    setIsSaving(true)
    setSaveMessage('')

    try {
      // Filter students that have been marked (not "-")
      const studentsToSave = attendanceStudents.filter(student => 
        student.attendanceStatus !== '-'
      )

      console.log('Saving attendance for students:', studentsToSave.length)

      // Save each student's attendance
      const savePromises = studentsToSave.map(async (student) => {
        const attendanceData = {
          studentId: student.id,
          studentName: student.name,
          classId: classId,
          className: student.className || '',
          date: selectedDate,
          status: mapFrontendStatusToBackend(student.attendanceStatus),
          checkInTime: student.checkInTime || undefined,
          notes: student.notes || '',
          reason: student.notes || ''
        }

        console.log('Saving attendance for:', student.name, attendanceData)
        return createAttendanceMutation.mutateAsync(attendanceData)
      })

      const results = await Promise.allSettled(savePromises)
      
      const failed = results.filter(result => result.status === 'rejected')
      const succeeded = results.filter(result => result.status === 'fulfilled')

      if (failed.length > 0) {
        console.error('Some attendance records failed to save:', failed)
        setSaveMessage(`${succeeded.length} berhasil disimpan, ${failed.length} gagal`)
      } else {
        setHasChanges(false)
        setIsEditing(false)
        setSaveMessage(`Data absensi berhasil disimpan untuk ${succeeded.length} siswa!`)
        
        // Refresh attendance data
        if (attendanceRefetch) {
          attendanceRefetch()
        }
      }

      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      console.error('Error saving attendance:', error)
      setSaveMessage('Gagal menyimpan data absensi')
      setTimeout(() => setSaveMessage(''), 5000)
    } finally {
      setIsSaving(false)
    }
  }

  // Show loading state
  if (studentsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Memuat data siswa...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (studentsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
            <h3 className="font-bold">Error</h3>
            <p>{studentsError.message}</p>
          </div>
        </div>
      </div>
    )
  }

  // Show no access message for non-teachers
  if (!classId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-400 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 px-4 py-3 rounded">
            <h3 className="font-bold">Akses Terbatas</h3>
            <p>Halaman ini hanya dapat diakses oleh guru yang memiliki kelas.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Absensi Manual
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {user?.role === 'TEACHER' ? `Kelas ${user.className} - ${user.name}` : 'Input absensi siswa secara manual'}
              </p>
            </div>
            <div className="flex gap-4">
              {isEditing && hasChanges && (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <span>💾</span>
                  {isSaving ? 'Menyimpan...' : 'Simpan'}
                </button>
              )}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <span>✏️</span>
                {isEditing ? 'Batal Edit' : 'Edit Absensi'}
              </button>
              <Link
                href="/dashboard"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Kembali
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Pengaturan Absensi
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tanggal
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Class Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kelas
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white">
                {user?.className || classId}
              </div>
            </div>

            {/* Student Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Jumlah Siswa
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white">
                {attendanceStudents.length} siswa
              </div>
            </div>
          </div>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className={`mb-8 p-4 rounded-lg ${
            saveMessage.includes('berhasil') 
              ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-400 dark:border-green-800'
              : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-400 dark:border-red-800'
          }`}>
            {saveMessage}
          </div>
        )}

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Total Siswa
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {attendanceStudents.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Hadir
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {attendanceStudents.filter(s => s.attendanceStatus === 'Hadir').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Terlambat
            </h3>
            <p className="text-3xl font-bold text-yellow-600">
              {attendanceStudents.filter(s => s.attendanceStatus === 'Terlambat').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Tidak Hadir
            </h3>
            <p className="text-3xl font-bold text-red-600">
              {attendanceStudents.filter(s => s.attendanceStatus === 'Tidak Hadir').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Izin
            </h3>
            <p className="text-3xl font-bold text-purple-600">
              {attendanceStudents.filter(s => s.attendanceStatus === 'Izin').length}
            </p>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Daftar Absensi Siswa
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Nama Siswa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    NISN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status Kehadiran
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Keterangan
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {attendanceStudents.map((student, index) => (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {student.nisn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <select
                          value={student.attendanceStatus}
                          onChange={(e) => handleStatusChange(student.id, e.target.value as AttendanceStatus)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="-">-</option>
                          <option value="Hadir">Hadir</option>
                          <option value="Tidak Hadir">Tidak Hadir</option>
                          <option value="Terlambat">Terlambat</option>
                          <option value="Izin">Izin</option>
                        </select>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            student.attendanceStatus === 'Hadir' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            student.attendanceStatus === 'Tidak Hadir' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            student.attendanceStatus === 'Terlambat' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            student.attendanceStatus === 'Izin' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}>
                            {student.attendanceStatus}
                          </span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="text"
                          value={student.notes}
                          onChange={(e) => handleNotesChange(student.id, e.target.value)}
                          placeholder="Keterangan..."
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      ) : (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {student.notes || '-'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {attendanceStudents.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Tidak ada data siswa</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Belum ada siswa yang terdaftar di kelas ini.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
