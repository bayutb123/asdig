/**
 * Supabase-based Class Context
 * Replaces the old JSON-based class management with Supabase database
 */

'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { classService, studentService, attendanceService, realtimeService } from '@/lib/database';
import { type Class, type Student, type AttendanceRecord } from '@/lib/supabase';
import { useSupabaseAuth } from './SupabaseAuthContext';
import { trackError } from '@/lib/analytics';

interface ClassContextType {
  // Data
  classes: Class[];
  students: Student[];
  selectedClass: Class | null;
  selectedDate: string;
  attendanceRecords: AttendanceRecord[];
  
  // Loading states
  isLoading: boolean;
  isLoadingAttendance: boolean;
  
  // Actions
  setSelectedClass: (classItem: Class | null) => void;
  setSelectedDate: (date: string) => void;
  refreshClasses: () => Promise<void>;
  refreshStudents: () => Promise<void>;
  refreshAttendance: () => Promise<void>;
  saveAttendance: (records: Omit<AttendanceRecord, 'id' | 'created_at' | 'updated_at'>[]) => Promise<boolean>;
  
  // Computed properties
  studentsInSelectedClass: Student[];
  attendanceForSelectedDate: AttendanceRecord[];
  availableDates: string[];
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

interface ClassProviderProps {
  children: ReactNode;
}

export function SupabaseClassProvider({ children }: ClassProviderProps) {
  const { user, hasTeacherAccess } = useSupabaseAuth();
  
  // State
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);

  // Computed properties
  const studentsInSelectedClass = students.filter(student => 
    selectedClass ? student.class_id === selectedClass.id : false
  );

  const attendanceForSelectedDate = attendanceRecords.filter(record => 
    record.date === selectedDate && 
    (selectedClass ? record.class_id === selectedClass.id : true)
  );

  // Load classes based on user role
  const refreshClasses = useCallback(async () => {
    try {
      setIsLoading(true);
      
      let classData: Class[] = [];
      
      if (user?.role === 'admin') {
        // Admins can see all classes
        classData = await classService.getAll();
      } else if (user?.role === 'teacher') {
        // Teachers can only see their own classes
        classData = await classService.getByTeacher(user.id);
      }
      
      setClasses(classData);
      
      // Auto-select first class if none selected
      if (!selectedClass && classData.length > 0) {
        setSelectedClass(classData[0]);
      }
    } catch (error) {
      console.error('Error loading classes:', error);
      trackError('class_loading_error', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load students
  const refreshStudents = useCallback(async () => {
    try {
      const studentData = await studentService.getAll();
      setStudents(studentData);
    } catch (error) {
      console.error('Error loading students:', error);
      trackError('student_loading_error', error instanceof Error ? error.message : 'Unknown error');
    }
  }, []);

  // Load attendance records
  const refreshAttendance = useCallback(async () => {
    if (!selectedClass) return;
    
    try {
      setIsLoadingAttendance(true);
      
      // Load attendance for selected class and date
      const attendanceData = await attendanceService.getByClassAndDate(selectedClass.id, selectedDate);
      setAttendanceRecords(attendanceData);
      
      // Load available dates
      const dates = await attendanceService.getAvailableDates();
      setAvailableDates(dates);
    } catch (error) {
      console.error('Error loading attendance:', error);
      trackError('attendance_loading_error', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoadingAttendance(false);
    }
  }, [selectedClass, selectedDate]);

  // Save attendance records
  const saveAttendance = async (records: Omit<AttendanceRecord, 'id' | 'created_at' | 'updated_at'>[]): Promise<boolean> => {
    try {
      setIsLoadingAttendance(true);
      
      const savedRecords = await attendanceService.bulkUpsertAttendance(records);
      
      if (savedRecords.length > 0) {
        // Refresh attendance data
        await refreshAttendance();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error saving attendance:', error);
      trackError('attendance_save_error', error instanceof Error ? error.message : 'Unknown error');
      return false;
    } finally {
      setIsLoadingAttendance(false);
    }
  };

  // Load initial data when user changes
  useEffect(() => {
    if (user && hasTeacherAccess) {
      refreshClasses();
      refreshStudents();
    }
  }, [user, hasTeacherAccess]);

  // Load attendance when selected class or date changes
  useEffect(() => {
    if (selectedClass && selectedDate) {
      refreshAttendance();
    }
  }, [selectedClass, selectedDate]);

  // Set up real-time subscriptions (optional - graceful fallback if not available)
  useEffect(() => {
    if (!selectedClass) return;

    let attendanceChannel: any = null;
    let studentChannel: any = null;

    try {
      // Subscribe to attendance changes for the selected class
      attendanceChannel = realtimeService.subscribeToAttendance(
        selectedClass.id,
        (payload) => {
          console.log('Real-time attendance update:', payload);
          // Refresh attendance data when changes occur
          refreshAttendance();
        }
      );

      // Subscribe to student changes for the selected class
      studentChannel = realtimeService.subscribeToStudents(
        selectedClass.id,
        (payload) => {
          console.log('Real-time student update:', payload);
          // Refresh student data when changes occur
          refreshStudents();
        }
      );
    } catch (error) {
      console.warn('Real-time subscriptions not available:', error);
    }

    // Cleanup subscriptions
    return () => {
      if (attendanceChannel) {
        realtimeService.unsubscribe(attendanceChannel);
      }
      if (studentChannel) {
        realtimeService.unsubscribe(studentChannel);
      }
    };
  }, [selectedClass, refreshAttendance, refreshStudents]);

  const value = {
    // Data
    classes,
    students,
    selectedClass,
    selectedDate,
    attendanceRecords,
    
    // Loading states
    isLoading,
    isLoadingAttendance,
    
    // Actions
    setSelectedClass,
    setSelectedDate,
    refreshClasses,
    refreshStudents,
    refreshAttendance,
    saveAttendance,
    
    // Computed properties
    studentsInSelectedClass,
    attendanceForSelectedDate,
    availableDates,
  };

  return (
    <ClassContext.Provider value={value}>
      {children}
    </ClassContext.Provider>
  );
}

export function useSupabaseClass() {
  const context = useContext(ClassContext);
  if (context === undefined) {
    throw new Error('useSupabaseClass must be used within a SupabaseClassProvider');
  }
  return context;
}

export default ClassContext;
