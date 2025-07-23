-- Seed data for Absen Digital
-- Migrates existing JSON data to Supabase

-- Insert admin users
INSERT INTO users (id, email, name, role, nip, phone, username, password_hash) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'admin@asdig.school', 'Administrator', 'admin', 'ADM001', '081234567890', 'admin', '$2b$10$example_hash_admin'),
  ('550e8400-e29b-41d4-a716-446655440002', 'kepala.sekolah@asdig.school', 'Kepala Sekolah', 'admin', 'KS001', '081234567891', 'kepala_sekolah', '$2b$10$example_hash_kepala');

-- Insert teacher users
INSERT INTO users (id, email, name, role, nip, phone, username, password_hash) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 'siti.nurhaliza@asdig.school', 'Siti Nurhaliza', 'teacher', 'GR001', '081234567892', 'siti_nurhaliza', '$2b$10$example_hash_siti'),
  ('550e8400-e29b-41d4-a716-446655440004', 'ahmad.fauzi@asdig.school', 'Ahmad Fauzi', 'teacher', 'GR002', '081234567893', 'ahmad_fauzi', '$2b$10$example_hash_ahmad'),
  ('550e8400-e29b-41d4-a716-446655440005', 'rina.sari@asdig.school', 'Rina Sari', 'teacher', 'GR003', '081234567894', 'rina_sari', '$2b$10$example_hash_rina'),
  ('550e8400-e29b-41d4-a716-446655440006', 'budi.santoso@asdig.school', 'Budi Santoso', 'teacher', 'GR004', '081234567895', 'budi_santoso', '$2b$10$example_hash_budi'),
  ('550e8400-e29b-41d4-a716-446655440007', 'dewi.lestari@asdig.school', 'Dewi Lestari', 'teacher', 'GR005', '081234567896', 'dewi_lestari', '$2b$10$example_hash_dewi'),
  ('550e8400-e29b-41d4-a716-446655440008', 'hendra.wijaya@asdig.school', 'Hendra Wijaya', 'teacher', 'GR006', '081234567897', 'hendra_wijaya', '$2b$10$example_hash_hendra');

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
  ('750e8400-e29b-41d4-a716-446655440003', 'Riko Saputra', '1234567890123458', '650e8400-e29b-41d4-a716-446655440001', 'L', '2017-07-10', 'Jl. Diponegoro No. 3', 'Saputra Riko', '081234567803');

-- Kelas 2A students
INSERT INTO students (id, name, nisn, class_id, gender, birth_date, address, parent_name, parent_phone) VALUES
  ('750e8400-e29b-41d4-a716-446655440004', 'Maya Putri', '1234567890123459', '650e8400-e29b-41d4-a716-446655440002', 'P', '2016-02-12', 'Jl. Gatot Subroto No. 4', 'Putri Maya', '081234567804'),
  ('750e8400-e29b-41d4-a716-446655440005', 'Doni Hermawan', '1234567890123460', '650e8400-e29b-41d4-a716-446655440002', 'L', '2016-04-18', 'Jl. Ahmad Yani No. 5', 'Hermawan Doni', '081234567805'),
  ('750e8400-e29b-41d4-a716-446655440006', 'Lina Sari', '1234567890123461', '650e8400-e29b-41d4-a716-446655440002', 'P', '2016-06-25', 'Jl. Pahlawan No. 6', 'Sari Lina', '081234567806');

-- Insert sample attendance records for the last 7 days
INSERT INTO attendance_records (student_id, class_id, date, status, time_in, recorded_by) VALUES
  -- Today's attendance
  ('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, 'Hadir', '07:30:00', '550e8400-e29b-41d4-a716-446655440003'),
  ('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, 'Hadir', '07:25:00', '550e8400-e29b-41d4-a716-446655440003'),
  ('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, 'Terlambat', '08:15:00', '550e8400-e29b-41d4-a716-446655440003'),
  
  -- Yesterday's attendance
  ('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', CURRENT_DATE - INTERVAL '1 day', 'Hadir', '07:20:00', '550e8400-e29b-41d4-a716-446655440003'),
  ('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', CURRENT_DATE - INTERVAL '1 day', 'Izin', NULL, '550e8400-e29b-41d4-a716-446655440003'),
  ('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', CURRENT_DATE - INTERVAL '1 day', 'Hadir', '07:35:00', '550e8400-e29b-41d4-a716-446655440003');

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
