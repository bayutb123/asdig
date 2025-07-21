'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Teacher {
  id: string;
  username: string;
  name: string;
  class: string;
  nip: string;
}

interface AuthContextType {
  teacher: Teacher | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (teacher: Teacher) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const checkAuth = () => {
      try {
        const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
        const storedTeacher = localStorage.getItem('teacher');

        if (storedIsLoggedIn === 'true' && storedTeacher) {
          const parsedTeacher = JSON.parse(storedTeacher);
          setTeacher(parsedTeacher);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        // Clear invalid data
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('teacher');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (teacherData: Teacher) => {
    setTeacher(teacherData);
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('teacher', JSON.stringify(teacherData));
  };

  const logout = () => {
    setTeacher(null);
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('teacher');
  };

  const value = {
    teacher,
    isLoggedIn,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
