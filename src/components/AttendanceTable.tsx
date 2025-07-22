'use client';

import {useEffect, useState} from 'react';
import {useAuth} from '@/contexts/AuthContext';
import {allStudentsData, getStudentsByClass, Student} from '@/data/studentsData';
import {getAttendanceByClassAndDate} from '@/data/attendanceData';

export default function AttendanceTable() {
  const { teacher } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [tempStatus, setTempStatus] = useState<Student['status']>('Hadir');
  const [tempCheckInTime, setTempCheckInTime] = useState<string>('');

  // Filter states for public view
  const [filterClass, setFilterClass] = useState<string>('Semua');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Load students based on authentication state and merge with attendance data
  useEffect(() => {
    const loadStudentsWithAttendance = () => {
      let baseStudents: Student[] = [];

      if (teacher?.className) {
        // Teacher logged in: show only their class students
        baseStudents = getStudentsByClass(teacher.className);
      } else {
        // No teacher logged in: show all students
        baseStudents = allStudentsData;
      }

      // Get today's date for attendance lookup
      const today = new Date().toISOString().split('T')[0];

      // Merge students with today's attendance data
      const studentsWithAttendance = baseStudents.map(student => {
        // Get attendance records for this student's class and today's date
        const attendanceRecords = getAttendanceByClassAndDate(student.class, today);
        const attendanceRecord = attendanceRecords.find(record => record.studentName === student.name);

        return {
          ...student,
          status: attendanceRecord?.status || student.status,
          checkInTime: attendanceRecord?.timeIn || student.checkInTime,
          notes: attendanceRecord?.notes || student.notes
        };
      });

      setStudents(studentsWithAttendance);
    };

    loadStudentsWithAttendance();
  }, [teacher]);

  // Dapatkan styling badge status
  const getStatusBadge = (status: Student['status']) => {
    const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium';
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

  // Get unique classes for filter dropdown
  const availableClasses = ['Semua', ...Array.from(new Set(allStudentsData.map(s => s.class)))];
  const availableStatuses = ['Semua', 'Hadir', 'Tidak Hadir', 'Terlambat', 'Izin'];

  // Helper function to sort students by class then name
  const sortStudents = (studentList: Student[]) => {
    return studentList.sort((a, b) => {
      // First sort by class
      if (a.class !== b.class) {
        return a.class.localeCompare(b.class);
      }
      // Then sort by student name
      return a.name.localeCompare(b.name);
    });
  };

  // Filter and sort students
  const filteredStudents = teacher ?
    // Teacher view: just sort the students
    sortStudents([...students]) :
    // Public view: filter then sort
    (() => {
      const filtered = students.filter(student => {
        const classMatch = filterClass === 'Semua' || student.class === filterClass;
        const statusMatch = filterStatus === 'Semua' || student.status === filterStatus;
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

    // Jika status berubah ke "Hadir", otomatis set waktu masuk ke waktu sekarang
    if (newStatus === 'Hadir' && !tempCheckInTime) {
      setTempCheckInTime(getCurrentTime());
    }

    // Jika status bukan "Hadir" atau "Terlambat", hapus waktu
    if (newStatus !== 'Hadir' && newStatus !== 'Terlambat') {
      setTempCheckInTime('');
    }
  };

  // Fungsi untuk menyimpan edit
  const saveEdit = (studentId: string) => {
    setStudents(prev => prev.map(student => {
      if (student.id === studentId) {
          return {
            ...student,
            status: tempStatus,
            checkInTime: (tempStatus === 'Hadir' || tempStatus === 'Terlambat') ? tempCheckInTime : undefined,
        };
      }
      return student;
    }));
    setEditingStudent(null);
  };

  // Fungsi untuk membatalkan edit
  const cancelEdit = () => {
    setEditingStudent(null);
    setTempStatus('Hadir');
    setTempCheckInTime('');
  };

  // Hitung statistik
  const stats = {
    total: students.length,
    present: students.filter(s => s.status === 'Hadir').length,
    absent: students.filter(s => s.status === 'Tidak Hadir').length,
    late: students.filter(s => s.status === 'Terlambat').length,
    excused: students.filter(s => s.status === 'Izin').length
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
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
      {!teacher && (
        <div className="mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Filter & Cari Data Absensi</h3>

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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter berdasarkan Kelas
              </label>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {availableClasses.map(className => (
                  <option key={className} value={className}>{className}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter berdasarkan Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Absensi Siswa - {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {teacher
              ? `Menampilkan ${students.length} siswa kelas ${teacher.className}`
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
              <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Masuk</th>
              {teacher && (
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
                  {student.class}
                </td>
                <td className="py-3 px-4">
                  {teacher && editingStudent === student.id ? (
                    <select
                      value={tempStatus}
                      onChange={(e) => handleStatusChange(e.target.value as Student['status'])}
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
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300 font-mono">
                  {teacher && editingStudent === student.id ? (
                    <input
                      type="time"
                      value={tempCheckInTime}
                      onChange={(e) => setTempCheckInTime(e.target.value)}
                      disabled={tempStatus !== 'Hadir' && tempStatus !== 'Terlambat'}
                      className="text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1 disabled:bg-gray-100 dark:disabled:bg-gray-600"
                    />
                  ) : (
                    student.checkInTime || '-'
                  )}
                </td>
                {teacher && (
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
            {teacher
              ? 'Tidak ada data siswa untuk kelas ini.'
              : 'Tidak ada siswa yang sesuai dengan filter yang dipilih.'
            }
          </p>
        </div>
      )}
    </div>
  );
}
