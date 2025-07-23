/**
 * Real-time Attendance Component
 * Provides live attendance tracking with Supabase real-time updates
 */

'use client';

import { useState, useEffect } from 'react';
import { useSupabaseClass } from '@/contexts/SupabaseClassContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { type AttendanceRecord } from '@/lib/supabase';

interface AttendanceFormData {
  studentId: string;
  status: 'Hadir' | 'Terlambat' | 'Tidak Hadir' | 'Izin';
  timeIn?: string;
  notes?: string;
}

export default function RealtimeAttendance() {
  const { user } = useSupabaseAuth();
  const {
    selectedClass,
    selectedDate,
    studentsInSelectedClass,
    attendanceForSelectedDate,
    isLoadingAttendance,
    saveAttendance,
    setSelectedDate,
  } = useSupabaseClass();
  
  const { trackAttendance } = useAnalytics();
  
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceFormData>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Initialize attendance data when students or existing attendance changes
  useEffect(() => {
    const initialData: Record<string, AttendanceFormData> = {};
    
    studentsInSelectedClass.forEach(student => {
      const existingRecord = attendanceForSelectedDate.find(
        record => record.student_id === student.id
      );
      
      initialData[student.id] = {
        studentId: student.id,
        status: existingRecord?.status || 'Hadir',
        timeIn: existingRecord?.time_in || '',
        notes: existingRecord?.notes || '',
      };
    });
    
    setAttendanceData(initialData);
  }, [studentsInSelectedClass, attendanceForSelectedDate]);

  // Update last updated timestamp when attendance data changes
  useEffect(() => {
    if (attendanceForSelectedDate.length > 0) {
      const latestUpdate = attendanceForSelectedDate.reduce((latest, record) => {
        const recordTime = new Date(record.updated_at);
        return recordTime > latest ? recordTime : latest;
      }, new Date(0));
      
      setLastUpdated(latestUpdate);
    }
  }, [attendanceForSelectedDate]);

  const handleAttendanceChange = (studentId: string, field: keyof AttendanceFormData, value: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass || !user) return;

    try {
      setIsSaving(true);
      
      // Convert form data to attendance records
      const records: Omit<AttendanceRecord, 'id' | 'created_at' | 'updated_at'>[] = 
        Object.values(attendanceData).map(data => ({
          student_id: data.studentId,
          class_id: selectedClass.id,
          date: selectedDate,
          status: data.status,
          time_in: data.timeIn || null,
          notes: data.notes || null,
          recorded_by: user.id,
        }));

      const success = await saveAttendance(records);
      
      if (success) {
        // Track successful attendance save
        trackAttendance('attendance_save', selectedClass.name, {
          student_count: records.length,
          date: selectedDate,
        });
        
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getAttendanceStats = () => {
    const records = Object.values(attendanceData);
    return {
      total: records.length,
      present: records.filter(r => r.status === 'Hadir').length,
      late: records.filter(r => r.status === 'Terlambat').length,
      absent: records.filter(r => r.status === 'Tidak Hadir').length,
      excused: records.filter(r => r.status === 'Izin').length,
    };
  };

  if (!selectedClass) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Pilih kelas untuk mulai mencatat kehadiran</p>
      </div>
    );
  }

  const stats = getAttendanceStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{selectedClass.name}</h2>
            <p className="text-gray-600">Kehadiran Real-time</p>
          </div>
          <div className="text-right">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.present}</div>
            <div className="text-sm text-gray-500">Hadir</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
            <div className="text-sm text-gray-500">Terlambat</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
            <div className="text-sm text-gray-500">Tidak Hadir</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.excused}</div>
            <div className="text-sm text-gray-500">Izin</div>
          </div>
        </div>

        {/* Last Updated */}
        {lastUpdated && (
          <div className="text-sm text-gray-500 mb-4">
            Terakhir diperbarui: {lastUpdated.toLocaleString('id-ID')}
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSaveAttendance}
          disabled={isSaving || isLoadingAttendance}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Menyimpan...' : 'Simpan Kehadiran'}
        </button>
      </div>

      {/* Attendance List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Daftar Kehadiran Siswa</h3>
          
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
            <div className="space-y-4">
              {studentsInSelectedClass.map((student, index) => (
                <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{student.name}</h4>
                      <p className="text-sm text-gray-500">NISN: {student.nisn}</p>
                    </div>
                    <div className="text-sm text-gray-500">#{index + 1}</div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status Kehadiran
                      </label>
                      <select
                        value={attendanceData[student.id]?.status || 'Hadir'}
                        onChange={(e) => handleAttendanceChange(
                          student.id, 
                          'status', 
                          e.target.value as AttendanceFormData['status']
                        )}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Hadir">Hadir</option>
                        <option value="Terlambat">Terlambat</option>
                        <option value="Tidak Hadir">Tidak Hadir</option>
                        <option value="Izin">Izin</option>
                      </select>
                    </div>

                    {/* Time In */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Waktu Masuk
                      </label>
                      <input
                        type="time"
                        value={attendanceData[student.id]?.timeIn || ''}
                        onChange={(e) => handleAttendanceChange(student.id, 'timeIn', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Catatan
                      </label>
                      <input
                        type="text"
                        value={attendanceData[student.id]?.notes || ''}
                        onChange={(e) => handleAttendanceChange(student.id, 'notes', e.target.value)}
                        placeholder="Catatan tambahan..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
