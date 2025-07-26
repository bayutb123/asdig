'use client';

import {useState} from 'react';
import {useAuth} from '@/contexts/AuthContext';
import { LoadingPlaceholder } from './LayoutStable';
import { Student } from '@/services/dataService';
import { useStudents, useAttendance } from '@/hooks/useApi';
import Link from 'next/link';

interface AttendanceTableProps {
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export default function AttendanceTable({ headingLevel = 'h2' }: AttendanceTableProps) {
  const { user } = useAuth();
  const selectedDate = new Date().toISOString().split('T')[0];

  // All hooks must be called before any early returns
  // Use React Query hooks for data fetching
  const { data: studentsData, isLoading: studentsLoading } = useStudents(user?.classId);
  const { isLoading: attendanceLoading } = useAttendance({
    classId: user?.classId,
    date: selectedDate
  });

  // State for editing
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [tempStatus, setTempStatus] = useState<Student['status']>('HADIR');
  const [tempCheckInTime, setTempCheckInTime] = useState<string>('');

  // Filter states for public view
  const [filterClass, setFilterClass] = useState<string>('Semua');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // If user is not authenticated, show landing page with login button
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Sistem Absensi Digital
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Silakan login untuk melihat data absensi siswa
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/login"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
              </svg>
              Login Wali Kelas
            </Link>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Akses khusus untuk wali kelas dan admin sekolah</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const students = studentsData?.data || [];
  const loading = studentsLoading || attendanceLoading;

  // Dynamic heading components for proper hierarchy
  const FilterHeadingComponent = headingLevel;
  const TableHeadingComponent = headingLevel === 'h1' ? 'h2' :
                               headingLevel === 'h2' ? 'h3' :
                               headingLevel === 'h3' ? 'h4' :
                               headingLevel === 'h4' ? 'h5' : 'h6';

  // Data is now loaded via React Query hooks above

  // Convert status enum to display text
  const getStatusText = (status: Student['status']) => {
    switch (status) {
      case 'HADIR': return 'Hadir';
      case 'TIDAK_HADIR': return 'Tidak Hadir';
      case 'TERLAMBAT': return 'Terlambat';
      case 'IZIN': return 'Izin';
      default: return status;
    }
  };

  // Dapatkan styling badge status
  const getStatusBadge = (status: Student['status']) => {
    const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium';
    switch (status) {
      case 'HADIR':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      case 'TIDAK_HADIR':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
      case 'TERLAMBAT':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
      case 'IZIN':
        return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`;
    }
  };

  // Get unique classes for filter dropdown
  const availableClasses = ['Semua', ...Array.from(new Set(students.map(s => s.className)))];
  const availableStatuses = ['Semua', 'Hadir', 'Tidak Hadir', 'Terlambat', 'Izin'];

  // Helper function to sort students by class then name
  const sortStudents = (studentList: Student[]) => {
    return studentList.sort((a, b) => {
      // First sort by class
      if (a.className !== b.className) {
        return a.className.localeCompare(b.className);
      }
      // Then sort by student name
      return a.name.localeCompare(b.name);
    });
  };

  // Filter and sort students
  // Ensure students have enrollmentStatus field (default to ACTIVE if missing)
  const studentsWithEnrollmentStatus = students.map(student => ({
    ...student,
    enrollmentStatus: (student as Student & { enrollmentStatus?: string }).enrollmentStatus || 'ACTIVE'
  })) as Student[];

  const filteredStudents = user?.role === 'TEACHER' ?
    // Teacher view: just sort the students
    sortStudents([...studentsWithEnrollmentStatus]) :
    // Public view: filter then sort
    (() => {
      const filtered = studentsWithEnrollmentStatus.filter(student => {
        const classMatch = filterClass === 'Semua' || student.className === filterClass;
        const statusMatch = filterStatus === 'Semua' || getStatusText(student.status) === filterStatus;
        const searchMatch = searchQuery === '' ||
          student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.nisn.toLowerCase().includes(searchQuery.toLowerCase());
        return classMatch && statusMatch && searchMatch;
      });

      return sortStudents(filtered);
    })();

  // Fungsi untuk mendapatkan waktu saat ini
  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5); // Format HH:MM
  };

  // Fungsi untuk memulai edit
  const startEdit = (student: Student) => {
    setEditingStudent(student.id);
    setTempStatus(student.status);
    setTempCheckInTime(student.checkInTime || '');
  };

  // Fungsi untuk menangani perubahan status
  const handleStatusChange = (newStatus: Student['status']) => {
    setTempStatus(newStatus);

    // Jika status berubah ke "HADIR", otomatis set waktu masuk ke waktu sekarang
    if (newStatus === 'HADIR' && !tempCheckInTime) {
      setTempCheckInTime(getCurrentTime());
    }

    // Jika status bukan "HADIR" atau "TERLAMBAT", hapus waktu
    if (newStatus !== 'HADIR' && newStatus !== 'TERLAMBAT') {
      setTempCheckInTime('');
    }
  };

  // Fungsi untuk menyimpan edit
  const saveEdit = (studentId: string) => {
    // TODO: Implement API call to update attendance
    console.log('Saving attendance for student:', studentId, {
      status: tempStatus,
      checkInTime: (tempStatus === 'HADIR' || tempStatus === 'TERLAMBAT') ? tempCheckInTime : undefined,
    });
    setEditingStudent(null);
  };

  // Fungsi untuk membatalkan edit
  const cancelEdit = () => {
    setEditingStudent(null);
    setTempStatus('HADIR');
    setTempCheckInTime('');
  };

  // Hitung statistik
  const stats = {
    total: students.length,
    present: students.filter(s => s.status === 'HADIR').length,
    absent: students.filter(s => s.status === 'TIDAK_HADIR').length,
    late: students.filter(s => s.status === 'TERLAMBAT').length,
    excused: students.filter(s => s.status === 'IZIN').length
  };

  // Show loading state to prevent layout shifts
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 prevent-layout-shift" style={{ minHeight: '400px' }}>
        <LoadingPlaceholder message="Memuat data kehadiran..." height="400px" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 prevent-layout-shift">
      {/* Kartu Statistik */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
          <div className="text-sm text-blue-600 dark:text-blue-400">Total Siswa</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.present}</div>
          <div className="text-sm text-green-600 dark:text-green-400">Hadir</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.absent}</div>
          <div className="text-sm text-red-600 dark:text-red-400">Tidak Hadir</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.late}</div>
          <div className="text-sm text-yellow-600 dark:text-yellow-400">Terlambat</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.excused}</div>
          <div className="text-sm text-purple-600 dark:text-purple-400">Izin</div>
        </div>
      </div>



      {/* Filter untuk public view */}
      {user?.role !== 'TEACHER' && (
        <div className="mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <FilterHeadingComponent className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Filter & Cari Data Absensi
          </FilterHeadingComponent>

          {/* Search Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cari Siswa (Nama atau NISN)
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ketik nama siswa atau NISN..."
                className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="filter-class-select"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Filter berdasarkan Kelas
              </label>
              <select
                id="filter-class-select"
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Filter berdasarkan Kelas"
              >
                {availableClasses.map(className => (
                  <option key={className} value={className}>{className}</option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="filter-status-select"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Filter berdasarkan Status
              </label>
              <select
                id="filter-status-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Filter berdasarkan Status"
              >
                {availableStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Header Tabel */}
      <div className="mb-4 flex justify-between items-center">
        <div>
          <TableHeadingComponent className="text-xl font-semibold text-gray-900 dark:text-white">
            Absensi Siswa - {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </TableHeadingComponent>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {user?.role === 'TEACHER'
              ? `Menampilkan ${students.length} siswa kelas ${user.className}`
              : `Menampilkan ${filteredStudents.length} dari ${students.length} siswa`
            }
          </p>
        </div>
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">NISN</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Nama</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Kelas</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                Status Kehadiran
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Masuk</th>
              {user?.role === 'TEACHER' && (
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Aksi</th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr
                key={student.id}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-mono">
                  {student.nisn}
                </td>
                <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">
                  {student.name}
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                  {student.className}
                </td>
                <td className="py-3 px-4">
                  {user?.role === 'TEACHER' && editingStudent === student.id ? (
                    <div>
                      <label
                        htmlFor={`status-select-${student.id}`}
                        className="sr-only"
                      >
                        Status kehadiran untuk {student.name}
                      </label>
                      <select
                        id={`status-select-${student.id}`}
                        value={tempStatus}
                        onChange={(e) => handleStatusChange(e.target.value as Student['status'])}
                        className="text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1"
                        aria-label={`Status kehadiran untuk ${student.name}`}
                      >
                      <option value="HADIR">Hadir</option>
                      <option value="TIDAK_HADIR">Tidak Hadir</option>
                      <option value="TERLAMBAT">Terlambat</option>
                      <option value="IZIN">Izin</option>
                    </select>
                    </div>
                  ) : (
                    <span className={getStatusBadge(student.status)}>
                      {getStatusText(student.status)}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300 font-mono">
                  {user?.role === 'TEACHER' && editingStudent === student.id ? (
                    <input
                      type="time"
                      value={tempCheckInTime}
                      onChange={(e) => setTempCheckInTime(e.target.value)}
                      disabled={tempStatus !== 'HADIR' && tempStatus !== 'TERLAMBAT'}
                      className="text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1 disabled:bg-gray-100 dark:disabled:bg-gray-600"
                    />
                  ) : (
                    student.checkInTime || '-'
                  )}
                </td>
                {user?.role === 'TEACHER' && (
                  <td className="py-3 px-4">
                    {editingStudent === student.id ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => saveEdit(student.id)}
                          className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                          title="Simpan"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          title="Batal"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(student)}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            {user?.role === 'TEACHER'
              ? 'Tidak ada data siswa untuk kelas ini.'
              : 'Tidak ada siswa yang sesuai dengan filter yang dipilih.'
            }
          </p>
        </div>
      )}
    </div>
  );
}
