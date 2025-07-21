// Types for class data
export interface ClassInfo {
  id: string;
  name: string;
  level: string;
  track: 'IPA' | 'IPS';
  teacherId: string;
  teacherName: string;
  teacherNip: string;
  academicYear: string;
  semester: number;
  maxStudents: number;
  currentStudents: number;
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
    subject?: string;
  }[];
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
}

// Centralized classes data
export const classesData: ClassInfo[] = [
  {
    id: 'class-001',
    name: '12 IPA 1',
    level: '12',
    track: 'IPA',
    teacherId: 'teacher-001',
    teacherName: 'Ibu Sari Dewi, S.Pd',
    teacherNip: '196805151994032001',
    academicYear: '2024/2025',
    semester: 1,
    maxStudents: 36,
    currentStudents: 6,
    schedule: [
      { day: 'Senin', startTime: '07:00', endTime: '15:30', subject: 'Matematika' },
      { day: 'Selasa', startTime: '07:00', endTime: '15:30', subject: 'Fisika' },
      { day: 'Rabu', startTime: '07:00', endTime: '15:30', subject: 'Kimia' },
      { day: 'Kamis', startTime: '07:00', endTime: '15:30', subject: 'Biologi' },
      { day: 'Jumat', startTime: '07:00', endTime: '11:30', subject: 'Bahasa Indonesia' },
    ]
  },
  {
    id: 'class-002',
    name: '12 IPA 2',
    level: '12',
    track: 'IPA',
    teacherId: 'teacher-002',
    teacherName: 'Bapak Ahmad Wijaya, S.Pd',
    teacherNip: '197203101998021001',
    academicYear: '2024/2025',
    semester: 1,
    maxStudents: 36,
    currentStudents: 6,
    schedule: [
      { day: 'Senin', startTime: '07:00', endTime: '15:30', subject: 'Matematika' },
      { day: 'Selasa', startTime: '07:00', endTime: '15:30', subject: 'Fisika' },
      { day: 'Rabu', startTime: '07:00', endTime: '15:30', subject: 'Kimia' },
      { day: 'Kamis', startTime: '07:00', endTime: '15:30', subject: 'Biologi' },
      { day: 'Jumat', startTime: '07:00', endTime: '11:30', subject: 'Bahasa Inggris' },
    ]
  },
  {
    id: 'class-003',
    name: '12 IPS 1',
    level: '12',
    track: 'IPS',
    teacherId: 'teacher-003',
    teacherName: 'Ibu Maya Sari, S.Pd',
    teacherNip: '198009251999032002',
    academicYear: '2024/2025',
    semester: 1,
    maxStudents: 36,
    currentStudents: 6,
    schedule: [
      { day: 'Senin', startTime: '07:00', endTime: '15:30', subject: 'Sejarah' },
      { day: 'Selasa', startTime: '07:00', endTime: '15:30', subject: 'Geografi' },
      { day: 'Rabu', startTime: '07:00', endTime: '15:30', subject: 'Ekonomi' },
      { day: 'Kamis', startTime: '07:00', endTime: '15:30', subject: 'Sosiologi' },
      { day: 'Jumat', startTime: '07:00', endTime: '11:30', subject: 'Bahasa Indonesia' },
    ]
  },
  {
    id: 'class-004',
    name: '12 IPS 2',
    level: '12',
    track: 'IPS',
    teacherId: 'teacher-004',
    teacherName: 'Bapak Dedi Kurniawan, S.Pd',
    teacherNip: '197512081999031001',
    academicYear: '2024/2025',
    semester: 1,
    maxStudents: 36,
    currentStudents: 6,
    schedule: [
      { day: 'Senin', startTime: '07:00', endTime: '15:30', subject: 'Sejarah' },
      { day: 'Selasa', startTime: '07:00', endTime: '15:30', subject: 'Geografi' },
      { day: 'Rabu', startTime: '07:00', endTime: '15:30', subject: 'Ekonomi' },
      { day: 'Kamis', startTime: '07:00', endTime: '15:30', subject: 'Sosiologi' },
      { day: 'Jumat', startTime: '07:00', endTime: '11:30', subject: 'PKN' },
    ]
  }
];

