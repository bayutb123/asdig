'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useClasses, useDeleteClass, useCreateClass } from '@/hooks/useApi';
import ConfirmDialog from '@/components/ConfirmDialog';
import type { ApiErrorResponse, FormErrors } from '@/types/api';

export default function KelolaKelasPage() {
  const { user, hasAdminAccess, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // API hooks - only enabled when user is authenticated AND auth is not loading
  const { data: classesData, isLoading: classesLoading } = useClasses(!authLoading && !!user);
  const deleteClassMutation = useDeleteClass();
  const createClassMutation = useCreateClass();

  // Local state
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    classId: string;
    className: string;
  }>({
    isOpen: false,
    classId: '',
    className: '',
  });

  // Extract classes from API response
  const classes = classesData?.classes || [];

  // Form state for adding new class
  const [newClass, setNewClass] = useState({
    grade: '',
    section: 'A' as 'A' | 'B',
    teacherName: '',
    teacherNip: '',
    teacherPhone: '',
    teacherEmail: '',
    studentCount: 36
  });

  // Form validation and error state
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Check authentication
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(false);
  }, [user, router]);

  // Form validation function
  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!newClass.grade) {
      errors.grade = 'Tingkat kelas harus dipilih';
    }

    if (!newClass.teacherName.trim()) {
      errors.teacherName = 'Nama guru harus diisi';
    }

    if (!newClass.teacherNip.trim()) {
      errors.teacherNip = 'NIP guru harus diisi';
    } else if (newClass.teacherNip.length < 8) {
      errors.teacherNip = 'NIP harus minimal 8 karakter';
    }

    if (newClass.teacherPhone && !/^[0-9+\-\s()]+$/.test(newClass.teacherPhone)) {
      errors.teacherPhone = 'Format nomor telepon tidak valid';
    }

    if (newClass.teacherEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newClass.teacherEmail)) {
      errors.teacherEmail = 'Format email tidak valid';
    }

    if (newClass.studentCount < 1 || newClass.studentCount > 50) {
      errors.studentCount = 'Kapasitas siswa harus antara 1-50';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission for adding new class
  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    const className = `${newClass.grade}${newClass.section}`;

    // Check if class already exists
    if (classes.some(cls => cls.name === className)) {
      setFormErrors({ general: `Kelas ${className} sudah ada!` });
      return;
    }

    try {
      // Generate unique IDs
      const classId = `class-${Date.now()}-${newClass.grade.toLowerCase()}${newClass.section.toLowerCase()}`;
      const teacherId = `teacher-${Date.now()}-${newClass.grade.toLowerCase()}${newClass.section.toLowerCase()}`;

      // Create class data
      const classData = {
        id: classId,
        name: className,
        grade: parseInt(newClass.grade),
        section: newClass.section,
        teacherId: teacherId,
        teacherName: newClass.teacherName,
        studentCount: newClass.studentCount,
      };

      // Call the API to create the class
      await createClassMutation.mutateAsync(classData);

      // Reset form
      setNewClass({
        grade: '',
        section: 'A',
        teacherName: '',
        teacherNip: '',
        teacherPhone: '',
        teacherEmail: '',
        studentCount: 36
      });

      setFormErrors({});
      setShowAddForm(false);
      alert(`Kelas ${className} berhasil ditambahkan!`);

    } catch (error) {
      console.error('Create class error:', error);

      const apiError = error as ApiErrorResponse;

      // Handle specific error cases
      if (apiError.response?.status === 409) {
        setFormErrors({ general: `Kelas ${className} sudah ada!` });
      } else if (apiError.response?.status === 400) {
        setFormErrors({ general: apiError.response.data.error || 'Data tidak valid' });
      } else {
        setFormErrors({ general: 'Gagal menambahkan kelas. Silakan coba lagi.' });
      }
    }
  };

  // Delete class handlers
  const handleDeleteClick = (classId: string, className: string) => {
    setDeleteDialog({
      isOpen: true,
      classId,
      className,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteClassMutation.mutateAsync(deleteDialog.classId);
      setDeleteDialog({ isOpen: false, classId: '', className: '' });
      alert(`Kelas ${deleteDialog.className} berhasil dihapus!`);
    } catch (error) {
      console.error('Delete class error:', error);

      const apiError = error as ApiErrorResponse;

      // Handle specific error cases
      if (apiError.response?.status === 409) {
        const errorData = apiError.response.data;
        alert(
          `Tidak dapat menghapus kelas ${deleteDialog.className}!\n\n` +
          `Kelas ini masih memiliki:\n` +
          `- ${errorData.details?.studentsCount || 0} siswa\n` +
          `- ${errorData.details?.attendanceRecordsCount || 0} catatan kehadiran\n\n` +
          `Hapus semua siswa dan catatan kehadiran terlebih dahulu.`
        );
      } else {
        alert(`Gagal menghapus kelas ${deleteDialog.className}. Silakan coba lagi.`);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, classId: '', className: '' });
  };

  if (loading || classesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user has admin access - Teachers cannot access this page
  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md">
            <div className="text-red-600 dark:text-red-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Akses Ditolak
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Hanya admin yang memiliki hak untuk mengelola kelas. Guru tidak diizinkan mengakses halaman ini.
            </p>
            <Link
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <svg className="h-16 w-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Akses Ditolak
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Hanya admin (tata usaha) yang dapat mengakses halaman ini.
          </p>
          <Link
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Kembali ke Dashboard
          </Link>
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
            <p className="text-3xl font-bold text-green-600">{classes.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Total Siswa
            </h3>
            <p className="text-3xl font-bold text-purple-600">
              {classes.reduce((sum, cls) => sum + cls.studentCount, 0)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Kapasitas Total
            </h3>
            <p className="text-3xl font-bold text-orange-600">
              {classes.length * 36}
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
                        Tingkat {cls.grade} - Bagian {cls.section}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {cls.teacherName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {cls.teacherId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {cls.studentCount}/36
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(cls.studentCount / 36) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      2024/2025
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(cls.id, cls.name)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        title={`Hapus kelas ${cls.name}`}
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
                  <label
                    htmlFor="class-level-select"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Tingkat Kelas
                  </label>
                  <select
                    id="class-level-select"
                    value={newClass.grade}
                    onChange={(e) => setNewClass({...newClass, grade: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                      formErrors.grade ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    required
                    aria-label="Pilih tingkat kelas"
                  >
                    <option value="">Pilih Tingkat</option>
                    <option value="1">Kelas 1</option>
                    <option value="2">Kelas 2</option>
                    <option value="3">Kelas 3</option>
                    <option value="4">Kelas 4</option>
                    <option value="5">Kelas 5</option>
                    <option value="6">Kelas 6</option>
                  </select>
                  {formErrors.grade && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.grade}</p>
                  )}
                  {newClass.grade && newClass.section && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Nama kelas: <strong>{newClass.grade}{newClass.section}</strong>
                      {classes.find(cls => cls.name === `${newClass.grade}${newClass.section}`) && (
                        <span className="text-red-600 ml-2">⚠️ Kelas sudah ada!</span>
                      )}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="class-section-select"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Bagian
                  </label>
                  <select
                    id="class-section-select"
                    value={newClass.section}
                    onChange={(e) => setNewClass({...newClass, section: e.target.value as 'A' | 'B'})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                    aria-label="Pilih bagian kelas (A atau B)"
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
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                      formErrors.teacherName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Contoh: Ibu Sari Dewi, S.Pd"
                    required
                  />
                  {formErrors.teacherName && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.teacherName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    NIP
                  </label>
                  <input
                    type="text"
                    value={newClass.teacherNip}
                    onChange={(e) => setNewClass({...newClass, teacherNip: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                      formErrors.teacherNip ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Contoh: 196805151994032001"
                    required
                  />
                  {formErrors.teacherNip && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.teacherNip}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    No. Telepon (Opsional)
                  </label>
                  <input
                    type="tel"
                    value={newClass.teacherPhone}
                    onChange={(e) => setNewClass({...newClass, teacherPhone: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                      formErrors.teacherPhone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Contoh: 081234567890"
                  />
                  {formErrors.teacherPhone && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.teacherPhone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email (Opsional)
                  </label>
                  <input
                    type="email"
                    value={newClass.teacherEmail}
                    onChange={(e) => setNewClass({...newClass, teacherEmail: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                      formErrors.teacherEmail ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Contoh: guru@sd.sch.id"
                  />
                  {formErrors.teacherEmail && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.teacherEmail}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Kapasitas Maksimal Siswa
                  </label>
                  <input
                    type="number"
                    value={newClass.studentCount}
                    onChange={(e) => setNewClass({...newClass, studentCount: parseInt(e.target.value) || 0})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                      formErrors.studentCount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    min="1"
                    max="50"
                    required
                  />
                  {formErrors.studentCount && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.studentCount}</p>
                  )}
                </div>

                {/* General error message */}
                {formErrors.general && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-600">{formErrors.general}</p>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={createClassMutation.isPending}
                    className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                      createClassMutation.isPending
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white`}
                  >
                    {createClassMutation.isPending ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Menambahkan...
                      </>
                    ) : (
                      'Tambah Kelas'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setFormErrors({});
                    }}
                    disabled={createClassMutation.isPending}
                    className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                      createClassMutation.isPending
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gray-600 hover:bg-gray-700'
                    } text-white`}
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Hapus Kelas"
          message={
            <div>
              <p className="mb-2">
                Apakah Anda yakin ingin menghapus kelas <strong>{deleteDialog.className}</strong>?
              </p>
              <p className="text-sm text-gray-600">
                Tindakan ini tidak dapat dibatalkan. Kelas hanya dapat dihapus jika tidak memiliki siswa atau catatan kehadiran.
              </p>
            </div>
          }
          confirmText="Hapus Kelas"
          cancelText="Batal"
          type="danger"
          isLoading={deleteClassMutation.isPending}
        />
      </div>
    </div>
  );
}
