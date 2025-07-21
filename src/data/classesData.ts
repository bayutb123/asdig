// Types for class data
export interface ClassInfo {
  id: string;
  name: string;
  level: string;
  section: 'A' | 'B';
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

// Centralized classes data - Elementary School (Sekolah Dasar)
export const classesData: ClassInfo[] = [
  // Kelas 1
  {
    id: 'class-001',
    name: '1A',
    level: '1',
    section: 'A',
    teacherId: 'teacher-001',
    teacherName: 'Ibu Sari Dewi, S.Pd',
    teacherNip: '196805151994032001',
    academicYear: '2024/2025',
    semester: 1,
    maxStudents: 36,
    currentStudents: 36,
    schedule: [
      { day: 'Senin', startTime: '07:00', endTime: '12:00', subject: 'Tematik' },
      { day: 'Selasa', startTime: '07:00', endTime: '12:00', subject: 'Tematik' },
      { day: 'Rabu', startTime: '07:00', endTime: '12:00', subject: 'Tematik' },
      { day: 'Kamis', startTime: '07:00', endTime: '12:00', subject: 'Tematik' },
      { day: 'Jumat', startTime: '07:00', endTime: '11:00', subject: 'Tematik' },
    ]
  },
  {
    id: 'class-002',
    name: '1B',
    level: '1',
    section: 'B',
    teacherId: 'teacher-002',
    teacherName: 'Ibu Maya Sari, S.Pd',
    teacherNip: '198009251999032002',
    academicYear: '2024/2025',
    semester: 1,
    maxStudents: 36,
    currentStudents: 36,
    schedule: [
      { day: 'Senin', startTime: '07:00', endTime: '12:00', subject: 'Tematik' },
      { day: 'Selasa', startTime: '07:00', endTime: '12:00', subject: 'Tematik' },
      { day: 'Rabu', startTime: '07:00', endTime: '12:00', subject: 'Tematik' },
      { day: 'Kamis', startTime: '07:00', endTime: '12:00', subject: 'Tematik' },
      { day: 'Jumat', startTime: '07:00', endTime: '11:00', subject: 'Tematik' },
    ]
  },
  // Kelas 2
  {
    id: 'class-003',
    name: '2A',
    level: '2',
    section: 'A',
    teacherId: 'teacher-003',
    teacherName: 'Bapak Ahmad Wijaya, S.Pd',
    teacherNip: '197203101998021001',
    academicYear: '2024/2025',
    semester: 1,
    maxStudents: 36,
    currentStudents: 36,
    schedule: [
      { day: 'Senin', startTime: '07:00', endTime: '12:00', subject: 'Tematik' },
      { day: 'Selasa', startTime: '07:00', endTime: '12:00', subject: 'Tematik' },
      { day: 'Rabu', startTime: '07:00', endTime: '12:00', subject: 'Tematik' },
      { day: 'Kamis', startTime: '07:00', endTime: '12:00', subject: 'Tematik' },
      { day: 'Jumat', startTime: '07:00', endTime: '11:00', subject: 'Tematik' },
    ]
  },
  {
    id: 'class-004',
    name: '2B',
    level: '2',
    section: 'B',
    teacherId: 'teacher-004',
    teacherName: 'Ibu Rina Maharani, S.Pd',
    teacherNip: '197512081999031001',
    academicYear: '2024/2025',
    semester: 1,
    maxStudents: 36,
    currentStudents: 36,
    schedule: [
      { day: 'Senin', startTime: '07:00', endTime: '12:00', subject: 'Tematik' },
      { day: 'Selasa', startTime: '07:00', endTime: '12:00', subject: 'Tematik' },
      { day: 'Rabu', startTime: '07:00', endTime: '12:00', subject: 'Tematik' },
      { day: 'Kamis', startTime: '07:00', endTime: '12:00', subject: 'Tematik' },
      { day: 'Jumat', startTime: '07:00', endTime: '11:00', subject: 'Tematik' },
    ]
  },
  // Kelas 3
  {
    id: 'class-005',
    name: '3A',
    level: '3',
    section: 'A',
    teacherId: 'teacher-005',
    teacherName: 'Bapak Dedi Kurniawan, S.Pd',
    teacherNip: '198503121999031002',
    academicYear: '2024/2025',
    semester: 1,
    maxStudents: 36,
    currentStudents: 36,
    schedule: [
      { day: 'Senin', startTime: '07:00', endTime: '12:30', subject: 'Tematik' },
      { day: 'Selasa', startTime: '07:00', endTime: '12:30', subject: 'Tematik' },
      { day: 'Rabu', startTime: '07:00', endTime: '12:30', subject: 'Tematik' },
      { day: 'Kamis', startTime: '07:00', endTime: '12:30', subject: 'Tematik' },
      { day: 'Jumat', startTime: '07:00', endTime: '11:00', subject: 'Tematik' },
    ]
  },
  {
    id: 'class-006',
    name: '3B',
    level: '3',
    section: 'B',
    teacherId: 'teacher-006',
    teacherName: 'Ibu Indira Putri, S.Pd',
    teacherNip: '199001151995032003',
    academicYear: '2024/2025',
    semester: 1,
    maxStudents: 36,
    currentStudents: 36,
    schedule: [
      { day: 'Senin', startTime: '07:00', endTime: '12:30', subject: 'Tematik' },
      { day: 'Selasa', startTime: '07:00', endTime: '12:30', subject: 'Tematik' },
      { day: 'Rabu', startTime: '07:00', endTime: '12:30', subject: 'Tematik' },
      { day: 'Kamis', startTime: '07:00', endTime: '12:30', subject: 'Tematik' },
      { day: 'Jumat', startTime: '07:00', endTime: '11:00', subject: 'Tematik' },
    ]
  },
  // Kelas 4
  {
    id: 'class-007',
    name: '4A',
    level: '4',
    section: 'A',
    teacherId: 'teacher-007',
    teacherName: 'Bapak Galih Pratama, S.Pd',
    teacherNip: '198712201998021003',
    academicYear: '2024/2025',
    semester: 1,
    maxStudents: 36,
    currentStudents: 36,
    schedule: [
      { day: 'Senin', startTime: '07:00', endTime: '13:00', subject: 'Tematik' },
      { day: 'Selasa', startTime: '07:00', endTime: '13:00', subject: 'Tematik' },
      { day: 'Rabu', startTime: '07:00', endTime: '13:00', subject: 'Tematik' },
      { day: 'Kamis', startTime: '07:00', endTime: '13:00', subject: 'Tematik' },
      { day: 'Jumat', startTime: '07:00', endTime: '11:00', subject: 'Tematik' },
    ]
  },
  {
    id: 'class-008',
    name: '4B',
    level: '4',
    section: 'B',
    teacherId: 'teacher-008',
    teacherName: 'Ibu Anisa Rahma, S.Pd',
    teacherNip: '199205101996032004',
    academicYear: '2024/2025',
    semester: 1,
    maxStudents: 36,
    currentStudents: 36,
    schedule: [
      { day: 'Senin', startTime: '07:00', endTime: '13:00', subject: 'Tematik' },
      { day: 'Selasa', startTime: '07:00', endTime: '13:00', subject: 'Tematik' },
      { day: 'Rabu', startTime: '07:00', endTime: '13:00', subject: 'Tematik' },
      { day: 'Kamis', startTime: '07:00', endTime: '13:00', subject: 'Tematik' },
      { day: 'Jumat', startTime: '07:00', endTime: '11:00', subject: 'Tematik' },
    ]
  },
  // Kelas 5
  {
    id: 'class-009',
    name: '5A',
    level: '5',
    section: 'A',
    teacherId: 'teacher-009',
    teacherName: 'Ibu Sari Wulandari, S.Pd',
    teacherNip: '198808151997032005',
    academicYear: '2024/2025',
    semester: 1,
    maxStudents: 36,
    currentStudents: 36,
    schedule: [
      { day: 'Senin', startTime: '07:00', endTime: '13:30', subject: 'Tematik' },
      { day: 'Selasa', startTime: '07:00', endTime: '13:30', subject: 'Tematik' },
      { day: 'Rabu', startTime: '07:00', endTime: '13:30', subject: 'Tematik' },
      { day: 'Kamis', startTime: '07:00', endTime: '13:30', subject: 'Tematik' },
      { day: 'Jumat', startTime: '07:00', endTime: '11:00', subject: 'Tematik' },
    ]
  },
  {
    id: 'class-010',
    name: '5B',
    level: '5',
    section: 'B',
    teacherId: 'teacher-010',
    teacherName: 'Bapak Eko Prasetyo, S.Pd',
    teacherNip: '198406201999021004',
    academicYear: '2024/2025',
    semester: 1,
    maxStudents: 36,
    currentStudents: 36,
    schedule: [
      { day: 'Senin', startTime: '07:00', endTime: '13:30', subject: 'Tematik' },
      { day: 'Selasa', startTime: '07:00', endTime: '13:30', subject: 'Tematik' },
      { day: 'Rabu', startTime: '07:00', endTime: '13:30', subject: 'Tematik' },
      { day: 'Kamis', startTime: '07:00', endTime: '13:30', subject: 'Tematik' },
      { day: 'Jumat', startTime: '07:00', endTime: '11:00', subject: 'Tematik' },
    ]
  },
  // Kelas 6
  {
    id: 'class-011',
    name: '6A',
    level: '6',
    section: 'A',
    teacherId: 'teacher-011',
    teacherName: 'Ibu Dewi Lestari, S.Pd',
    teacherNip: '198902101998032006',
    academicYear: '2024/2025',
    semester: 1,
    maxStudents: 36,
    currentStudents: 36,
    schedule: [
      { day: 'Senin', startTime: '07:00', endTime: '14:00', subject: 'Tematik' },
      { day: 'Selasa', startTime: '07:00', endTime: '14:00', subject: 'Tematik' },
      { day: 'Rabu', startTime: '07:00', endTime: '14:00', subject: 'Tematik' },
      { day: 'Kamis', startTime: '07:00', endTime: '14:00', subject: 'Tematik' },
      { day: 'Jumat', startTime: '07:00', endTime: '11:00', subject: 'Tematik' },
    ]
  },
  {
    id: 'class-012',
    name: '6B',
    level: '6',
    section: 'B',
    teacherId: 'teacher-012',
    teacherName: 'Bapak Hendra Wijaya, S.Pd',
    teacherNip: '198511251999021005',
    academicYear: '2024/2025',
    semester: 1,
    maxStudents: 36,
    currentStudents: 36,
    schedule: [
      { day: 'Senin', startTime: '07:00', endTime: '14:00', subject: 'Tematik' },
      { day: 'Selasa', startTime: '07:00', endTime: '14:00', subject: 'Tematik' },
      { day: 'Rabu', startTime: '07:00', endTime: '14:00', subject: 'Tematik' },
      { day: 'Kamis', startTime: '07:00', endTime: '14:00', subject: 'Tematik' },
      { day: 'Jumat', startTime: '07:00', endTime: '11:00', subject: 'Tematik' },
    ]
  }
];

// Centralized teachers data - Elementary School
export const teachersData: Teacher[] = [
  {
    id: 'teacher-001',
    name: 'Ibu Sari Dewi, S.Pd',
    nip: '196805151994032001',
    username: 'walikelas1a',
    password: 'password123',
    classId: 'class-001',
    className: '1A',
    subject: 'Guru Kelas',
    phone: '081234567890',
    email: 'sari.dewi@sd.sch.id'
  },
  {
    id: 'teacher-002',
    name: 'Ibu Maya Sari, S.Pd',
    nip: '198009251999032002',
    username: 'walikelas1b',
    password: 'password123',
    classId: 'class-002',
    className: '1B',
    subject: 'Guru Kelas',
    phone: '081234567891',
    email: 'maya.sari@sd.sch.id'
  },
  {
    id: 'teacher-003',
    name: 'Bapak Ahmad Wijaya, S.Pd',
    nip: '197203101998021001',
    username: 'walikelas2a',
    password: 'password123',
    classId: 'class-003',
    className: '2A',
    subject: 'Guru Kelas',
    phone: '081234567892',
    email: 'ahmad.wijaya@sd.sch.id'
  },
  {
    id: 'teacher-004',
    name: 'Ibu Rina Maharani, S.Pd',
    nip: '197512081999031001',
    username: 'walikelas2b',
    password: 'password123',
    classId: 'class-004',
    className: '2B',
    subject: 'Guru Kelas',
    phone: '081234567893',
    email: 'rina.maharani@sd.sch.id'
  },
  {
    id: 'teacher-005',
    name: 'Bapak Dedi Kurniawan, S.Pd',
    nip: '198503121999031002',
    username: 'walikelas3a',
    password: 'password123',
    classId: 'class-005',
    className: '3A',
    subject: 'Guru Kelas',
    phone: '081234567894',
    email: 'dedi.kurniawan@sd.sch.id'
  },
  {
    id: 'teacher-006',
    name: 'Ibu Indira Putri, S.Pd',
    nip: '199001151995032003',
    username: 'walikelas3b',
    password: 'password123',
    classId: 'class-006',
    className: '3B',
    subject: 'Guru Kelas',
    phone: '081234567895',
    email: 'indira.putri@sd.sch.id'
  },
  {
    id: 'teacher-007',
    name: 'Bapak Galih Pratama, S.Pd',
    nip: '198712201998021003',
    username: 'walikelas4a',
    password: 'password123',
    classId: 'class-007',
    className: '4A',
    subject: 'Guru Kelas',
    phone: '081234567896',
    email: 'galih.pratama@sd.sch.id'
  },
  {
    id: 'teacher-008',
    name: 'Ibu Anisa Rahma, S.Pd',
    nip: '199205101996032004',
    username: 'walikelas4b',
    password: 'password123',
    classId: 'class-008',
    className: '4B',
    subject: 'Guru Kelas',
    phone: '081234567897',
    email: 'anisa.rahma@sd.sch.id'
  },
  {
    id: 'teacher-009',
    name: 'Ibu Sari Wulandari, S.Pd',
    nip: '198808151997032005',
    username: 'walikelas5a',
    password: 'password123',
    classId: 'class-009',
    className: '5A',
    subject: 'Guru Kelas',
    phone: '081234567898',
    email: 'sari.wulandari@sd.sch.id'
  },
  {
    id: 'teacher-010',
    name: 'Bapak Eko Prasetyo, S.Pd',
    nip: '198406201999021004',
    username: 'walikelas5b',
    password: 'password123',
    classId: 'class-010',
    className: '5B',
    subject: 'Guru Kelas',
    phone: '081234567899',
    email: 'eko.prasetyo@sd.sch.id'
  },
  {
    id: 'teacher-011',
    name: 'Ibu Dewi Lestari, S.Pd',
    nip: '198902101998032006',
    username: 'walikelas6a',
    password: 'password123',
    classId: 'class-011',
    className: '6A',
    subject: 'Guru Kelas',
    phone: '081234567900',
    email: 'dewi.lestari@sd.sch.id'
  },
  {
    id: 'teacher-012',
    name: 'Bapak Hendra Wijaya, S.Pd',
    nip: '198511251999021005',
    username: 'walikelas6b',
    password: 'password123',
    classId: 'class-012',
    className: '6B',
    subject: 'Guru Kelas',
    phone: '081234567901',
    email: 'hendra.wijaya@sd.sch.id'
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

export const getClassesBySection = (section: 'A' | 'B'): ClassInfo[] => {
  return classesData.filter(cls => cls.section === section);
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
    sectionAClasses: getClassesBySection('A').length,
    sectionBClasses: getClassesBySection('B').length,
    averageStudentsPerClass: Math.round(
      classesData.reduce((sum, cls) => sum + cls.currentStudents, 0) / classesData.length
    ),
    gradeDistribution: {
      grade1: getClassesByLevel('1').length,
      grade2: getClassesByLevel('2').length,
      grade3: getClassesByLevel('3').length,
      grade4: getClassesByLevel('4').length,
      grade5: getClassesByLevel('5').length,
      grade6: getClassesByLevel('6').length,
    }
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
