import AttendanceTable from '@/components/AttendanceTable';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Absen Digital - Sekolah Dasar
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Sistem Manajemen Absensi Siswa SD
          </p>

          {/* Login Button */}
          <div className="mb-6">
            <Link
              href="/login"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Login Wali Kelas
            </Link>
          </div>
        </div>

        {/* Attendance Table */}
        <AttendanceTable />
      </div>
    </div>
  );
}
