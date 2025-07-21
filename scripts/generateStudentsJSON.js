// Script to generate complete students data in JSON format
const fs = require('fs');
const path = require('path');

const generateStudentsJSON = () => {
  const data = {
    metadata: {
      totalStudents: 432,
      totalClasses: 12,
      studentsPerClass: 36,
      generatedAt: new Date().toISOString()
    },
    students: []
  };

  const classes = ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B'];
  
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

  const addresses = [
    'Jl. Merdeka No. 123, Jakarta',
    'Jl. Sudirman No. 456, Jakarta',
    'Jl. Thamrin No. 789, Jakarta',
    'Jl. Gatot Subroto No. 321, Jakarta',
    'Jl. Kuningan No. 654, Jakarta',
    'Jl. Senayan No. 987, Jakarta',
    'Jl. Kemang No. 147, Jakarta',
    'Jl. Menteng No. 258, Jakarta',
    'Jl. Cikini No. 369, Jakarta',
    'Jl. Tebet No. 741, Jakarta',
    'Jl. Kebayoran No. 852, Jakarta',
    'Jl. Pondok Indah No. 963, Jakarta'
  ];

  const statusOptions = ['Hadir', 'Terlambat', 'Tidak Hadir', 'Izin'];
  
  classes.forEach((className, classIndex) => {
    const grade = parseInt(className[0]);
    const baseYear = 2024 - grade - 6; // Calculate birth year based on grade
    
    for (let i = 1; i <= 36; i++) {
      const studentId = `${className.toLowerCase()}-${i.toString().padStart(3, '0')}`;
      const name = studentNames[i - 1] || `Siswa ${className} ${i}`;
      
      // Generate realistic birth dates
      const birthYear = baseYear + Math.floor(Math.random() * 2); // +/- 1 year variation
      const birthMonth = Math.floor(Math.random() * 12) + 1;
      const birthDay = Math.floor(Math.random() * 28) + 1;
      const birthDate = `${birthYear}-${birthMonth.toString().padStart(2, '0')}-${birthDay.toString().padStart(2, '0')}`;
      
      // Generate NISN (10 digits)
      const nisn = `01234${(classIndex * 36 + i).toString().padStart(5, '0')}`;
      
      // Determine gender from name patterns
      const femaleNames = ['Siti', 'Dewi', 'Fatimah', 'Indira', 'Ayu', 'Maya', 'Sari', 'Nia', 'Rina', 'Dina', 'Lina', 'Wulan', 'Sinta', 'Mega', 'Tari', 'Yuni', 'Nisa', 'Putri'];
      const gender = femaleNames.some(fn => name.includes(fn)) ? 'P' : 'L';
      
      // Generate parent info
      const parentPrefix = gender === 'P' ? 'Ibu' : 'Bapak';
      const parentName = `${parentPrefix} ${name.split(' ')[0]} ${gender === 'P' ? 'Dewi' : 'Santoso'}`;
      
      // Generate phone number
      const parentPhone = `0812345678${(90 + i).toString().slice(-2)}`;
      
      // Random status with realistic distribution
      const randomStatus = Math.random();
      let status;
      if (randomStatus < 0.85) status = 'Hadir';
      else if (randomStatus < 0.93) status = 'Terlambat';
      else if (randomStatus < 0.98) status = 'Tidak Hadir';
      else status = 'Izin';
      
      const student = {
        id: studentId,
        name: name,
        class: className,
        nisn: nisn,
        gender: gender,
        birthDate: birthDate,
        address: addresses[i % addresses.length],
        parentName: parentName,
        parentPhone: parentPhone,
        status: status
      };
      
      data.students.push(student);
    }
  });

  return data;
};

// Generate and save the data
console.log('Generating students data...');
const studentsData = generateStudentsJSON();

console.log(`Generated ${studentsData.students.length} student records`);
console.log(`Classes: ${studentsData.metadata.totalClasses}`);
console.log(`Students per class: ${studentsData.metadata.studentsPerClass}`);

// Save to JSON file
const outputPath = path.join(__dirname, '..', 'src', 'data', 'studentsData.json');
fs.writeFileSync(outputPath, JSON.stringify(studentsData, null, 2));

console.log(`Data saved to: ${outputPath}`);
console.log('Students data generation complete!');

module.exports = { generateStudentsJSON };
