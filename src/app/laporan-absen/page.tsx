'use client';

import {useState, useEffect, useCallback} from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useClasses, useAttendance } from '@/hooks/useApi';

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
  const { user, hasAdminAccess, hasTeacherAccess } = useAuth();
  const router = useRouter();

  // React Query hooks for data fetching
  const { data: classesData, isLoading: classesLoading } = useClasses();
  const classes = classesData?.classes || [];

  const [loading, setLoading] = useState(true);
  const isLoading = loading || classesLoading;
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('today');
  const [startDate, setStartDate] = useState<string>('2025-07-21');
  const [endDate, setEndDate] = useState<string>('2025-07-21');
  const [reports, setReports] = useState<AttendanceReport[]>([]);

  // Fetch attendance data for the selected date range (conditionally enabled)
  const { data: attendanceData } = useAttendance({
    startDate: startDate,
    endDate: endDate,
    enabled: Boolean(startDate && endDate)
  });

  // Check authentication
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Set default class for teachers
    if (hasTeacherAccess && user?.className) {
      setSelectedClass(user.className);
    }
    
    // Set default date to a date range that has data (based on migration data)
    const defaultEndDate = '2025-07-21'; // Last date with data
    const defaultStartDate = '2025-07-21'; // Same date for single day report
    setStartDate(defaultStartDate);
    setEndDate(defaultEndDate);
    
    setLoading(false);
  }, [user, hasTeacherAccess, router]);

  // Define generateReports function
  const generateReports = useCallback(() => {
    // Use classes from React Query hook
    // Filter classes based on selection and user role
    let targetClasses = classes;
    if (hasTeacherAccess && user?.className) {
      targetClasses = classes.filter(cls => cls.name === user.className);
    } else if (selectedClass !== 'all') {
      targetClasses = classes.filter(cls => cls.name === selectedClass);
    }

    // Determine date range based on selection
    let reportStartDate = startDate;
    let reportEndDate = endDate;

    if (selectedDateRange === 'today') {
      const today = new Date().toISOString().split('T')[0];
      reportStartDate = today;
      reportEndDate = today;
    } else if (selectedDateRange === 'week') {
      const today = new Date();
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay() + 1));
      const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 5));
      reportStartDate = weekStart.toISOString().split('T')[0];
      reportEndDate = weekEnd.toISOString().split('T')[0];
    } else if (selectedDateRange === 'month') {
      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      reportStartDate = monthStart.toISOString().split('T')[0];
      reportEndDate = monthEnd.toISOString().split('T')[0];
    }

    // Generate reports for each class using real attendance data
    const generatedReports: AttendanceReport[] = targetClasses.map(cls => {
      // Get attendance data for this class and date range
      const allAttendanceRecords = attendanceData?.attendanceRecords || [];
      const classAttendanceRecords = allAttendanceRecords.filter(record =>
        record.className === cls.name &&
        record.date >= reportStartDate &&
        record.date <= reportEndDate
      );

      // Calculate statistics from real data
      const totalStudents = cls.studentCount || 0;
      const totalPresent = classAttendanceRecords.filter(r => r.status === 'HADIR').length;
      const totalLate = classAttendanceRecords.filter(r => r.status === 'TERLAMBAT').length;
      const totalAbsent = classAttendanceRecords.filter(r => r.status === 'TIDAK_HADIR').length;
      const totalExcused = classAttendanceRecords.filter(r => r.status === 'IZIN').length;

      // Calculate attendance rate
      const totalRecorded = totalPresent + totalLate + totalAbsent + totalExcused;
      const attendanceRate = totalRecorded > 0 ? Math.round(((totalPresent + totalLate) / totalRecorded) * 100) : 0;

      const stats = {
        totalStudents,
        totalPresent,
        totalAbsent,
        totalLate,
        totalExcused,
        attendanceRate
      };

      return {
        date: reportStartDate === reportEndDate ? reportStartDate : `${reportStartDate} - ${reportEndDate}`,
        className: cls.name || 'Unknown',
        totalStudents: stats.totalStudents || 0,
        present: stats.totalPresent || 0,
        late: stats.totalLate || 0,
        absent: stats.totalAbsent || 0,
        excused: stats.totalExcused || 0,
        attendanceRate: stats.attendanceRate || 0
      };
    });

    setReports(generatedReports);
  }, [selectedClass, hasTeacherAccess, user, selectedDateRange, startDate, endDate, classes, attendanceData]);

  // Generate attendance reports
  useEffect(() => {
    if (!loading) {
      generateReports();
    }
  }, [selectedClass, selectedDateRange, startDate, endDate, loading, generateReports]);

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
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Get current date and time for the report
    const now = new Date();
    const reportDate = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const reportTime = now.toLocaleTimeString('id-ID');

    // Determine the period text
    let periodText: string;
    if (selectedDateRange === 'today') {
      periodText = 'Hari Ini';
    } else if (selectedDateRange === 'week') {
      periodText = 'Minggu Ini';
    } else if (selectedDateRange === 'month') {
      periodText = 'Bulan Ini';
    } else {
      periodText = `${startDate} - ${endDate}`;
    }

    // Calculate totals for summary
    const totalStudents = selectedClass !== 'all' && reports.length === 1
      ? (reports[0]?.totalStudents || 0)
      : reports.reduce((sum, report) => sum + (report?.totalStudents || 0), 0);
    const avgPresent = reports.length > 0
      ? Math.round((reports.reduce((sum, report) => sum + (report?.present || 0), 0) / reports.length) * 100) / 100
      : 0;
    const avgAbsent = reports.length > 0
      ? Math.round((reports.reduce((sum, report) => sum + (report?.absent || 0), 0) / reports.length) * 100) / 100
      : 0;
    const avgAttendanceRate = reports.length > 0
      ? Math.round((reports.reduce((sum, report) => sum + (report?.attendanceRate || 0), 0) / reports.length) * 100) / 100
      : 0;

    // Create the print content
    const printContent = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="utf-8">
        <title>Laporan Absensi - ${periodText}</title>
        <style>
          @media print {
            @page {
              margin: 1cm;
              size: A4;
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
              line-height: 1.4;
              color: #000;
              background: white;
            }
            .no-print {
              display: none !important;
            }
          }

          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
            color: #000;
          }

          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
          }

          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
          }

          .header h2 {
            margin: 5px 0;
            font-size: 18px;
            font-weight: normal;
          }

          .header p {
            margin: 5px 0;
            font-size: 14px;
          }

          .summary {
            margin-bottom: 30px;
            background: #f8f9fa;
            padding: 15px;
            border: 1px solid #ddd;
          }

          .summary h3 {
            margin: 0 0 15px 0;
            font-size: 16px;
          }

          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
          }

          .summary-item {
            text-align: center;
            padding: 10px;
            background: white;
            border: 1px solid #ddd;
          }

          .summary-item .value {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
          }

          .summary-item .label {
            font-size: 12px;
            color: #666;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }

          th, td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
          }

          th {
            background-color: #f0f0f0;
            font-weight: bold;
            text-align: center;
          }

          td {
            text-align: center;
          }

          .footer {
            margin-top: 40px;
            text-align: right;
            font-size: 12px;
          }

          .signature {
            margin-top: 60px;
            text-align: right;
          }

          .signature-line {
            margin-top: 80px;
            border-top: 1px solid #000;
            width: 200px;
            margin-left: auto;
            text-align: center;
            padding-top: 5px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>LAPORAN ABSENSI SISWA</h1>
          <h2>SD NEGERI CONTOH</h2>
          <p>Periode: ${periodText}</p>
          <p>Tanggal Cetak: ${reportDate}, ${reportTime}</p>
        </div>

        <div class="summary">
          <h3>Ringkasan Absensi</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="value">${totalStudents}</div>
              <div class="label">Total Siswa</div>
            </div>
            <div class="summary-item">
              <div class="value">${avgPresent.toFixed(1)}</div>
              <div class="label">Rata-rata Hadir</div>
            </div>
            <div class="summary-item">
              <div class="value">${avgAbsent.toFixed(1)}</div>
              <div class="label">Rata-rata Tidak Hadir</div>
            </div>
            <div class="summary-item">
              <div class="value">${avgAttendanceRate}%</div>
              <div class="label">Tingkat Kehadiran</div>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Tanggal</th>
              <th>Kelas</th>
              <th>Total Siswa</th>
              <th>Hadir</th>
              <th>Terlambat</th>
              <th>Tidak Hadir</th>
              <th>Izin</th>
              <th>Tingkat Kehadiran</th>
            </tr>
          </thead>
          <tbody>
            ${reports.map((report, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${report.date.includes(' - ') ? (() => {
                  const [startDate, endDate] = report.date.split(' - ');
                  const startFormatted = new Date(startDate).toLocaleDateString('id-ID');
                  const endFormatted = new Date(endDate).toLocaleDateString('id-ID');
                  return `${startFormatted} - ${endFormatted}`;
                })() : new Date(report.date).toLocaleDateString('id-ID')}</td>
                <td>${report.className}</td>
                <td>${report.totalStudents}</td>
                <td>${report.present}</td>
                <td>${report.late}</td>
                <td>${report.absent}</td>
                <td>${report.excused}</td>
                <td>${report.attendanceRate}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Laporan ini digenerate secara otomatis oleh Sistem Absensi Digital</p>
        </div>

        <div class="signature">
          <p>Mengetahui,</p>
          <div class="signature-line">
            Kepala Sekolah
          </div>
        </div>
      </body>
      </html>
    `;

    // Write content to print window
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
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
                {user?.role === 'ADMIN' ? `Admin - ${user.name}` : user?.role === 'TEACHER' ? `Kelas ${user.className} - ${user.name}` : 'Loading...'}
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
                <label
                  htmlFor="class-filter-select"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Kelas
                </label>
                <select
                  id="class-filter-select"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  aria-label="Filter laporan berdasarkan kelas"
                >
                  <option value="all">Semua Kelas</option>
                  {classes.map(cls => (
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
              {selectedClass !== 'all' && reports.length === 1
                ? (reports[0]?.totalStudents || 0)
                : reports.reduce((sum, report) => sum + (report?.totalStudents || 0), 0)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Rata-rata Hadir
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {reports.length > 0
                ? Math.round((reports.reduce((sum, report) => sum + (report.present || 0), 0) / reports.length) * 100) / 100
                : 0}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Rata-rata Tidak Hadir
            </h3>
            <p className="text-3xl font-bold text-red-600">
              {reports.length > 0
                ? Math.round((reports.reduce((sum, report) => sum + (report?.absent || 0), 0) / reports.length) * 100) / 100
                : 0}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Tingkat Kehadiran
            </h3>
            <p className="text-3xl font-bold text-purple-600">
              {reports.length > 0 ?
                Math.round((reports.reduce((sum, report) => sum + (report?.attendanceRate || 0), 0) / reports.length) * 100) / 100
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
                      {report.date.includes(' - ') ? (
                        // Date range format
                        (() => {
                          const [startDate, endDate] = report.date.split(' - ');
                          const startFormatted = new Date(startDate).toLocaleDateString('id-ID');
                          const endFormatted = new Date(endDate).toLocaleDateString('id-ID');
                          return `${startFormatted} - ${endFormatted}`;
                        })()
                      ) : (
                        // Single date format
                        new Date(report.date).toLocaleDateString('id-ID')
                      )}
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
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
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
