'use client';

import {useEffect, useState} from 'react';
import {useSupabaseAuth} from '@/contexts/SupabaseAuthContext';
import {useSupabaseClass} from '@/contexts/SupabaseClassContext';
import { LoadingPlaceholder } from './LayoutStable';

interface AttendanceTableProps {
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export default function AttendanceTable({ headingLevel = 'h2' }: AttendanceTableProps) {
  const { user, hasTeacherAccess, isLoading: authLoading } = useSupabaseAuth();
  const {
    studentsInSelectedClass,
    attendanceForSelectedDate,
    selectedClass,
    selectedDate,
    isLoading: classLoading,
    isLoadingAttendance
  } = useSupabaseClass();

  // Show loading if authentication or class data is loading
  if (authLoading || classLoading) {
    return <LoadingPlaceholder />;
  }

  // If no user is logged in, show a simple message
  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Data Kehadiran Siswa</h2>
        <p className="text-gray-600">
          Silakan login sebagai wali kelas untuk melihat data kehadiran siswa.
        </p>
      </div>
    );
  }

  // If no class is selected, show message
  if (!selectedClass) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Data Kehadiran Siswa</h2>
        <p className="text-gray-600">
          Pilih kelas untuk melihat data kehadiran siswa.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Data Kehadiran - {selectedClass.name}
            </h2>
            <p className="text-gray-600">
              Tanggal: {new Date(selectedDate).toLocaleDateString('id-ID')}
            </p>
          </div>
        </div>

        {isLoadingAttendance ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Memuat data kehadiran...</p>
          </div>
        ) : studentsInSelectedClass.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Tidak ada siswa di kelas ini</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Siswa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NISN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Waktu Masuk
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studentsInSelectedClass.map((student, index) => {
                  const attendance = attendanceForSelectedDate.find(
                    record => record.student_id === student.id
                  );

                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {student.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.nisn}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          attendance?.status === 'Hadir'
                            ? 'bg-green-100 text-green-800'
                            : attendance?.status === 'Terlambat'
                            ? 'bg-yellow-100 text-yellow-800'
                            : attendance?.status === 'Izin'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {attendance?.status || 'Belum Dicatat'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {attendance?.time_in || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
