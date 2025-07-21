// Centralized Attendance Data for Absen Digital SD
// Contains 1+ month of prepopulated attendance records

export type AttendanceStatus = 'Hadir' | 'Terlambat' | 'Tidak Hadir' | 'Izin';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  date: string; // YYYY-MM-DD format
  status: AttendanceStatus;
  timeIn?: string; // HH:MM format for present/late students
  notes?: string; // Optional notes for absences/excuses
  recordedBy: string; // Teacher/Admin who recorded
  recordedAt: string; // Timestamp when recorded
}

// Generate attendance data for December 2024 and January 2025
const generateAttendanceData = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  
  // Date range: December 1, 2024 to January 31, 2025 (weekdays only)
  const startDate = new Date('2024-12-01');
  const endDate = new Date('2025-01-31');
  
  // All classes
  const classes = ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B'];
  
  // Students per class (36 each)
  const studentsPerClass = 36;
  
  // Generate student IDs and names for each class
  const allStudents: { id: string; name: string; className: string }[] = [];
  
  classes.forEach(className => {
    for (let i = 1; i <= studentsPerClass; i++) {
      const studentId = `${className.toLowerCase()}-${i.toString().padStart(3, '0')}`;
      const names = [
        'Ahmad Rizki', 'Siti Nurhaliza', 'Budi Santoso', 'Dewi Sartika', 'Andi Wijaya',
        'Fatimah Zahra', 'Dimas Pratama', 'Indira Sari', 'Fajar Nugroho', 'Ayu Lestari',
        'Reza Firmansyah', 'Maya Putri', 'Arif Rahman', 'Sari Dewi', 'Yoga Pratama',
        'Nia Ramadhani', 'Bayu Setiawan', 'Rina Marlina', 'Eko Prasetyo', 'Dina Anggraini',
        'Hadi Kusuma', 'Lina Sari', 'Agus Salim', 'Wulan Dari', 'Irfan Hakim',
        'Sinta Bella', 'Doni Saputra', 'Mega Wati', 'Rian Hidayat', 'Tari Sari',
        'Vino Mahendra', 'Yuni Astuti', 'Zaki Maulana', 'Nisa Aulia', 'Oki Setia',
        'Putri Ayu'
      ];
      
      allStudents.push({
        id: studentId,
        name: names[i - 1] || `Siswa ${i}`,
        className
      });
    }
  });

  // Generate attendance records for each school day
  let currentDate = new Date(startDate);
  let recordId = 1;
  
  while (currentDate <= endDate) {
    // Skip weekends (Saturday = 6, Sunday = 0)
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      const dateString = currentDate.toISOString().split('T')[0];
      
      allStudents.forEach(student => {
        // Generate realistic attendance patterns
        const randomFactor = Math.random();
        let status: AttendanceStatus;
        let timeIn: string | undefined;
        let notes: string | undefined;
        
        // Attendance probability: 85% present, 8% late, 5% absent, 2% excused
        if (randomFactor < 0.85) {
          status = 'Hadir';
          // Random arrival time between 07:00-07:30
          const hour = 7;
          const minute = Math.floor(Math.random() * 31);
          timeIn = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        } else if (randomFactor < 0.93) {
          status = 'Terlambat';
          // Late arrival time between 07:31-08:30
          const hour = Math.random() < 0.7 ? 7 : 8;
          const minute = hour === 7 ? Math.floor(Math.random() * 29) + 31 : Math.floor(Math.random() * 31);
          timeIn = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          notes = 'Terlambat datang ke sekolah';
        } else if (randomFactor < 0.98) {
          status = 'Tidak Hadir';
          notes = 'Tidak hadir tanpa keterangan';
        } else {
          status = 'Izin';
          const excuses = ['Sakit', 'Keperluan keluarga', 'Acara keluarga', 'Kontrol dokter'];
          notes = excuses[Math.floor(Math.random() * excuses.length)];
        }
        
        // Determine who recorded (teacher for that class)
        const teacherNames = {
          '1A': 'Ibu Sari Dewi, S.Pd',
          '1B': 'Ibu Rina Marlina, S.Pd',
          '2A': 'Bapak Agus Salim, S.Pd',
          '2B': 'Ibu Wulan Dari, S.Pd',
          '3A': 'Ibu Sinta Bella, S.Pd',
          '3B': 'Bapak Doni Saputra, S.Pd',
          '4A': 'Ibu Mega Wati, S.Pd',
          '4B': 'Bapak Rian Hidayat, S.Pd',
          '5A': 'Ibu Tari Sari, S.Pd',
          '5B': 'Bapak Vino Mahendra, S.Pd',
          '6A': 'Ibu Yuni Astuti, S.Pd',
          '6B': 'Bapak Zaki Maulana, S.Pd'
        };
        
        records.push({
          id: `att-${recordId.toString().padStart(6, '0')}`,
          studentId: student.id,
          studentName: student.name,
          className: student.className,
          date: dateString,
          status,
          timeIn,
          notes,
          recordedBy: teacherNames[student.className as keyof typeof teacherNames],
          recordedAt: `${dateString}T08:00:00.000Z`
        });
        
        recordId++;
      });
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return records;
};

