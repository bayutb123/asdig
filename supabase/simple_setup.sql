-- SIMPLIFIED SUPABASE SETUP FOR ABSEN DIGITAL (NO RLS)
-- Copy and paste this entire file into Supabase SQL Editor and run it
-- This version disables RLS for easier development and testing

-- =====================================================
-- PART 1: INITIAL SCHEMA
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (Teachers and Admins)
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('admin', 'teacher')) NOT NULL,
  nip VARCHAR(50) UNIQUE,
  phone VARCHAR(20),
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Classes table
CREATE TABLE classes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 6),
  section VARCHAR(1) NOT NULL CHECK (section IN ('A', 'B', 'C')),
  teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
  max_students INTEGER DEFAULT 36 CHECK (max_students > 0),
  academic_year VARCHAR(20) DEFAULT '2024/2025',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(level, section, academic_year)
);

-- Students table
CREATE TABLE students (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  nisn VARCHAR(20) UNIQUE NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  gender VARCHAR(1) CHECK (gender IN ('L', 'P')) NOT NULL,
  birth_date DATE,
  address TEXT,
  parent_name VARCHAR(255),
  parent_phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attendance records table
CREATE TABLE attendance_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  status VARCHAR(20) CHECK (status IN ('Hadir', 'Terlambat', 'Tidak Hadir', 'Izin')) NOT NULL,
  time_in TIME,
  notes TEXT,
  recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- Attendance sessions table (for bulk attendance entry)
CREATE TABLE attendance_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'finalized')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, date)
);

-- Create indexes for better performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_classes_teacher ON classes(teacher_id);
CREATE INDEX idx_classes_active ON classes(is_active);
CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_students_nisn ON students(nisn);
CREATE INDEX idx_attendance_student_date ON attendance_records(student_id, date);
CREATE INDEX idx_attendance_class_date ON attendance_records(class_id, date);
CREATE INDEX idx_attendance_date ON attendance_records(date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_records_updated_at BEFORE UPDATE ON attendance_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_sessions_updated_at BEFORE UPDATE ON attendance_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PART 2: DISABLE RLS (FOR DEVELOPMENT)
-- =====================================================

-- Disable RLS on all tables for easier development
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_sessions DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- PART 3: SEED DATA
-- =====================================================

-- Insert admin users
INSERT INTO users (id, email, name, role, nip, phone, username, password_hash) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'admin@asdig.school', 'Administrator', 'admin', 'ADM001', '081234567890', 'admin', 'admin123'),
  ('550e8400-e29b-41d4-a716-446655440002', 'kepala.sekolah@asdig.school', 'Kepala Sekolah', 'admin', 'KS001', '081234567891', 'kepala_sekolah', 'admin123');

-- Insert teacher users
INSERT INTO users (id, email, name, role, nip, phone, username, password_hash) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 'siti.nurhaliza@asdig.school', 'Siti Nurhaliza', 'teacher', 'GR001', '081234567892', 'siti_nurhaliza', 'teacher123'),
  ('550e8400-e29b-41d4-a716-446655440004', 'ahmad.fauzi@asdig.school', 'Ahmad Fauzi', 'teacher', 'GR002', '081234567893', 'ahmad_fauzi', 'teacher123'),
  ('550e8400-e29b-41d4-a716-446655440005', 'rina.sari@asdig.school', 'Rina Sari', 'teacher', 'GR003', '081234567894', 'rina_sari', 'teacher123'),
  ('550e8400-e29b-41d4-a716-446655440006', 'budi.santoso@asdig.school', 'Budi Santoso', 'teacher', 'GR004', '081234567895', 'budi_santoso', 'teacher123'),
  ('550e8400-e29b-41d4-a716-446655440007', 'dewi.lestari@asdig.school', 'Dewi Lestari', 'teacher', 'GR005', '081234567896', 'dewi_lestari', 'teacher123'),
  ('550e8400-e29b-41d4-a716-446655440008', 'hendra.wijaya@asdig.school', 'Hendra Wijaya', 'teacher', 'GR006', '081234567897', 'hendra_wijaya', 'teacher123');

-- Insert classes
INSERT INTO classes (id, name, level, section, teacher_id, max_students, academic_year) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'Kelas 1A', 1, 'A', '550e8400-e29b-41d4-a716-446655440003', 36, '2024/2025'),
  ('650e8400-e29b-41d4-a716-446655440002', 'Kelas 2A', 2, 'A', '550e8400-e29b-41d4-a716-446655440004', 36, '2024/2025'),
  ('650e8400-e29b-41d4-a716-446655440003', 'Kelas 3A', 3, 'A', '550e8400-e29b-41d4-a716-446655440005', 36, '2024/2025'),
  ('650e8400-e29b-41d4-a716-446655440004', 'Kelas 4A', 4, 'A', '550e8400-e29b-41d4-a716-446655440006', 36, '2024/2025'),
  ('650e8400-e29b-41d4-a716-446655440005', 'Kelas 5A', 5, 'A', '550e8400-e29b-41d4-a716-446655440007', 36, '2024/2025'),
  ('650e8400-e29b-41d4-a716-446655440006', 'Kelas 6A', 6, 'A', '550e8400-e29b-41d4-a716-446655440008', 36, '2024/2025');

