'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useClass } from '@/contexts/ClassContext';

export default function KelolaKelasPage() {
  const { teacher } = useAuth();
  const router = useRouter();
  const { classes, teachers, addNewClass, deleteClass } = useClass();
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state for adding new class
  const [newClass, setNewClass] = useState({
    name: '',
    level: '',
    section: 'A' as 'A' | 'B',
    teacherName: '',
    teacherNip: '',
    teacherPhone: '',
    teacherEmail: '',
    maxStudents: 36
  });

  // Check authentication
  useEffect(() => {
    if (!teacher) {
      router.push('/login');
      return;
    }

    setLoading(false);
  }, [teacher, router]);

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();

    const className = `${newClass.level}${newClass.section}`;

    // Check if class already exists
    const existingClass = classes.find(cls => cls.name === className);
    if (existingClass) {
      alert(`Kelas ${className} sudah ada!`);
      return;
    }

    // Create class data
    const classData = {
      name: className,
      level: newClass.level,
      section: newClass.section,
      teacherId: '', // Will be set by context
      teacherName: newClass.teacherName,
      teacherNip: newClass.teacherNip,
      academicYear: '2024/2025',
      semester: 1,
      maxStudents: newClass.maxStudents,
      currentStudents: 0,
      schedule: [
        { day: 'Senin', startTime: '07:00', endTime: '12:00', subject: 'Tematik' },
        { day: 'Selasa', startTime: '07:00', endTime: '12:00', subject: 'Tematik' },
        { day: 'Rabu', startTime: '07:00', endTime: '12:00', subject: 'Tematik' },
        { day: 'Kamis', startTime: '07:00', endTime: '12:00', subject: 'Tematik' },
        { day: 'Jumat', startTime: '07:00', endTime: '11:00', subject: 'Tematik' },
      ]
    };

    // Create teacher data
    const teacherData = {
      name: newClass.teacherName,
      nip: newClass.teacherNip,
      className: className,
      phone: newClass.teacherPhone,
      email: newClass.teacherEmail
    };

    // Add new class using context
    addNewClass(classData, teacherData);

    // Reset form
    setNewClass({
      name: '',
      level: '',
      section: 'A',
      teacherName: '',
      teacherNip: '',
      teacherPhone: '',
      teacherEmail: '',
      maxStudents: 36
    });

    setShowAddForm(false);
    alert(`Kelas ${className} berhasil ditambahkan!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Kelola Kelas
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Manajemen kelas dan guru - Sekolah Dasar
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                + Tambah Kelas
              </button>
              <Link
                href="/dashboard"
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Kembali
              </Link>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Total Kelas
            </h3>
            <p className="text-3xl font-bold text-blue-600">{classes.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Total Guru
            </h3>
            <p className="text-3xl font-bold text-green-600">{teachers.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Total Siswa
            </h3>
            <p className="text-3xl font-bold text-purple-600">
              {classes.reduce((sum, cls) => sum + cls.currentStudents, 0)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Kapasitas Total
            </h3>
            <p className="text-3xl font-bold text-orange-600">
              {classes.reduce((sum, cls) => sum + cls.maxStudents, 0)}
            </p>
          </div>
        </div>

        {/* Classes List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Daftar Kelas
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Kelas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Guru Kelas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    NIP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Siswa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tahun Ajaran
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {classes.map((cls) => (
                  <tr key={cls.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {cls.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Tingkat {cls.level} - Bagian {cls.section}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {cls.teacherName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {cls.teacherNip}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {cls.currentStudents}/{cls.maxStudents}
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(cls.currentStudents / cls.maxStudents) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {cls.academicYear}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4">
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Apakah Anda yakin ingin menghapus kelas ${cls.name}?`)) {
                            deleteClass(cls.id);
                            alert(`Kelas ${cls.name} berhasil dihapus!`);
                          }
                        }}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Class Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Tambah Kelas Baru
              </h3>
              
              <form onSubmit={handleAddClass} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tingkat Kelas
                  </label>
                  <select
                    value={newClass.level}
                    onChange={(e) => setNewClass({...newClass, level: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Pilih Tingkat</option>
                    <option value="1">Kelas 1</option>
                    <option value="2">Kelas 2</option>
                    <option value="3">Kelas 3</option>
                    <option value="4">Kelas 4</option>
                    <option value="5">Kelas 5</option>
                    <option value="6">Kelas 6</option>
                  </select>
                  {newClass.level && newClass.section && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Nama kelas: <strong>{newClass.level}{newClass.section}</strong>
                      {classes.find(cls => cls.name === `${newClass.level}${newClass.section}`) && (
                        <span className="text-red-600 ml-2">⚠️ Kelas sudah ada!</span>
                      )}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bagian
                  </label>
                  <select
                    value={newClass.section}
                    onChange={(e) => setNewClass({...newClass, section: e.target.value as 'A' | 'B'})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nama Guru Kelas
                  </label>
                  <input
                    type="text"
                    value={newClass.teacherName}
                    onChange={(e) => setNewClass({...newClass, teacherName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Contoh: Ibu Sari Dewi, S.Pd"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    NIP
                  </label>
                  <input
                    type="text"
                    value={newClass.teacherNip}
                    onChange={(e) => setNewClass({...newClass, teacherNip: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Contoh: 196805151994032001"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    No. Telepon
                  </label>
                  <input
                    type="tel"
                    value={newClass.teacherPhone}
                    onChange={(e) => setNewClass({...newClass, teacherPhone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Contoh: 081234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newClass.teacherEmail}
                    onChange={(e) => setNewClass({...newClass, teacherEmail: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Contoh: guru@sd.sch.id"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Kapasitas Maksimal Siswa
                  </label>
                  <input
                    type="number"
                    value={newClass.maxStudents}
                    onChange={(e) => setNewClass({...newClass, maxStudents: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    min="1"
                    max="50"
                    required
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
                  >
                    Tambah Kelas
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
