'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getAllClasses } from '@/data/classesData';
import { allStudentsData, getStudentsByClass } from '@/data/studentsData';

interface AttendanceReport {
  date: string;
  className: string;
  totalStudents: number;
  present: number;
  late: number;
  absent: number;
  excused: number;
  attendanceRate: number;
}

export default function LaporanAbsenPage() {
  const { user, teacher, admin, hasAdminAccess, hasTeacherAccess } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('today');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reports, setReports] = useState<AttendanceReport[]>([]);

  // Check authentication
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Set default class for teachers
    if (hasTeacherAccess && teacher?.className) {
      setSelectedClass(teacher.className);
    }
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
    
    setLoading(false);
  }, [user, teacher, hasTeacherAccess, router]);

  // Generate attendance reports
  useEffect(() => {
    if (!loading) {
      generateReports();
    }
  }, [selectedClass, selectedDateRange, startDate, endDate, loading]);

  const generateReports = () => {
    const classes = getAllClasses();
    
    // Filter classes based on selection and user role
    let targetClasses = classes;
    if (hasTeacherAccess && teacher?.className) {
      targetClasses = classes.filter(cls => cls.name === teacher.className);
    } else if (selectedClass !== 'all') {
      targetClasses = classes.filter(cls => cls.name === selectedClass);
    }

    // Generate reports for each class
    const generatedReports: AttendanceReport[] = targetClasses.map(cls => {
      const classStudents = getStudentsByClass(cls.name);
      const totalStudents = classStudents.length;
      
      // Count attendance status
      const present = classStudents.filter(s => s.status === 'Hadir').length;
      const late = classStudents.filter(s => s.status === 'Terlambat').length;
      const absent = classStudents.filter(s => s.status === 'Tidak Hadir').length;
      const excused = classStudents.filter(s => s.status === 'Izin').length;
      
      const attendanceRate = totalStudents > 0 ? ((present + late) / totalStudents) * 100 : 0;

      return {
        date: '2025-01-21', // Current date from sample data
        className: cls.name,
        totalStudents,
        present,
        late,
        absent,
        excused,
        attendanceRate: Math.round(attendanceRate * 100) / 100
      };
    });

    setReports(generatedReports);
  };

  const exportToCSV = () => {
    const headers = ['Tanggal', 'Kelas', 'Total Siswa', 'Hadir', 'Terlambat', 'Tidak Hadir', 'Izin', 'Tingkat Kehadiran (%)'];
    const csvContent = [
      headers.join(','),
      ...reports.map(report => [
        report.date,
        report.className,
        report.totalStudents,
        report.present,
        report.late,
        report.absent,
        report.excused,
        report.attendanceRate
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `laporan-absen-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Laporan Absensi
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {admin ? `Admin - ${admin.name}` : teacher ? `Kelas ${teacher.className} - ${teacher.name}` : 'Loading...'}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={exportToCSV}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <span>📊</span>
                Export CSV
              </button>
              <button
                onClick={printReport}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <span>🖨️</span>
                Print
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
            Filter Laporan
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Class Filter - Only show for admin */}
            {hasAdminAccess && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kelas
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">Semua Kelas</option>
                  {getAllClasses().map(cls => (
                    <option key={cls.id} value={cls.name}>{cls.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Periode
              </label>
              <select
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="today">Hari Ini</option>
                <option value="week">Minggu Ini</option>
                <option value="month">Bulan Ini</option>
                <option value="custom">Periode Kustom</option>
              </select>
            </div>

            {/* Custom Date Range */}
            {selectedDateRange === 'custom' && (
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Total Siswa
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {reports.reduce((sum, report) => sum + report.totalStudents, 0)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Hadir
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {reports.reduce((sum, report) => sum + report.present, 0)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Tidak Hadir
            </h3>
            <p className="text-3xl font-bold text-red-600">
              {reports.reduce((sum, report) => sum + report.absent, 0)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Tingkat Kehadiran
            </h3>
            <p className="text-3xl font-bold text-purple-600">
              {reports.length > 0 ? 
                Math.round((reports.reduce((sum, report) => sum + report.attendanceRate, 0) / reports.length) * 100) / 100 
                : 0}%
            </p>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Detail Laporan Absensi
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Kelas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total Siswa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Hadir
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Terlambat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tidak Hadir
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Izin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tingkat Kehadiran
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {reports.map((report, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(report.date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {report.className}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {report.totalStudents}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400 font-medium">
                      {report.present}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                      {report.late}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400 font-medium">
                      {report.absent}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {report.excused}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${report.attendanceRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {report.attendanceRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {reports.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Tidak ada data</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Belum ada laporan absensi untuk periode yang dipilih.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