-- Insert sample students for each class
-- Kelas 1A students
INSERT INTO students (id, name, nisn, class_id, gender, birth_date, address, parent_name, parent_phone) VALUES
  ('750e8400-e29b-41d4-a716-446655440001', 'Andi Pratama', '1234567890123456', '650e8400-e29b-41d4-a716-446655440001', 'L', '2017-03-15', 'Jl. Merdeka No. 1', 'Budi Pratama', '081234567801'),
  ('750e8400-e29b-41d4-a716-446655440002', 'Sari Indah', '1234567890123457', '650e8400-e29b-41d4-a716-446655440001', 'P', '2017-05-20', 'Jl. Sudirman No. 2', 'Indah Sari', '081234567802'),
  ('750e8400-e29b-41d4-a716-446655440003', 'Riko Saputra', '1234567890123458', '650e8400-e29b-41d4-a716-446655440001', 'L', '2017-07-10', 'Jl. Diponegoro No. 3', 'Saputra Riko', '081234567803'),
  ('750e8400-e29b-41d4-a716-446655440004', 'Maya Putri', '1234567890123459', '650e8400-e29b-41d4-a716-446655440001', 'P', '2017-02-12', 'Jl. Gatot Subroto No. 4', 'Putri Maya', '081234567804'),
  ('750e8400-e29b-41d4-a716-446655440005', 'Doni Hermawan', '1234567890123460', '650e8400-e29b-41d4-a716-446655440001', 'L', '2017-04-18', 'Jl. Ahmad Yani No. 5', 'Hermawan Doni', '081234567805');

-- Kelas 2A students
INSERT INTO students (id, name, nisn, class_id, gender, birth_date, address, parent_name, parent_phone) VALUES
  ('750e8400-e29b-41d4-a716-446655440006', 'Lina Sari', '1234567890123461', '650e8400-e29b-41d4-a716-446655440002', 'P', '2016-06-25', 'Jl. Pahlawan No. 6', 'Sari Lina', '081234567806'),
  ('750e8400-e29b-41d4-a716-446655440007', 'Bayu Adi', '1234567890123462', '650e8400-e29b-41d4-a716-446655440002', 'L', '2016-08-30', 'Jl. Veteran No. 7', 'Adi Bayu', '081234567807'),
  ('750e8400-e29b-41d4-a716-446655440008', 'Citra Dewi', '1234567890123463', '650e8400-e29b-41d4-a716-446655440002', 'P', '2016-01-14', 'Jl. Kartini No. 8', 'Dewi Citra', '081234567808');

-- Insert sample attendance records for the last 7 days
INSERT INTO attendance_records (student_id, class_id, date, status, time_in, recorded_by) VALUES
  -- Today's attendance for Kelas 1A
  ('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, 'Hadir', '07:30:00', '550e8400-e29b-41d4-a716-446655440003'),
  ('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, 'Hadir', '07:25:00', '550e8400-e29b-41d4-a716-446655440003'),
  ('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, 'Terlambat', '08:15:00', '550e8400-e29b-41d4-a716-446655440003'),
  ('750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, 'Hadir', '07:20:00', '550e8400-e29b-41d4-a716-446655440003'),
  ('750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, 'Izin', NULL, '550e8400-e29b-41d4-a716-446655440003'),

  -- Yesterday's attendance for Kelas 1A
  ('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', CURRENT_DATE - INTERVAL '1 day', 'Hadir', '07:20:00', '550e8400-e29b-41d4-a716-446655440003'),
  ('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', CURRENT_DATE - INTERVAL '1 day', 'Hadir', '07:30:00', '550e8400-e29b-41d4-a716-446655440003'),
  ('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', CURRENT_DATE - INTERVAL '1 day', 'Hadir', '07:35:00', '550e8400-e29b-41d4-a716-446655440003'),
  ('750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440001', CURRENT_DATE - INTERVAL '1 day', 'Tidak Hadir', NULL, '550e8400-e29b-41d4-a716-446655440003'),
  ('750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440001', CURRENT_DATE - INTERVAL '1 day', 'Hadir', '07:40:00', '550e8400-e29b-41d4-a716-446655440003'),

  -- Today's attendance for Kelas 2A
  ('750e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440002', CURRENT_DATE, 'Hadir', '07:25:00', '550e8400-e29b-41d4-a716-446655440004'),
  ('750e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440002', CURRENT_DATE, 'Hadir', '07:30:00', '550e8400-e29b-41d4-a716-446655440004'),
  ('750e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440002', CURRENT_DATE, 'Terlambat', '08:10:00', '550e8400-e29b-41d4-a716-446655440004');

-- Create views for easier data access
CREATE VIEW student_class_view AS
SELECT
  s.id,
  s.name,
  s.nisn,
  s.gender,
  s.birth_date,
  s.parent_name,
  s.parent_phone,
  c.name as class_name,
  c.level,
  c.section,
  u.name as teacher_name
FROM students s
JOIN classes c ON s.class_id = c.id
JOIN users u ON c.teacher_id = u.id
WHERE s.is_active = true AND c.is_active = true;

CREATE VIEW attendance_summary_view AS
SELECT
  ar.date,
  c.name as class_name,
  s.name as student_name,
  s.nisn,
  ar.status,
  ar.time_in,
  ar.notes,
  u.name as recorded_by_name
FROM attendance_records ar
JOIN students s ON ar.student_id = s.id
JOIN classes c ON ar.class_id = c.id
LEFT JOIN users u ON ar.recorded_by = u.id
ORDER BY ar.date DESC, c.name, s.name;

-- =====================================================
-- SETUP COMPLETE! (SIMPLIFIED VERSION)
-- =====================================================
--
-- Your database is now ready with:
-- ✅ 5 Tables: users, classes, students, attendance_records, attendance_sessions
-- ✅ 2 Views: student_class_view, attendance_summary_view
-- ✅ NO Row Level Security (disabled for easier development)
-- ✅ Sample data with 8 users, 6 classes, 8 students
-- ✅ Sample attendance records for testing
--
-- Default Login Credentials:
-- Admin: username='admin', password='admin123'
-- Teacher: username='siti_nurhaliza', password='teacher123'
--
-- Next: Start your application with npm run dev!
-- =====================================================
