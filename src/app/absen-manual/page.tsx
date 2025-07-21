'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { Student, getStudentsByClass } from '@/data/studentsData';



export default function ManualAttendancePage() {
  const { teacher, logout, isLoading } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Load students for teacher's class only
  useEffect(() => {
    if (teacher?.className) {
      const classStudents = getStudentsByClass(teacher.className);
      setStudents(classStudents);
    }
  }, [teacher]);

  const handleStatusChange = (studentId: string, newStatus: Student['status']) => {
    setStudents(prev => prev.map(student => {
      if (student.id === studentId) {
        const updatedStudent = { ...student, status: newStatus };

        // Auto-set times based on status
        if (newStatus === 'Hadir') {
          // Selalu set waktu masuk ke waktu sekarang ketika status berubah ke "Hadir"
          updatedStudent.checkInTime = getCurrentTime();
        } else if (newStatus === 'Terlambat') {
          updatedStudent.checkInTime = updatedStudent.checkInTime || getCurrentTime();
        } else {
          // Clear times for absent/excused
          delete updatedStudent.checkInTime;
        }

        return updatedStudent;
      }
      return student;
    }));
    setHasChanges(true);
  };

  const handleTimeChange = (studentId: string, value: string) => {
    setStudents(prev => prev.map(student => {
      if (student.id === studentId) {
        return { ...student, checkInTime: value };
      }
      return student;
    }));
    setHasChanges(true);
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setStudents(prev => prev.map(student => {
      if (student.id === studentId) {
        return { ...student, notes };
      }
      return student;
    }));
    setHasChanges(true);
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In real app, send data to backend
    console.log('Saving attendance data:', students);
    
    setHasChanges(false);
    setIsEditing(false);
    setIsSaving(false);
    setSaveMessage('Data absensi berhasil disimpan!');
    
    // Clear message after 3 seconds
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleBulkAction = (action: 'markAllPresent' | 'markAllAbsent' | 'resetAll') => {
    setStudents(prev => prev.map(student => {
      switch (action) {
        case 'markAllPresent':
          return {
            ...student,
            status: 'Hadir',
            checkInTime: student.checkInTime || getCurrentTime()
          };
        case 'markAllAbsent':
          return {
            ...student,
            status: 'Tidak Hadir',
            checkInTime: undefined
          };
        case 'resetAll':
          return {
            ...student,
            status: 'Tidak Hadir',
            checkInTime: undefined,
            notes: undefined
          };
        default:
          return student;
      }
    }));
    setHasChanges(true);
  };

  const getStatusBadge = (status: Student['status']) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'Hadir':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      case 'Tidak Hadir':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
      case 'Terlambat':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
      case 'Izin':
        return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`;
    }
  };

  const stats = {
    total: students.length,
    present: students.filter(s => s.status === 'Hadir').length,
    absent: students.filter(s => s.status === 'Tidak Hadir').length,
    late: students.filter(s => s.status === 'Terlambat').length,
    excused: students.filter(s => s.status === 'Izin').length
  };

  // Show loading if auth is still loading or teacher data is not available
  if (isLoading || !teacher) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Memuat data absensi...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Link 
                  href="/dashboard"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Absen Manual - SD
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {teacher ? `Kelas ${teacher.className} - ${teacher.name}` : 'Loading...'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                />
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Edit Absensi
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setHasChanges(false);
                      }}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={!hasChanges || isSaving}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      {isSaving ? 'Menyimpan...' : 'Simpan'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Save Message */}
          {saveMessage && (
            <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-green-600 dark:text-green-400">{saveMessage}</p>
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Total Siswa</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.present}</div>
              <div className="text-sm text-green-600 dark:text-green-400">Hadir</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.absent}</div>
              <div className="text-sm text-red-600 dark:text-red-400">Tidak Hadir</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.late}</div>
              <div className="text-sm text-yellow-600 dark:text-yellow-400">Terlambat</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.excused}</div>
              <div className="text-sm text-purple-600 dark:text-purple-400">Izin</div>
            </div>
          </div>

          {/* Bulk Actions */}
          {isEditing && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Aksi Massal</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleBulkAction('markAllPresent')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Tandai Semua Hadir
                </button>
                <button
                  onClick={() => handleBulkAction('markAllAbsent')}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Tandai Semua Tidak Hadir
                </button>
                <button
                  onClick={() => handleBulkAction('resetAll')}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Reset Semua
                </button>
              </div>
            </div>
          )}

          {/* Attendance Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      NISN
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Nama Siswa
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Jam Masuk
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Keterangan
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {students.map((student, index) => (
                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-gray-100">
                        {student.studentId}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {student.name}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <select
                            value={student.status}
                            onChange={(e) => handleStatusChange(student.id, e.target.value as Student['status'])}
                            className="text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1"
                          >
                            <option value="Hadir">Hadir</option>
                            <option value="Tidak Hadir">Tidak Hadir</option>
                            <option value="Terlambat">Terlambat</option>
                            <option value="Izin">Izin</option>
                          </select>
                        ) : (
                          <span className={getStatusBadge(student.status)}>
                            {student.status}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {isEditing && (student.status === 'Hadir' || student.status === 'Terlambat') ? (
                          <input
                            type="time"
                            value={student.checkInTime || ''}
                            onChange={(e) => handleTimeChange(student.id, e.target.value)}
                            className="text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1"
                          />
                        ) : (
                          student.checkInTime || '-'
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {isEditing ? (
                          <input
                            type="text"
                            value={student.notes || ''}
                            onChange={(e) => handleNotesChange(student.id, e.target.value)}
                            placeholder="Keterangan..."
                            className="text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1 w-full"
                          />
                        ) : (
                          student.notes || '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
