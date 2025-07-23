'use client';

import { useState, useEffect, useCallback } from 'react';

import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseClass } from '@/contexts/SupabaseClassContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';



export default function ManualAttendancePage() {
  const { teacher, admin, isLoading, hasTeacherAccess } = useSupabaseAuth();
  const {
    studentsInSelectedClass,
    selectedClass,
    selectedDate,
    setSelectedDate,
    saveAttendance,
    isLoadingAttendance
  } = useSupabaseClass();

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Initialize default values - Only for teachers
  useEffect(() => {
    if (hasTeacherAccess && teacher?.className) {
      setSelectedClass(teacher.className);

      // Set default date to latest available date
      const availableDates = getAvailableDates();
      const latestDate = availableDates.length > 0 ? availableDates[availableDates.length - 1] : new Date().toISOString().split('T')[0];
      setSelectedDate(latestDate);
    }
  }, [teacher, hasTeacherAccess]);

  // Show loading state
  if (isLoading || isLoadingAttendance) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Show message if no class selected
  if (!selectedClass) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-2xl font-bold mb-4">Absen Manual</h1>
              <p className="text-gray-600">
                Pilih kelas untuk mulai mencatat kehadiran siswa.
              </p>
              <Link
                href="/dashboard"
                className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold mb-4">Absen Manual - {selectedClass.name}</h1>
            <p className="text-gray-600 mb-6">
              Tanggal: {new Date(selectedDate).toLocaleDateString('id-ID')}
            </p>

            {/* Use the RealtimeAttendance component for manual attendance */}
            <div className="mt-6">
              <p className="text-sm text-gray-500 mb-4">
                Gunakan komponen kehadiran real-time untuk mencatat absensi manual.
              </p>
              <Link
                href="/dashboard"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Kembali ke Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
