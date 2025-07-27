import AttendanceTable from '@/components/AttendanceTable';

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


        </div>

        {/* Attendance Table - will show landing page if not authenticated */}
        <AttendanceTable headingLevel="h2" />
      </div>
    </div>
  );
}
