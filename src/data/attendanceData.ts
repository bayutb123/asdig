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

console.log(`Loaded ${attendanceData.length} attendance records from JSON data`);
console.log(`Date range: ${attendanceMetadata.dateRange.start} to ${attendanceMetadata.dateRange.end}`);
console.log(`Available dates: ${getAvailableDates().length} school days`);
console.log(`Classes covered: ${attendanceMetadata.classes.length} classes with ${attendanceMetadata.studentsPerClass} students each`);
