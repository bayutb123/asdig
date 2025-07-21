'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Teacher, Admin, validateUserCredentials, isAdmin, isTeacher } from '@/data/classesData';

interface AuthContextType {
  user: User | null;
  teacher: Teacher | null;
  admin: Admin | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  hasAdminAccess: boolean;
  hasTeacherAccess: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const checkAuth = () => {
      try {
        const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
        const storedUser = localStorage.getItem('user');

        if (storedIsLoggedIn === 'true' && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          if (isTeacher(parsedUser)) {
            setTeacher(parsedUser);
            setAdmin(null);
          } else if (isAdmin(parsedUser)) {
            setAdmin(parsedUser);
            setTeacher(null);
          }

          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        // Clear invalid data
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');
        localStorage.removeItem('teacher'); // Legacy cleanup
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (username: string, password: string): boolean => {
    const userData = validateUserCredentials(username, password);

    if (userData) {
      setUser(userData);

      if (isTeacher(userData)) {
        setTeacher(userData);
        setAdmin(null);
      } else if (isAdmin(userData)) {
        setAdmin(userData);
        setTeacher(null);
      }

      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', JSON.stringify(userData));

      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    setTeacher(null);
    setAdmin(null);
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    localStorage.removeItem('teacher'); // Legacy cleanup
  };

  const value = {
    user,
    teacher,
    admin,
    isLoggedIn,
    isLoading,
    login,
    logout,
    isAuthenticated: isLoggedIn,
    hasAdminAccess: admin !== null,
    hasTeacherAccess: teacher !== null,
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
