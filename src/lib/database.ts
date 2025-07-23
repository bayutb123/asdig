/**
 * Database Service Layer
 * Provides high-level database operations for the Absen Digital application
 */

import { supabase, type User, type Class, type Student, type AttendanceRecord, type StudentClassView } from './supabase';
import { trackError } from './analytics';

// Error handling wrapper
const handleDatabaseError = (error: unknown, operation: string) => {
  console.error(`Database error in ${operation}:`, error);
  trackError('database_error', error instanceof Error ? error.message : 'Unknown error', {
    operation,
    timestamp: new Date().toISOString(),
  });
  throw error;
};

// User operations
export const userService = {
  // Get all users
  async getAll(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleDatabaseError(error, 'userService.getAll');
      return [];
    }
  },

  // Get user by username
  async getByUsername(username: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('is_active', true)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data || null;
    } catch (error) {
      handleDatabaseError(error, 'userService.getByUsername');
      return null;
    }
  },

  // Get teachers only
  async getTeachers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'teacher')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleDatabaseError(error, 'userService.getTeachers');
      return [];
    }
  },

  // Get admins only
  async getAdmins(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'admin')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleDatabaseError(error, 'userService.getAdmins');
      return [];
    }
  },

  // Validate user credentials
  async validateCredentials(username: string, password: string): Promise<User | null> {
    try {
      // Note: In production, you should use proper password hashing
      // This is a simplified version for demonstration
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      // For demo purposes, we're using plain text passwords
      // In production, use bcrypt.compare(password, data.password_hash)
      if (data && data.password_hash === password) {
        return data;
      }

      return null;
    } catch (error) {
      handleDatabaseError(error, 'userService.validateCredentials');
      return null;
    }
  },
};

// Class operations
export const classService = {
  // Get all classes
  async getAll(): Promise<Class[]> {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('is_active', true)
        .order('level', { ascending: true })
        .order('section', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleDatabaseError(error, 'classService.getAll');
      return [];
    }
  },

  // Get class by ID
  async getById(id: string): Promise<Class | null> {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      handleDatabaseError(error, 'classService.getById');
      return null;
    }
  },

  // Get classes by teacher
  async getByTeacher(teacherId: string): Promise<Class[]> {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', teacherId)
        .eq('is_active', true)
        .order('level', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleDatabaseError(error, 'classService.getByTeacher');
      return [];
    }
  },

  // Create new class
  async create(classData: Omit<Class, 'id' | 'created_at' | 'updated_at'>): Promise<Class | null> {
    try {
      const { data, error } = await supabase
        .from('classes')
        .insert(classData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      handleDatabaseError(error, 'classService.create');
      return null;
    }
  },

  // Update class
  async update(id: string, updates: Partial<Class>): Promise<Class | null> {
    try {
      const { data, error } = await supabase
        .from('classes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      handleDatabaseError(error, 'classService.update');
      return null;
    }
  },

  // Delete class (soft delete)
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('classes')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      handleDatabaseError(error, 'classService.delete');
      return false;
    }
  },
};

// Student operations
export const studentService = {
  // Get all students
  async getAll(): Promise<Student[]> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleDatabaseError(error, 'studentService.getAll');
      return [];
    }
  },

  // Get students by class
  async getByClass(classId: string): Promise<Student[]> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', classId)
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleDatabaseError(error, 'studentService.getByClass');
      return [];
    }
  },

  // Get student with class info
  async getWithClassInfo(): Promise<StudentClassView[]> {
    try {
      const { data, error } = await supabase
        .from('student_class_view')
        .select('*')
        .order('class_name', { ascending: true })
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleDatabaseError(error, 'studentService.getWithClassInfo');
      return [];
    }
  },

  // Get student by ID
  async getById(id: string): Promise<Student | null> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      handleDatabaseError(error, 'studentService.getById');
      return null;
    }
  },
};

// Attendance operations
export const attendanceService = {
  // Get attendance by class and date
  async getByClassAndDate(classId: string, date: string): Promise<AttendanceRecord[]> {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('class_id', classId)
        .eq('date', date)
        .order('created_at');

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleDatabaseError(error, 'attendanceService.getByClassAndDate');
      return [];
    }
  },

  // Get attendance by class and date range
  async getByClassAndDateRange(classId: string, startDate: string, endDate: string): Promise<AttendanceRecord[]> {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('class_id', classId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false })
        .order('created_at');

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleDatabaseError(error, 'attendanceService.getByClassAndDateRange');
      return [];
    }
  },

  // Get available dates with attendance records
  async getAvailableDates(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('date')
        .order('date', { ascending: false });

      if (error) throw error;

      // Get unique dates
      const uniqueDates = [...new Set(data?.map(record => record.date) || [])];
      return uniqueDates.sort((a, b) => b.localeCompare(a)); // Most recent first
    } catch (error) {
      handleDatabaseError(error, 'attendanceService.getAvailableDates');
      return [];
    }
  },

  // Create or update attendance record
  async upsertAttendance(attendanceData: Omit<AttendanceRecord, 'id' | 'created_at' | 'updated_at'>): Promise<AttendanceRecord | null> {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .upsert(attendanceData, {
          onConflict: 'student_id,date',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      handleDatabaseError(error, 'attendanceService.upsertAttendance');
      return null;
    }
  },

  // Bulk upsert attendance records
  async bulkUpsertAttendance(attendanceRecords: Omit<AttendanceRecord, 'id' | 'created_at' | 'updated_at'>[]): Promise<AttendanceRecord[]> {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .upsert(attendanceRecords, {
          onConflict: 'student_id,date',
          ignoreDuplicates: false
        })
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleDatabaseError(error, 'attendanceService.bulkUpsertAttendance');
      return [];
    }
  },

  // Calculate attendance statistics
  async calculateClassStats(classId: string, startDate: string, endDate: string) {
    try {
      const records = await this.getByClassAndDateRange(classId, startDate, endDate);

      const stats = {
        total: records.length,
        present: records.filter(r => r.status === 'Hadir').length,
        late: records.filter(r => r.status === 'Terlambat').length,
        absent: records.filter(r => r.status === 'Tidak Hadir').length,
        excused: records.filter(r => r.status === 'Izin').length,
      };

      const attendanceRate = stats.total > 0
        ? ((stats.present + stats.late) / stats.total) * 100
        : 0;

      return {
        ...stats,
        attendanceRate: Math.round(attendanceRate * 100) / 100
      };
    } catch (error) {
      handleDatabaseError(error, 'attendanceService.calculateClassStats');
      return {
        total: 0,
        present: 0,
        late: 0,
        absent: 0,
        excused: 0,
        attendanceRate: 0
      };
    }
  },
};

// Real-time subscriptions
export const realtimeService = {
  // Subscribe to attendance changes
  subscribeToAttendance(classId: string, callback: (payload: any) => void) {
    return supabase
      .channel('attendance_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance_records',
          filter: `class_id=eq.${classId}`
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to student changes
  subscribeToStudents(classId: string, callback: (payload: any) => void) {
    return supabase
      .channel('student_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'students',
          filter: `class_id=eq.${classId}`
        },
        callback
      )
      .subscribe();
  },

  // Unsubscribe from channel
  unsubscribe(channel: any) {
    if (channel) {
      return supabase.removeChannel(channel);
    }
  },
};
