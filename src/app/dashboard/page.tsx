'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AttendanceTable from '@/components/AttendanceTable';
import { StableContainer, LoadingPlaceholder } from '@/components/LayoutStable';
import Link from 'next/link';

export default function DashboardPage() {
  const { teacher, admin, logout, isLoading, hasAdminAccess, hasTeacherAccess } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    try {
      logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback navigation
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  // Show loading if auth is still loading or no user data is available
  if (isLoading || (!teacher && !admin)) {
    return (
      <ProtectedRoute>
        <StableContainer className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <LoadingPlaceholder
            message="Memuat dashboard..."
            height="100vh"
            className="flex items-center justify-center"
          />
        </StableContainer>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <StableContainer className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {admin ? 'Dashboard Admin' : 'Dashboard Wali Kelas'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Selamat datang, {admin?.name || teacher?.name || 'Loading...'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {admin?.name || teacher?.name || 'Loading...'}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {admin ? `Admin - ${admin.position}` : `Guru Kelas ${teacher?.className || '...'}`}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  NIP: {admin?.nip || teacher?.nip || '...'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 prevent-layout-shift" style={{ minHeight: '60vh' }}>
        {/* Class Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {admin ? 'Informasi dan Jabatan' : 'Informasi Kelas'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center">
                    <svg className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h10M7 15h10" />
                    </svg>
                    <div>
                      <p className="text-sm text-blue-600 dark:text-blue-400">Kelas</p>
                      <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                        {admin ? admin.position : teacher?.className || 'Loading...'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center">
                    <svg className="h-8 w-8 text-green-600 dark:text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <div>
                      <p className="text-sm text-green-600 dark:text-green-400">{admin ? 'Admin' : 'Wali Kelas'}</p>
                      <p className="text-lg font-semibold text-green-800 dark:text-green-200">{admin?.name || teacher?.name || 'Loading...'}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="flex items-center">
                    <svg className="h-8 w-8 text-purple-600 dark:text-purple-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <p className="text-sm text-purple-600 dark:text-purple-400">NIP</p>
                      <p className="text-lg font-semibold text-purple-800 dark:text-purple-200">{admin?.nip || teacher?.nip || 'Loading...'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Link
            href="/absen-manual"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-center block"
          >
            <svg className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-semibold text-gray-900 dark:text-white">Absen Manual</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Input absensi siswa</p>
          </Link>

          <Link
            href="/laporan-absen"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-center block"
          >
            <svg className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="font-semibold text-gray-900 dark:text-white">Laporan Absensi</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Lihat laporan absensi</p>
          </Link>

          {hasTeacherAccess && (
            <Link
              href="/cetak-absen"
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-center block"
            >
              <svg className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <h3 className="font-semibold text-gray-900 dark:text-white">Cetak Absensi</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Cetak daftar multi-hari</p>
            </Link>
          )}

          <Link
            href="/kelola-kelas"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-center block"
          >
            <svg className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="font-semibold text-gray-900 dark:text-white">Kelola Kelas</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {hasAdminAccess ? 'Tambah & kelola kelas' : 'Lihat informasi kelas'}
            </p>
          </Link>

          <button className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-center">
            <svg className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="font-semibold text-gray-900 dark:text-white">Pengaturan</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Atur preferensi</p>
          </button>
        </div>

        {/* Attendance Table */}
        <AttendanceTable headingLevel="h2" />
      </main>
      </StableContainer>
    </ProtectedRoute>
  );
}
