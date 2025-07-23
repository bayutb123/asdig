// Centralized Classes and Teachers Data for Absen Digital SD
// Loads data from JSON file

import classesDataJSON from './classesData.json';

export interface ClassInfo {
  id: string;
  name: string;
  grade: number;
  section: string;
  teacherId: string;
  teacherName: string;
  studentCount: number;
}

export interface Teacher {
  id: string;
  name: string;
  nip: string;
  username: string;
  password: string;
  classId: string;
  className: string;
  subject?: string;
  phone?: string;
  email?: string;
  role: 'teacher';
}

export interface Admin {
  id: string;
  name: string;
  nip: string;
  username: string;
  password: string;
  position: string;
  phone?: string;
  email?: string;
  role: 'admin';
}

export type User = Teacher | Admin;

interface ClassesDataStructure {
  metadata: {
    totalClasses: number;
    totalTeachers: number;
    totalAdmins: number;
    generatedAt: string;
  };
  classes: ClassInfo[];
  teachers: Teacher[];
  admins: Admin[];
}

// Load classes data from JSON file
const loadedData = classesDataJSON as ClassesDataStructure;

// Internal data arrays (not exported)
const classesData: ClassInfo[] = loadedData.classes;
const teachersData: Teacher[] = loadedData.teachers;
const adminsData: Admin[] = loadedData.admins;

// Combined users for authentication (internal use only)
const allUsersData: User[] = [...teachersData, ...adminsData];

// Helper functions
export const getAllClasses = (): ClassInfo[] => {
  return classesData;
};

export const getAllTeachers = (): Teacher[] => {
  return teachersData;
};

export const getAllAdmins = (): Admin[] => {
  return adminsData;
};

// Authentication helper function
export const validateUserCredentials = (username: string, password: string): User | null => {
  const user = allUsersData.find(u => u.username === username && u.password === password);
  return user || null;
};

// Type guard functions
export const isAdmin = (user: User): user is Admin => user.role === 'admin';
export const isTeacher = (user: User): user is Teacher => user.role === 'teacher';

if (process.env.NODE_ENV === 'development') {
  console.log(`Loaded ${classesData.length} classes from JSON data`);
  console.log(`Loaded ${teachersData.length} teachers from JSON data`);
  console.log(`Loaded ${adminsData.length} admins from JSON data`);
}