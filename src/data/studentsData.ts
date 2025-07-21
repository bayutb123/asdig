// Types for student data
export interface Student {
  id: string;
  name: string;
  studentId: string;
  class: string;
  status: 'Hadir' | 'Tidak Hadir' | 'Terlambat' | 'Izin';
  checkInTime?: string;
  date: string;
  notes?: string;
}

// Indonesian names for generating student data
const indonesianNames = [
  'Ahmad Rizki', 'Siti Nurhaliza', 'Andi Pratama', 'Fajar Nugroho', 'Lestari Dewi', 'Bayu Adi',
  'Budi Santoso', 'Reza Firmansyah', 'Dimas Arya', 'Citra Maharani', 'Galang Pratama', 'Putri Ayu',
  'Maya Sari', 'Indira Putri', 'Anisa Rahma', 'Galih Pratama', 'Sari Wulandari', 'Eko Prasetyo',
  'Dewi Lestari', 'Rina Maharani', 'Hendra Wijaya', 'Intan Permata', 'Arif Budiman', 'Novi Rahayu',
  'Adi Nugroho', 'Sinta Dewi', 'Bagas Pratama', 'Lina Sari', 'Doni Setiawan', 'Eka Putri',
  'Fandi Wijaya', 'Gita Maharani', 'Hadi Pratama', 'Ira Lestari', 'Joko Santoso', 'Kiki Amelia'
];

const checkInTimes = ['07:05', '07:08', '07:10', '07:12', '07:15', '07:18', '07:20', '07:22', '07:25', '07:30', '07:45', '07:50'];

// Function to generate students for a class
const generateStudentsForClass = (className: string, startId: number): Student[] => {
  const students: Student[] = [];

  for (let i = 0; i < 36; i++) {
    const id = startId + i;
    const nameIndex = i % indonesianNames.length;
    const statusIndex = Math.floor(Math.random() * 10); // 80% chance of being present
    let status: 'Hadir' | 'Tidak Hadir' | 'Terlambat' | 'Izin';

    if (statusIndex < 7) status = 'Hadir';
    else if (statusIndex < 8) status = 'Terlambat';
    else if (statusIndex < 9) status = 'Tidak Hadir';
    else status = 'Izin';

    const student: Student = {
      id: id.toString(),
      name: indonesianNames[nameIndex] + (i >= indonesianNames.length ? ` ${Math.floor(i / indonesianNames.length) + 1}` : ''),
      studentId: `SD${id.toString().padStart(3, '0')}`,
      class: className,
      status: status,
      date: '2025-01-21'
    };

    // Add check-in time for present and late students
    if (status === 'Hadir' || status === 'Terlambat') {
      const timeIndex = status === 'Terlambat' ?
        checkInTimes.length - 2 + Math.floor(Math.random() * 2) : // Late times
        Math.floor(Math.random() * (checkInTimes.length - 2)); // Regular times
      student.checkInTime = checkInTimes[timeIndex];
    }

    students.push(student);
  }

  return students;
};

// Generate all student data for 12 classes (36 students each = 432 total)
const generateAllStudents = (): Student[] => {
  const classes = ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B'];
  let allStudents: Student[] = [];
  let currentId = 1;

  classes.forEach(className => {
    const classStudents = generateStudentsForClass(className, currentId);
    allStudents = allStudents.concat(classStudents);
    currentId += 36;
  });

  return allStudents;
};

// Centralized student data - Elementary School (Sekolah Dasar) - 36 students per class
export const allStudentsData: Student[] = generateAllStudents();

// Helper function to get students by class
export const getStudentsByClass = (className: string): Student[] => {
  return allStudentsData.filter(student => student.class === className);
};

// Helper function to get all unique classes
export const getAllClasses = (): string[] => {
  return Array.from(new Set(allStudentsData.map(student => student.class)));
};

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