// Generate the attendance data
export const attendanceData: AttendanceRecord[] = generateAttendanceData();

// Helper functions for data access
export const getAttendanceByDate = (date: string): AttendanceRecord[] => {
  return attendanceData.filter(record => record.date === date);
};

export const getAttendanceByClass = (className: string): AttendanceRecord[] => {
  return attendanceData.filter(record => record.className === className);
};

export const getAttendanceByClassAndDate = (className: string, date: string): AttendanceRecord[] => {
  return attendanceData.filter(record => record.className === className && record.date === date);
};

export const getAttendanceByDateRange = (startDate: string, endDate: string): AttendanceRecord[] => {
  return attendanceData.filter(record => record.date >= startDate && record.date <= endDate);
};

export const getAttendanceByStudent = (studentId: string): AttendanceRecord[] => {
  return attendanceData.filter(record => record.studentId === studentId);
};

export const getAttendanceByClassAndDateRange = (className: string, startDate: string, endDate: string): AttendanceRecord[] => {
  return attendanceData.filter(record => 
    record.className === className && 
    record.date >= startDate && 
    record.date <= endDate
  );
};

// Statistics helper functions
export const calculateAttendanceStats = (records: AttendanceRecord[]) => {
  const total = records.length;
  const present = records.filter(r => r.status === 'Hadir').length;
  const late = records.filter(r => r.status === 'Terlambat').length;
  const absent = records.filter(r => r.status === 'Tidak Hadir').length;
  const excused = records.filter(r => r.status === 'Izin').length;
  
  const attendanceRate = total > 0 ? ((present + late) / total) * 100 : 0;
  
  return {
    total,
    present,
    late,
    absent,
    excused,
    attendanceRate: Math.round(attendanceRate * 100) / 100
  };
};

// Get unique dates from attendance data
export const getAvailableDates = (): string[] => {
  const dates = [...new Set(attendanceData.map(record => record.date))];
  return dates.sort();
};

// Get attendance summary by date
export const getAttendanceSummaryByDate = (date: string) => {
  const dayRecords = getAttendanceByDate(date);
  const classSummaries = [];
  
  const classes = ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B'];
  
  for (const className of classes) {
    const classRecords = dayRecords.filter(r => r.className === className);
    const stats = calculateAttendanceStats(classRecords);
    
    classSummaries.push({
      className,
      date,
      ...stats
    });
  }
  
  return classSummaries;
};

// Get attendance summary by class for date range
export const getAttendanceSummaryByClass = (className: string, startDate: string, endDate: string) => {
  const classRecords = getAttendanceByClassAndDateRange(className, startDate, endDate);
  const stats = calculateAttendanceStats(classRecords);
  
  return {
    className,
    startDate,
    endDate,
    ...stats
  };
};

console.log(`Generated ${attendanceData.length} attendance records from December 2024 to January 2025`);
console.log(`Available dates: ${getAvailableDates().length} school days`);
console.log(`Classes covered: 12 classes with 36 students each`);