// Centralized teachers data
export const teachersData: Teacher[] = [
  {
    id: 'teacher-001',
    name: 'Ibu Sari Dewi, S.Pd',
    nip: '196805151994032001',
    username: 'walikelas1',
    password: 'password123',
    classId: 'class-001',
    className: '12 IPA 1',
    subject: 'Matematika',
    phone: '081234567890',
    email: 'sari.dewi@sekolah.sch.id'
  },
  {
    id: 'teacher-002',
    name: 'Bapak Ahmad Wijaya, S.Pd',
    nip: '197203101998021001',
    username: 'walikelas2',
    password: 'password123',
    classId: 'class-002',
    className: '12 IPA 2',
    subject: 'Fisika',
    phone: '081234567891',
    email: 'ahmad.wijaya@sekolah.sch.id'
  },
  {
    id: 'teacher-003',
    name: 'Ibu Maya Sari, S.Pd',
    nip: '198009251999032002',
    username: 'walikelas3',
    password: 'password123',
    classId: 'class-003',
    className: '12 IPS 1',
    subject: 'Sejarah',
    phone: '081234567892',
    email: 'maya.sari@sekolah.sch.id'
  },
  {
    id: 'teacher-004',
    name: 'Bapak Dedi Kurniawan, S.Pd',
    nip: '197512081999031001',
    username: 'walikelas4',
    password: 'password123',
    classId: 'class-004',
    className: '12 IPS 2',
    subject: 'Geografi',
    phone: '081234567893',
    email: 'dedi.kurniawan@sekolah.sch.id'
  }
];

// Helper functions for class management
export const getClassById = (classId: string): ClassInfo | undefined => {
  return classesData.find(cls => cls.id === classId);
};

export const getClassByName = (className: string): ClassInfo | undefined => {
  return classesData.find(cls => cls.name === className);
};

export const getTeacherById = (teacherId: string): Teacher | undefined => {
  return teachersData.find(teacher => teacher.id === teacherId);
};

export const getTeacherByUsername = (username: string): Teacher | undefined => {
  return teachersData.find(teacher => teacher.username === username);
};

export const getTeacherByClassId = (classId: string): Teacher | undefined => {
  return teachersData.find(teacher => teacher.classId === classId);
};

export const getClassesByTrack = (track: 'IPA' | 'IPS'): ClassInfo[] => {
  return classesData.filter(cls => cls.track === track);
};

export const getClassesByLevel = (level: string): ClassInfo[] => {
  return classesData.filter(cls => cls.level === level);
};

export const getAllClassNames = (): string[] => {
  return classesData.map(cls => cls.name);
};

export const getAllTeachers = (): Teacher[] => {
  return teachersData;
};

export const getAllClasses = (): ClassInfo[] => {
  return classesData;
};

// Statistics functions
export const getClassStatistics = () => {
  return {
    totalClasses: classesData.length,
    totalTeachers: teachersData.length,
    totalStudents: classesData.reduce((sum, cls) => sum + cls.currentStudents, 0),
    maxCapacity: classesData.reduce((sum, cls) => sum + cls.maxStudents, 0),
    ipaClasses: getClassesByTrack('IPA').length,
    ipsClasses: getClassesByTrack('IPS').length,
    averageStudentsPerClass: Math.round(
      classesData.reduce((sum, cls) => sum + cls.currentStudents, 0) / classesData.length
    )
  };
};

// Validation functions
export const validateTeacherCredentials = (username: string, password: string): Teacher | null => {
  const teacher = getTeacherByUsername(username);
  if (teacher && teacher.password === password) {
    return teacher;
  }
  return null;
};

export const isValidClassName = (className: string): boolean => {
  return classesData.some(cls => cls.name === className);
};

export const isValidTeacherId = (teacherId: string): boolean => {
  return teachersData.some(teacher => teacher.id === teacherId);
};
