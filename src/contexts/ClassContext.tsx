'use client';

import { createContext, useContext, useCallback, useEffect, ReactNode } from 'react';
import { ClassInfo, User } from '@/services/dataService';
import { useClasses, useUsers } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';

// Type alias for backward compatibility
type Teacher = User & { role: 'TEACHER' }

interface ClassContextType {
  classes: ClassInfo[];
  teachers: Teacher[];
  addNewClass: (classData: Omit<ClassInfo, 'id'>, teacherData: Omit<Teacher, 'id' | 'classId'>) => void;
  updateClass: (classId: string, classData: Partial<ClassInfo>) => void;
  deleteClass: (classId: string) => void;
  getClassById: (classId: string) => ClassInfo | undefined;
  getTeacherByClassId: (classId: string) => Teacher | undefined;
  refreshData: () => void;
  isLoading: boolean;
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

interface ClassProviderProps {
  children: ReactNode;
}

export function ClassProvider({ children }: ClassProviderProps) {
  const { user } = useAuth();

  // Use React Query hooks for data fetching - only enabled when user is authenticated
  const { data: classesData, isLoading: classesLoading, refetch: refetchClasses } = useClasses(!!user);

  // Only fetch users if the current user is an admin
  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useUsers({
    enabled: user?.role === 'ADMIN'
  });

  const classes = classesData?.classes || [];
  const teachers = (usersData?.users || []).filter(user => user.role === 'TEACHER') as Teacher[];
  const isLoading = classesLoading || (user?.role === 'ADMIN' ? usersLoading : false);

  const refreshData = useCallback(() => {
    refetchClasses();
    // Only refetch users if the current user is an admin
    if (user?.role === 'ADMIN') {
      refetchUsers();
    }
  }, [refetchClasses, refetchUsers, user?.role]);

  // Load initial data
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addNewClass = useCallback((
    classData: Omit<ClassInfo, 'id'>,
    teacherData: Omit<Teacher, 'id' | 'classId'>
  ) => {
    // Generate new IDs
    const newClassId = `class-${String(classes.length + 1).padStart(3, '0')}`;
    const newTeacherId = `teacher-${String(teachers.length + 1).padStart(3, '0')}`;
    
    // Create new class
    const newClass: ClassInfo = {
      ...classData,
      id: newClassId,
    };

    // Create new teacher
    const newTeacher: Teacher = {
      ...teacherData,
      id: newTeacherId,
      classId: newClassId,
      username: `walikelas${classData.grade}${classData.section.toLowerCase()}`,
      subject: 'Guru Kelas',
    };

    // TODO: Implement with API calls using React Query mutations
    // For now, just refresh data to simulate addition
    refreshData();

    // In a real application, you would make API calls here
    console.log('New class added:', newClass);
    console.log('New teacher added:', newTeacher);
  }, [classes.length, teachers.length]);

  const updateClass = useCallback((classId: string, classData: Partial<ClassInfo>) => {
    // TODO: Implement with API calls using React Query mutations
    console.log('Class updated:', classId, classData);
    // This would use useUpdateClass mutation
    // For now, just refresh data to simulate update
    refreshData();
  }, [refreshData]);

  const deleteClass = useCallback((classId: string) => {
    // TODO: Implement with API calls using React Query mutations
    console.log('Delete class:', classId);
    // This would use useDeleteClass mutation
    // For now, just refresh data to simulate deletion
    refreshData();
  }, [refreshData]);

  const getClassById = useCallback((classId: string): ClassInfo | undefined => {
    return classes.find(cls => cls.id === classId);
  }, [classes]);

  const getTeacherByClassId = useCallback((classId: string): Teacher | undefined => {
    return teachers.find(teacher => teacher.classId === classId);
  }, [teachers]);

  const value: ClassContextType = {
    classes,
    teachers,
    addNewClass,
    updateClass,
    deleteClass,
    getClassById,
    getTeacherByClassId,
    refreshData,
    isLoading,
  };

  return (
    <ClassContext.Provider value={value}>
      {children}
    </ClassContext.Provider>
  );
}

export function useClass() {
  const context = useContext(ClassContext);
  if (context === undefined) {
    throw new Error('useClass must be used within a ClassProvider');
  }
  return context;
}

export default ClassContext;
