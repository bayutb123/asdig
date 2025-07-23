/**
 * Supabase Configuration and Client Setup
 * Provides centralized database access for the Absen Digital application
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'admin' | 'teacher';
          nip: string | null;
          phone: string | null;
          username: string;
          password_hash: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role: 'admin' | 'teacher';
          nip?: string | null;
          phone?: string | null;
          username: string;
          password_hash: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'admin' | 'teacher';
          nip?: string | null;
          phone?: string | null;
          username?: string;
          password_hash?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      classes: {
        Row: {
          id: string;
          name: string;
          level: number;
          section: string;
          teacher_id: string | null;
          max_students: number;
          academic_year: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          level: number;
          section: string;
          teacher_id?: string | null;
          max_students?: number;
          academic_year?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          level?: number;
          section?: string;
          teacher_id?: string | null;
          max_students?: number;
          academic_year?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      students: {
        Row: {
          id: string;
          name: string;
          nisn: string;
          class_id: string | null;
          gender: 'L' | 'P';
          birth_date: string | null;
          address: string | null;
          parent_name: string | null;
          parent_phone: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          nisn: string;
          class_id?: string | null;
          gender: 'L' | 'P';
          birth_date?: string | null;
          address?: string | null;
          parent_name?: string | null;
          parent_phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          nisn?: string;
          class_id?: string | null;
          gender?: 'L' | 'P';
          birth_date?: string | null;
          address?: string | null;
          parent_name?: string | null;
          parent_phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      attendance_records: {
        Row: {
          id: string;
          student_id: string;
          class_id: string;
          date: string;
          status: 'Hadir' | 'Terlambat' | 'Tidak Hadir' | 'Izin';
          time_in: string | null;
          notes: string | null;
          recorded_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          class_id: string;
          date: string;
          status: 'Hadir' | 'Terlambat' | 'Tidak Hadir' | 'Izin';
          time_in?: string | null;
          notes?: string | null;
          recorded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          class_id?: string;
          date?: string;
          status?: 'Hadir' | 'Terlambat' | 'Tidak Hadir' | 'Izin';
          time_in?: string | null;
          notes?: string | null;
          recorded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      attendance_sessions: {
        Row: {
          id: string;
          class_id: string;
          date: string;
          created_by: string | null;
          status: 'draft' | 'submitted' | 'finalized';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          date: string;
          created_by?: string | null;
          status?: 'draft' | 'submitted' | 'finalized';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          date?: string;
          created_by?: string | null;
          status?: 'draft' | 'submitted' | 'finalized';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      student_class_view: {
        Row: {
          id: string;
          name: string;
          nisn: string;
          gender: 'L' | 'P';
          birth_date: string | null;
          parent_name: string | null;
          parent_phone: string | null;
          class_name: string;
          level: number;
          section: string;
          teacher_name: string;
        };
      };
      attendance_summary_view: {
        Row: {
          date: string;
          class_name: string;
          student_name: string;
          nisn: string;
          status: 'Hadir' | 'Terlambat' | 'Tidak Hadir' | 'Izin';
          time_in: string | null;
          notes: string | null;
          recorded_by_name: string | null;
        };
      };
    };
  };
}

// Main Supabase client (works in both client and server contexts)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Create a new client instance (useful for avoiding singleton issues)
export const createSupabaseClient = () => createClient<Database>(supabaseUrl, supabaseAnonKey);

// Export types for use in components
export type User = Database['public']['Tables']['users']['Row'];
export type Class = Database['public']['Tables']['classes']['Row'];
export type Student = Database['public']['Tables']['students']['Row'];
export type AttendanceRecord = Database['public']['Tables']['attendance_records']['Row'];
export type AttendanceSession = Database['public']['Tables']['attendance_sessions']['Row'];
export type StudentClassView = Database['public']['Views']['student_class_view']['Row'];
export type AttendanceSummaryView = Database['public']['Views']['attendance_summary_view']['Row'];

export default supabase;
