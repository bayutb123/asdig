'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getStudentsByClass } from '@/data/studentsData';
import { 
  getAttendanceByClassAndDateRange, 
  getAvailableDates,
  AttendanceRecord 
} from '@/data/attendanceData';

interface StudentAttendanceData {
  studentId: string;
  studentName: string;
  nisn: string;
  attendanceByDate: Record<string, {
    status: string;
    timeIn?: string;
    notes?: string;
  }>;
}

export default function CetakAbsenPage() {
  const { user, teacher, admin, hasTeacherAccess } = useAuth();
  const router = useRouter();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState<StudentAttendanceData[]>([]);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);

  // Initialize dates
  useEffect(() => {
    if (hasTeacherAccess && teacher?.className) {
      const availableDates = getAvailableDates();
      if (availableDates.length > 0) {
        // Default to last 10 school days (about 2 weeks)
        const endDateDefault = availableDates[availableDates.length - 1];
        const startDateDefault = availableDates[Math.max(0, availableDates.length - 10)];
        setStartDate(startDateDefault);
        setEndDate(endDateDefault);
      }
      setLoading(false);
    }
  }, [teacher, hasTeacherAccess]);

  // Load attendance data when dates change
  useEffect(() => {
    if (startDate && endDate && teacher?.className) {
      loadAttendanceData();
    }
  }, [startDate, endDate, teacher]);

  const loadAttendanceData = () => {
    if (!teacher?.className) return;

    // Get students for the class
    const classStudents = getStudentsByClass(teacher.className);
    
    // Get attendance records for the date range
    const attendanceRecords = getAttendanceByClassAndDateRange(teacher.className, startDate, endDate);
    
    // Get all dates in the range
    const dates = getDateRange(startDate, endDate);
    setSelectedDates(dates);
    
    // Process data for each student
    const processedData: StudentAttendanceData[] = classStudents.map(student => {
      const attendanceByDate: Record<string, any> = {};
      
      dates.forEach(date => {
        const record = attendanceRecords.find(r => 
          r.studentName === student.name && r.date === date
        );
        
        attendanceByDate[date] = {
          status: record?.status || 'Tidak Hadir',
          timeIn: record?.timeIn,
          notes: record?.notes
        };
      });
      
      return {
        studentId: student.id,
        studentName: student.name,
        nisn: student.nisn,
        attendanceByDate
      };
    });
    
    setAttendanceData(processedData);
  };

  const getDateRange = (start: string, end: string): string[] => {
    const dates: string[] = [];
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Limit to maximum 1 month (31 days) from start date
    const maxEndDate = new Date(startDate);
    maxEndDate.setDate(maxEndDate.getDate() + 31);
    const actualEndDate = endDate > maxEndDate ? maxEndDate : new Date(end);

    for (let d = new Date(startDate); d <= actualEndDate; d.setDate(d.getDate() + 1)) {
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (d.getDay() !== 0 && d.getDay() !== 6) {
        dates.push(d.toISOString().split('T')[0]);
      }
    }

    return dates;
  };

  const printAttendanceList = () => {
    if (!teacher?.className || attendanceData.length === 0) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const now = new Date();
    const printDate = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const printTime = now.toLocaleTimeString('id-ID');

    // Calculate summary statistics
    const totalStudents = attendanceData.length;
    const totalDays = selectedDates.length;
    let totalPresent = 0;
    let totalLate = 0;
    let totalAbsent = 0;
    let totalExcused = 0;

    attendanceData.forEach(student => {
      selectedDates.forEach(date => {
        const attendance = student.attendanceByDate[date];
        switch (attendance.status) {
          case 'Hadir': totalPresent++; break;
          case 'Terlambat': totalLate++; break;
          case 'Tidak Hadir': totalAbsent++; break;
          case 'Izin': totalExcused++; break;
        }
      });
    });

    const attendanceRate = totalStudents * totalDays > 0 
      ? ((totalPresent + totalLate) / (totalStudents * totalDays)) * 100 
      : 0;

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Daftar Absensi Siswa - Kelas ${teacher.className}</title>
        <style>
          @media print {
            @page {
              margin: 1cm;
              size: A4 landscape;
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 10px;
              line-height: 1.3;
              color: #000;
              background: white;
            }
          }
          
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 15px;
            background: white;
            color: #000;
          }
          
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
          }
          
          .header h1 {
            margin: 0;
            font-size: 20px;
            font-weight: bold;
          }
          
          .header h2 {
            margin: 5px 0;
            font-size: 16px;
            font-weight: normal;
          }
          
          .header p {
            margin: 3px 0;
            font-size: 12px;
          }
          
          .summary {
            margin-bottom: 20px;
            background: #f8f9fa;
            padding: 10px;
            border: 1px solid #ddd;
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 10px;
            text-align: center;
          }
          
          .summary-item {
            padding: 5px;
            background: white;
            border: 1px solid #ddd;
          }
          
          .summary-item .value {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 3px;
          }
          
          .summary-item .label {
            font-size: 10px;
            color: #666;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            font-size: ${selectedDates.length > 15 ? '7px' : '9px'};
          }

          th, td {
            border: 1px solid #000;
            padding: ${selectedDates.length > 15 ? '2px 1px' : '4px 2px'};
            text-align: center;
            vertical-align: middle;
          }

          th {
            background-color: #f0f0f0;
            font-weight: bold;
            font-size: ${selectedDates.length > 15 ? '6px' : '8px'};
          }
          
          .student-name {
            text-align: left;
            font-weight: bold;
            max-width: 120px;
            font-size: 8px;
          }

          .nisn {
            font-family: monospace;
            font-size: 7px;
            width: 60px;
            max-width: 60px;
            padding: 2px 1px;
          }
          
          .status-H { background-color: #d4edda; }
          .status-T { background-color: #fff3cd; }
          .status-A { background-color: #f8d7da; }
          .status-I { background-color: #d1ecf1; }
          
          .footer {
            margin-top: 20px;
            text-align: right;
            font-size: 10px;
          }
          
          .signature {
            margin-top: 40px;
            text-align: right;
          }
          
          .signature-line {
            margin-top: 60px;
            border-top: 1px solid #000;
            width: 150px;
            margin-left: auto;
            text-align: center;
            padding-top: 5px;
            font-size: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>DAFTAR ABSENSI SISWA</h1>
          <h2>Kelas ${teacher.className} - ${teacher.name}</h2>
          <p>Periode: ${new Date(startDate).toLocaleDateString('id-ID')} - ${new Date(endDate).toLocaleDateString('id-ID')}</p>
          <p>Tanggal Cetak: ${printDate}, ${printTime}</p>
        </div>

        <div class="summary">
          <div class="summary-item">
            <div class="value">${totalStudents}</div>
            <div class="label">Total Siswa</div>
          </div>
          <div class="summary-item">
            <div class="value">${totalDays}</div>
            <div class="label">Hari Sekolah</div>
          </div>
          <div class="summary-item">
            <div class="value">${totalPresent}</div>
            <div class="label">Total Hadir</div>
          </div>
          <div class="summary-item">
            <div class="value">${totalLate}</div>
            <div class="label">Total Terlambat</div>
          </div>
          <div class="summary-item">
            <div class="value">${totalAbsent}</div>
            <div class="label">Total Tidak Hadir</div>
          </div>
          <div class="summary-item">
            <div class="value">${attendanceRate.toFixed(1)}%</div>
            <div class="label">Tingkat Kehadiran</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th rowspan="2" style="width: 30px;">No</th>
              <th rowspan="2" style="width: 60px;">NISN</th>
              <th rowspan="2" style="width: 120px;">Nama Siswa</th>
              <th colspan="${selectedDates.length}">Tanggal</th>
              <th rowspan="2" style="width: 25px;">H</th>
              <th rowspan="2" style="width: 25px;">T</th>
              <th rowspan="2" style="width: 25px;">A</th>
              <th rowspan="2" style="width: 25px;">I</th>
            </tr>
            <tr>
              ${selectedDates.map(date => `<th>${new Date(date).getDate()}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${attendanceData.map((student, index) => {
              const stats = {
                H: selectedDates.filter(date => student.attendanceByDate[date].status === 'Hadir').length,
                T: selectedDates.filter(date => student.attendanceByDate[date].status === 'Terlambat').length,
                A: selectedDates.filter(date => student.attendanceByDate[date].status === 'Tidak Hadir').length,
                I: selectedDates.filter(date => student.attendanceByDate[date].status === 'Izin').length
              };
              
              return `
                <tr>
                  <td>${index + 1}</td>
                  <td class="nisn">${student.nisn}</td>
                  <td class="student-name">${student.studentName}</td>
                  ${selectedDates.map(date => {
                    const attendance = student.attendanceByDate[date];
                    const statusCode = attendance.status === 'Hadir' ? 'H' : 
                                     attendance.status === 'Terlambat' ? 'T' : 
                                     attendance.status === 'Tidak Hadir' ? 'A' : 'I';
                    const statusClass = attendance.status === 'Hadir' ? 'status-H' : 
                                       attendance.status === 'Terlambat' ? 'status-T' : 
                                       attendance.status === 'Tidak Hadir' ? 'status-A' : 'status-I';
                    return `<td class="${statusClass}">${statusCode}</td>`;
                  }).join('')}
                  <td class="status-H">${stats.H}</td>
                  <td class="status-T">${stats.T}</td>
                  <td class="status-A">${stats.A}</td>
                  <td class="status-I">${stats.I}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Keterangan: H = Hadir, T = Terlambat, A = Tidak Hadir, I = Izin</p>
          <p>Laporan ini digenerate secara otomatis oleh Sistem Absensi Digital</p>
        </div>

        <div class="signature">
          <p>Mengetahui,</p>
          <div class="signature-line">
            Wali Kelas
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  // Check if user has teacher access
  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Memuat data...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (admin || !hasTeacherAccess || !teacher) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md">
              <div className="text-red-600 dark:text-red-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Akses Ditolak
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Hanya guru yang memiliki hak untuk mencetak daftar absensi siswa.
              </p>
              <Link
                href="/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                Kembali ke Dashboard
              </Link>
            </div>
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
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Cetak Daftar Absensi - Kelas {teacher.className}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {teacher.name} - Cetak daftar absensi untuk beberapa hari
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Date Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Pilih Periode Absensi
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {selectedDates.length > 0 && (
                  <div>
                    <p>
                      Akan mencetak {selectedDates.length} hari sekolah untuk {attendanceData.length} siswa
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Maksimal 1 bulan data (weekend tidak ditampilkan)
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={printAttendanceList}
                  disabled={!startDate || !endDate || attendanceData.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Cetak Daftar Absensi
                </button>
                
                <Link
                  href="/dashboard"
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Kembali ke Dashboard
                </Link>
              </div>
            </div>
          </div>

          {/* Preview */}
          {attendanceData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Preview Daftar Absensi
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <th className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-left w-12">No</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-1 py-2 text-left w-20">NISN</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-left">Nama Siswa</th>
                      {selectedDates.slice(0, 10).map(date => (
                        <th key={date} className="border border-gray-300 dark:border-gray-600 px-1 py-2 text-center text-xs">
                          {new Date(date).getDate()}/{new Date(date).getMonth() + 1}
                        </th>
                      ))}
                      {selectedDates.length > 10 && (
                        <th className="border border-gray-300 dark:border-gray-600 px-1 py-2 text-center text-xs">
                          ...
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.slice(0, 10).map((student, index) => (
                      <tr key={student.studentId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-center">{index + 1}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-1 py-2 font-mono text-xs">{student.nisn}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-2 py-2">{student.studentName}</td>
                        {selectedDates.slice(0, 10).map(date => {
                          const attendance = student.attendanceByDate[date];
                          const statusCode = attendance.status === 'Hadir' ? 'H' : 
                                           attendance.status === 'Terlambat' ? 'T' : 
                                           attendance.status === 'Tidak Hadir' ? 'A' : 'I';
                          const bgColor = attendance.status === 'Hadir' ? 'bg-green-100' : 
                                         attendance.status === 'Terlambat' ? 'bg-yellow-100' : 
                                         attendance.status === 'Tidak Hadir' ? 'bg-red-100' : 'bg-blue-100';
                          return (
                            <td key={date} className={`border border-gray-300 dark:border-gray-600 px-1 py-2 text-center text-xs ${bgColor}`}>
                              {statusCode}
                            </td>
                          );
                        })}
                        {selectedDates.length > 10 && (
                          <td className="border border-gray-300 dark:border-gray-600 px-1 py-2 text-center text-xs">
                            ...
                          </td>
                        )}
                      </tr>
                    ))}
                    {attendanceData.length > 10 && (
                      <tr>
                        <td colSpan={selectedDates.length + 3} className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-center text-gray-500">
                          ... dan {attendanceData.length - 10} siswa lainnya
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 text-xs text-gray-600 dark:text-gray-400">
                <p>Keterangan: H = Hadir, T = Terlambat, A = Tidak Hadir, I = Izin</p>
                <p>Preview menampilkan maksimal 10 siswa dan {Math.min(selectedDates.length, 10)} hari. Hasil cetak akan menampilkan semua data.</p>
                <p className="text-blue-600 dark:text-blue-400">Weekend tidak ditampilkan. Maksimal 1 bulan data per cetak.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
