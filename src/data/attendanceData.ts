// Centralized Attendance Data for Absen Digital SD
// Loads attendance data from JSON file

import attendanceDataJSON from './attendanceData.json';

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

export interface AttendanceDataStructure {
  metadata: {
    generatedAt: string;
    totalRecords: number;
    dateRange: {
      start: string;
      end: string;
    };
    schoolDays: number;
    classes: string[];
    studentsPerClass: number;
    totalStudents: number;
    attendancePatterns: {
      present: number;
      late: number;
      absent: number;
      excused: number;
    };
  };
  students: Array<{
    id: string;
    name: string;
    className: string;
  }>;
  teachers: Record<string, string>;
  excuseReasons: string[];
  attendanceRecords: AttendanceRecord[];
}

// Load attendance data from JSON file
const loadedData = attendanceDataJSON as AttendanceDataStructure;

// Export the attendance records from JSON
export const attendanceData: AttendanceRecord[] = loadedData.attendanceRecords;

// Export metadata and other data
export const attendanceMetadata = loadedData.metadata;
export const studentsData = loadedData.students;
export const teachersData = loadedData.teachers;
export const excuseReasonsData = loadedData.excuseReasons;

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

// Get attendance data for the last N days
export const getAttendanceForLastDays = (days: number = 30): AttendanceRecord[] => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  return getAttendanceByDateRange(startDateStr, endDateStr);
};

// Get attendance data for the last 30 days (convenience function)
export const getAttendanceForLast30Days = (): AttendanceRecord[] => {
  return getAttendanceForLastDays(30);
};

// Get attendance data for the last N days by class
export const getAttendanceForLastDaysByClass = (className: string, days: number = 30): AttendanceRecord[] => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  return getAttendanceByClassAndDateRange(className, startDateStr, endDateStr);
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

// Calculate statistics based on unique students (for class summaries)
export const calculateClassAttendanceStats = (records: AttendanceRecord[]) => {
  // Get unique students and dates from the records
  const uniqueStudents = [...new Set(records.map(r => r.studentId))];
  const uniqueDates = [...new Set(records.map(r => r.date))];
  const totalStudents = uniqueStudents.length;
  const totalDays = uniqueDates.length;

  if (totalStudents === 0 || totalDays === 0) {
    return {
      totalStudents: 0,
      present: 0,
      late: 0,
      absent: 0,
      excused: 0,
      attendanceRate: 0
    };
  }

  // Calculate daily averages
  let totalPresentCount = 0;
  let totalLateCount = 0;
  let totalAbsentCount = 0;
  let totalExcusedCount = 0;

  // For each date, count the attendance status
  uniqueDates.forEach(date => {
    const dayRecords = records.filter(r => r.date === date);
    const presentOnTime = dayRecords.filter(r => r.status === 'Hadir').length;
    const lateStudents = dayRecords.filter(r => r.status === 'Terlambat').length;

    // Include late students in present count
    totalPresentCount += (presentOnTime + lateStudents);
    totalLateCount += lateStudents; // Keep separate count for detailed stats
    totalAbsentCount += dayRecords.filter(r => r.status === 'Tidak Hadir').length;
    totalExcusedCount += dayRecords.filter(r => r.status === 'Izin').length;
  });

  // Calculate averages per day
  const avgPresent = Math.round((totalPresentCount / totalDays) * 100) / 100;
  const avgLate = Math.round((totalLateCount / totalDays) * 100) / 100;
  const avgAbsent = Math.round((totalAbsentCount / totalDays) * 100) / 100;
  const avgExcused = Math.round((totalExcusedCount / totalDays) * 100) / 100;

  const totalRecords = totalPresentCount + totalLateCount + totalAbsentCount + totalExcusedCount;
  const attendanceRate = totalRecords > 0 ? ((totalPresentCount + totalLateCount) / totalRecords) * 100 : 0;

  return {
    totalStudents,
    present: avgPresent,
    late: avgLate,
    absent: avgAbsent,
    excused: avgExcused,
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

console.log(`Loaded ${attendanceData.length} attendance records from JSON data (Last 30 days)`);
console.log(`Date range: ${attendanceMetadata.dateRange.start} to ${attendanceMetadata.dateRange.end}`);
console.log(`Available dates: ${getAvailableDates().length} school days`);
console.log(`Classes covered: ${attendanceMetadata.classes.length} classes with ${attendanceMetadata.studentsPerClass} students each`);
