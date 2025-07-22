// Student data for all classes in SD
// Loads student data from JSON file

import studentsDataJSON from './studentsData.json';

export interface Student {
  id: string;
  name: string;
  class: string;
  nisn: string;
  gender: 'L' | 'P';
  birthDate: string;
  address: string;
  parentName: string;
  parentPhone: string;
  status: 'Hadir' | 'Terlambat' | 'Tidak Hadir' | 'Izin';
  checkInTime?: string; // Optional for manual attendance functionality
  notes?: string; // Optional for attendance notes
}

export interface StudentsDataStructure {
  metadata: {
    totalStudents: number;
    totalClasses: number;
    studentsPerClass: number;
    generatedAt: string;
  };
  students: Student[];
}

// Load students data from JSON file
const loadedData = studentsDataJSON as StudentsDataStructure;

// Export the students data from JSON
export const allStudentsData: Student[] = loadedData.students;

// Export metadata
export const studentsMetadata = loadedData.metadata;
// Helper function to get students by class
export const getStudentsByClass = (className: string): Student[] => {
  return allStudentsData.filter(student => student.class === className);
};

// Helper function to get student by ID
export const getStudentById = (id: string): Student | undefined => {
  return allStudentsData.find(student => student.id === id);
};

// Helper function to get all classes
export const getAllClasses = (): string[] => {
  const classes = [...new Set(allStudentsData.map(student => student.class))];
  return classes.sort();
};

// Helper function to get total students count
export const getTotalStudents = (): number => {
  return allStudentsData.length;
};

// Helper function to get students count by class
export const getStudentsCountByClass = (className: string): number => {
  return getStudentsByClass(className).length;
};

if (process.env.NODE_ENV === 'development') {
  console.log(`Loaded ${allStudentsData.length} students from JSON data`);
  console.log(`Classes: ${getAllClasses().join(', ')}`);
  console.log(`Students per class: ${studentsMetadata.studentsPerClass}`);
}

// Helper function to get class statistics
export const getClassStatistics = (className: string) => {
  const classStudents = getStudentsByClass(className);
  return {
    total: classStudents.length,
    present: classStudents.filter(s => s.status === 'Hadir').length,
    absent: classStudents.filter(s => s.status === 'Tidak Hadir').length,
    late: classStudents.filter(s => s.status === 'Terlambat').length,
    excused: classStudents.filter(s => s.status === 'Izin').length
  };
};
