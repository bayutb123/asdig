'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ClassInfo, Teacher, getAllClasses, getAllTeachers } from '@/data/classesData';

interface ClassContextType {
  classes: ClassInfo[];
  teachers: Teacher[];
  addNewClass: (classData: Omit<ClassInfo, 'id'>, teacherData: Omit<Teacher, 'id' | 'classId'>) => void;
  updateClass: (classId: string, classData: Partial<ClassInfo>) => void;
  deleteClass: (classId: string) => void;
  getClassById: (classId: string) => ClassInfo | undefined;
  getTeacherByClassId: (classId: string) => Teacher | undefined;
  refreshData: () => void;
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

interface ClassProviderProps {
  children: ReactNode;
}

export function ClassProvider({ children }: ClassProviderProps) {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // Load initial data
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setClasses(getAllClasses());
    setTeachers(getAllTeachers());
  };

  const addNewClass = (
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
      password: 'password123',
      subject: 'Guru Kelas',
    };

    // Update state
    setClasses(prev => [...prev, newClass]);
    setTeachers(prev => [...prev, newTeacher]);

    // In a real application, you would make API calls here
    console.log('New class added:', newClass);
    console.log('New teacher added:', newTeacher);
  };

  const updateClass = (classId: string, classData: Partial<ClassInfo>) => {
    setClasses(prev => 
      prev.map(cls => 
        cls.id === classId ? { ...cls, ...classData } : cls
      )
    );

    // In a real application, you would make an API call here
    console.log('Class updated:', classId, classData);
  };

  const deleteClass = (classId: string) => {
    // Remove class
    setClasses(prev => prev.filter(cls => cls.id !== classId));
    
    // Remove associated teacher
    setTeachers(prev => prev.filter(teacher => teacher.classId !== classId));

    // In a real application, you would make API calls here
    console.log('Class deleted:', classId);
  };

  const getClassById = (classId: string): ClassInfo | undefined => {
    return classes.find(cls => cls.id === classId);
  };

  const getTeacherByClassId = (classId: string): Teacher | undefined => {
    return teachers.find(teacher => teacher.classId === classId);
  };

  const value: ClassContextType = {
    classes,
    teachers,
    addNewClass,
    updateClass,
    deleteClass,
    getClassById,
    getTeacherByClassId,
    refreshData,
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
