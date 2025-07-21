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

// Centralized student data - consistent across all components
export const allStudentsData: Student[] = [
  // 12 IPA 1 - Wali Kelas: Ibu Sari Dewi, S.Pd
  {
    id: '1',
    name: 'Ahmad Rizki Pratama',
    studentId: 'SIS001',
    class: '12 IPA 1',
    status: 'Hadir',
    checkInTime: '07:15',
    date: '2025-01-21'
  },
  {
    id: '2',
    name: 'Siti Nurhaliza Putri',
    studentId: 'SIS002',
    class: '12 IPA 1',
    status: 'Hadir',
    checkInTime: '07:10',
    date: '2025-01-21'
  },
  {
    id: '3',
    name: 'Andi Pratama Wijaya',
    studentId: 'SIS003',
    class: '12 IPA 1',
    status: 'Hadir',
    checkInTime: '07:05',
    date: '2025-01-21'
  },
  {
    id: '4',
    name: 'Fajar Nugroho Adi',
    studentId: 'SIS004',
    class: '12 IPA 1',
    status: 'Hadir',
    checkInTime: '07:12',
    date: '2025-01-21'
  },
  {
    id: '5',
    name: 'Lestari Dewi Sari',
    studentId: 'SIS005',
    class: '12 IPA 1',
    status: 'Tidak Hadir',
    date: '2025-01-21'
  },
  {
    id: '6',
    name: 'Bayu Adi Nugroho',
    studentId: 'SIS006',
    class: '12 IPA 1',
    status: 'Terlambat',
    checkInTime: '07:50',
    date: '2025-01-21'
  },

  // 12 IPA 2 - Wali Kelas: Bapak Ahmad Wijaya, S.Pd
  {
    id: '7',
    name: 'Budi Santoso',
    studentId: 'SIS007',
    class: '12 IPA 2',
    status: 'Terlambat',
    checkInTime: '07:45',
    date: '2025-01-21'
  },
  {
    id: '8',
    name: 'Reza Firmansyah',
    studentId: 'SIS008',
    class: '12 IPA 2',
    status: 'Hadir',
    checkInTime: '07:20',
    date: '2025-01-21'
  },
  {
    id: '9',
    name: 'Dimas Arya Saputra',
    studentId: 'SIS009',
    class: '12 IPA 2',
    status: 'Hadir',
    checkInTime: '07:08',
    date: '2025-01-21'
  },
  {
    id: '10',
    name: 'Citra Maharani',
    studentId: 'SIS010',
    class: '12 IPA 2',
    status: 'Tidak Hadir',
    date: '2025-01-21'
  },
  {
    id: '11',
    name: 'Galang Pratama',
    studentId: 'SIS011',
    class: '12 IPA 2',
    status: 'Hadir',
    checkInTime: '07:18',
    date: '2025-01-21'
  },
  {
    id: '12',
    name: 'Putri Ayu Lestari',
    studentId: 'SIS012',
    class: '12 IPA 2',
    status: 'Izin',
    date: '2025-01-21'
  },

  // 12 IPS 1 - Wali Kelas: Ibu Maya Sari, S.Pd
  {
    id: '13',
    name: 'Maya Sari Dewi',
    studentId: 'SIS013',
    class: '12 IPS 1',
    status: 'Tidak Hadir',
    date: '2025-01-21'
  },
  {
    id: '14',
    name: 'Indira Putri Maharani',
    studentId: 'SIS014',
    class: '12 IPS 1',
    status: 'Terlambat',
    checkInTime: '07:50',
    date: '2025-01-21'
  },
  {
    id: '15',
    name: 'Anisa Rahma Sari',
    studentId: 'SIS015',
    class: '12 IPS 1',
    status: 'Hadir',
    checkInTime: '07:18',
    date: '2025-01-21'
  },
  {
    id: '16',
    name: 'Galih Pratama',
    studentId: 'SIS016',
    class: '12 IPS 1',
    status: 'Hadir',
    checkInTime: '07:15',
    date: '2025-01-21'
  },
  {
    id: '17',
    name: 'Sari Wulandari',
    studentId: 'SIS017',
    class: '12 IPS 1',
    status: 'Hadir',
    checkInTime: '07:08',
    date: '2025-01-21'
  },
  {
    id: '18',
    name: 'Eko Prasetyo',
    studentId: 'SIS018',
    class: '12 IPS 1',
    status: 'Tidak Hadir',
    date: '2025-01-21'
  },

  // 12 IPS 2 - Wali Kelas: Bapak Dedi Kurniawan, S.Pd
  {
    id: '19',
    name: 'Dewi Lestari Sari',
    studentId: 'SIS019',
    class: '12 IPS 2',
    status: 'Izin',
    date: '2025-01-21'
  },
  {
    id: '20',
    name: 'Rina Maharani Putri',
    studentId: 'SIS020',
    class: '12 IPS 2',
    status: 'Tidak Hadir',
    date: '2025-01-21'
  },
  {
    id: '21',
    name: 'Hendra Wijaya',
    studentId: 'SIS021',
    class: '12 IPS 2',
    status: 'Hadir',
    checkInTime: '07:12',
    date: '2025-01-21'
  },
  {
    id: '22',
    name: 'Intan Permata',
    studentId: 'SIS022',
    class: '12 IPS 2',
    status: 'Hadir',
    checkInTime: '07:20',
    date: '2025-01-21'
  },
  {
    id: '23',
    name: 'Arif Budiman',
    studentId: 'SIS023',
    class: '12 IPS 2',
    status: 'Terlambat',
    checkInTime: '07:55',
    date: '2025-01-21'
  },
  {
    id: '24',
    name: 'Novi Rahayu',
    studentId: 'SIS024',
    class: '12 IPS 2',
    status: 'Hadir',
    checkInTime: '07:05',
    date: '2025-01-21'
  }
];

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
