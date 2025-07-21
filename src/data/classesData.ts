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

export interface ClassesDataStructure {
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

// Export the data from JSON
export const classesData: ClassInfo[] = loadedData.classes;
export const teachersData: Teacher[] = loadedData.teachers;
export const adminsData: Admin[] = loadedData.admins;
export const classesMetadata = loadedData.metadata;

// Combined users for authentication
export const allUsersData: User[] = [...teachersData, ...adminsData];

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

export const getClassById = (id: string): ClassInfo | undefined => {
  return classesData.find(cls => cls.id === id);
};

export const getTeacherById = (id: string): Teacher | undefined => {
  return teachersData.find(teacher => teacher.id === id);
};

export const getAdminById = (id: string): Admin | undefined => {
  return adminsData.find(admin => admin.id === id);
};

export const getUserById = (id: string): User | undefined => {
  return allUsersData.find(user => user.id === id);
};

// Authentication helper functions
export const validateTeacherCredentials = (username: string, password: string): Teacher | null => {
  const teacher = teachersData.find(t => t.username === username && t.password === password);
  return teacher || null;
};

export const validateAdminCredentials = (username: string, password: string): Admin | null => {
  const admin = adminsData.find(a => a.username === username && a.password === password);
  return admin || null;
};

export const validateUserCredentials = (username: string, password: string): User | null => {
  const user = allUsersData.find(u => u.username === username && u.password === password);
  return user || null;
};

// Type guard functions
export const isAdmin = (user: User): user is Admin => user.role === 'admin';
export const isTeacher = (user: User): user is Teacher => user.role === 'teacher';

console.log(`Loaded ${classesData.length} classes from JSON data`);
console.log(`Loaded ${teachersData.length} teachers from JSON data`);
console.log(`Loaded ${adminsData.length} admins from JSON data`);