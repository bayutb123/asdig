-- Row Level Security (RLS) Policies for Absen Digital
-- Ensures data security based on user roles and permissions

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM users 
    WHERE username = current_setting('request.jwt.claims', true)::json->>'username'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get current user's ID
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT id 
    FROM users 
    WHERE username = current_setting('request.jwt.claims', true)::json->>'username'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users table policies
CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert users" ON users
  FOR INSERT WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Admins can update all users, teachers can update themselves" ON users
  FOR UPDATE USING (
    get_user_role() = 'admin' OR 
    id = get_current_user_id()
  );

CREATE POLICY "Only admins can delete users" ON users
  FOR DELETE USING (get_user_role() = 'admin');

-- Classes table policies
CREATE POLICY "Users can view all classes" ON classes
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert classes" ON classes
  FOR INSERT WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Admins can update all classes, teachers can update their own" ON classes
  FOR UPDATE USING (
    get_user_role() = 'admin' OR 
    teacher_id = get_current_user_id()
  );

CREATE POLICY "Only admins can delete classes" ON classes
  FOR DELETE USING (get_user_role() = 'admin');

-- Students table policies
CREATE POLICY "Users can view all students" ON students
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert students" ON students
  FOR INSERT WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Admins can update all students, teachers can update their class students" ON students
  FOR UPDATE USING (
    get_user_role() = 'admin' OR 
    class_id IN (
      SELECT id FROM classes WHERE teacher_id = get_current_user_id()
    )
  );

CREATE POLICY "Only admins can delete students" ON students
  FOR DELETE USING (get_user_role() = 'admin');

-- Attendance records policies
CREATE POLICY "Users can view attendance records" ON attendance_records
  FOR SELECT USING (
    get_user_role() = 'admin' OR
    class_id IN (
      SELECT id FROM classes WHERE teacher_id = get_current_user_id()
    )
  );

CREATE POLICY "Teachers can insert attendance for their classes" ON attendance_records
  FOR INSERT WITH CHECK (
    get_user_role() = 'admin' OR
    class_id IN (
      SELECT id FROM classes WHERE teacher_id = get_current_user_id()
    )
  );

CREATE POLICY "Teachers can update attendance for their classes" ON attendance_records
  FOR UPDATE USING (
    get_user_role() = 'admin' OR
    class_id IN (
      SELECT id FROM classes WHERE teacher_id = get_current_user_id()
    )
  );

CREATE POLICY "Teachers can delete attendance for their classes" ON attendance_records
  FOR DELETE USING (
    get_user_role() = 'admin' OR
    class_id IN (
      SELECT id FROM classes WHERE teacher_id = get_current_user_id()
    )
  );

-- Attendance sessions policies
CREATE POLICY "Users can view attendance sessions" ON attendance_sessions
  FOR SELECT USING (
    get_user_role() = 'admin' OR
    class_id IN (
      SELECT id FROM classes WHERE teacher_id = get_current_user_id()
    )
  );

CREATE POLICY "Teachers can manage attendance sessions for their classes" ON attendance_sessions
  FOR ALL USING (
    get_user_role() = 'admin' OR
    class_id IN (
      SELECT id FROM classes WHERE teacher_id = get_current_user_id()
    )
  );
