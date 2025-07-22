// Script to generate attendance data for the last 30 days in JSON format
const fs = require('fs');
const path = require('path');

// Generate attendance data for the last 30 days
const generateAttendanceJSON = () => {
  // Calculate date range for last 30 days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);

  const data = {
    metadata: {
      generatedAt: new Date().toISOString(),
      totalRecords: 0,
      dateRange: {
        start: startDate.toLocaleDateString('sv-SE'),
        end: endDate.toLocaleDateString('sv-SE')
      },
      schoolDays: 0,
      classes: ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B'],
      studentsPerClass: 36,
      totalStudents: 432,
      attendancePatterns: {
        present: 0.85,
        late: 0.08,
        absent: 0.05,
        excused: 0.02
      }
    },
    students: [],
    teachers: {
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
    },
    excuseReasons: [
      'Sakit',
      'Keperluan keluarga',
      'Acara keluarga',
      'Kontrol dokter'
    ],
    attendanceRecords: []
  };

  // Generate students
  const studentNames = [
    'Ahmad Rizki', 'Siti Nurhaliza', 'Budi Santoso', 'Dewi Sartika', 'Andi Wijaya',
    'Fatimah Zahra', 'Dimas Pratama', 'Indira Sari', 'Fajar Nugroho', 'Ayu Lestari',
    'Reza Firmansyah', 'Maya Putri', 'Arif Rahman', 'Sari Dewi', 'Yoga Pratama',
    'Nia Ramadhani', 'Bayu Setiawan', 'Rina Marlina', 'Eko Prasetyo', 'Dina Anggraini',
    'Hadi Kusuma', 'Lina Sari', 'Agus Salim', 'Wulan Dari', 'Irfan Hakim',
    'Sinta Bella', 'Doni Saputra', 'Mega Wati', 'Rian Hidayat', 'Tari Sari',
    'Vino Mahendra', 'Yuni Astuti', 'Zaki Maulana', 'Nisa Aulia', 'Oki Setia',
    'Putri Ayu'
  ];

  data.metadata.classes.forEach(className => {
    for (let i = 1; i <= 36; i++) {
      const studentId = `${className.toLowerCase()}-${i.toString().padStart(3, '0')}`;
      data.students.push({
        id: studentId,
        name: studentNames[i - 1] || `Siswa ${i}`,
        className: className
      });
    }
  });

  // Generate attendance records for the last 30 days
  const recordEndDate = new Date();
  const recordStartDate = new Date();
  recordStartDate.setDate(recordEndDate.getDate() - 30);
  let currentDate = new Date(recordStartDate);
  let recordId = 1;
  let schoolDays = 0;

  while (currentDate <= recordEndDate) {
    // Skip weekends
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      schoolDays++;
      const dateString = currentDate.toLocaleDateString('sv-SE');
      
      data.students.forEach(student => {
        // Generate realistic attendance patterns
        const randomFactor = Math.random();
        let status, timeIn, notes;
        
        if (randomFactor < 0.85) {
          status = 'Hadir';
          const hour = 7;
          const minute = Math.floor(Math.random() * 31);
          timeIn = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        } else if (randomFactor < 0.93) {
          status = 'Terlambat';
          const hour = Math.random() < 0.7 ? 7 : 8;
          const minute = hour === 7 ? Math.floor(Math.random() * 29) + 31 : Math.floor(Math.random() * 31);
          timeIn = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          notes = 'Terlambat datang ke sekolah';
        } else if (randomFactor < 0.98) {
          status = 'Tidak Hadir';
          notes = 'Tidak hadir tanpa keterangan';
        } else {
          status = 'Izin';
          notes = data.excuseReasons[Math.floor(Math.random() * data.excuseReasons.length)];
        }
        
        const record = {
          id: `att-${recordId.toString().padStart(6, '0')}`,
          studentId: student.id,
          studentName: student.name,
          className: student.className,
          date: dateString,
          status: status,
          recordedBy: data.teachers[student.className],
          recordedAt: `${dateString}T08:00:00.000Z`
        };

        if (timeIn) record.timeIn = timeIn;
        if (notes) record.notes = notes;

        data.attendanceRecords.push(record);
        recordId++;
      });
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  data.metadata.totalRecords = data.attendanceRecords.length;
  data.metadata.schoolDays = schoolDays;

  return data;
};

// Generate and save the data
console.log('Generating attendance data...');
const attendanceData = generateAttendanceJSON();

console.log(`Generated ${attendanceData.metadata.totalRecords} attendance records`);
console.log(`School days: ${attendanceData.metadata.schoolDays}`);
console.log(`Students: ${attendanceData.students.length}`);

// Save to JSON file
const outputPath = path.join(__dirname, '..', 'src', 'data', 'attendanceData.json');
fs.writeFileSync(outputPath, JSON.stringify(attendanceData, null, 2));

console.log(`Data saved to: ${outputPath}`);
console.log('Attendance data generation complete!');

module.exports = { generateAttendanceJSON };
