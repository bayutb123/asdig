'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Teacher, Admin, validateUserCredentials, isAdmin, isTeacher } from '@/data/classesData';
import { trackAuthEvent } from '@/lib/analytics';

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
        // Check if we're in browser environment (SSR-safe)
        if (typeof window === 'undefined') {
          setIsLoading(false);
          return;
        }

        const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
        const storedUser = localStorage.getItem('user');

        if (storedIsLoggedIn === 'true' && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);

            // Validate parsed user data
            if (parsedUser && typeof parsedUser === 'object' && parsedUser.id && parsedUser.role) {
              setUser(parsedUser);

              if (isTeacher(parsedUser)) {
                setTeacher(parsedUser);
                setAdmin(null);
              } else if (isAdmin(parsedUser)) {
                setAdmin(parsedUser);
                setTeacher(null);
              }

              setIsLoggedIn(true);
            } else {
              // Invalid user data, clear storage
              localStorage.removeItem('isLoggedIn');
              localStorage.removeItem('user');
            }
          } catch (parseError) {
            console.error('Error parsing stored user data:', parseError);
            // Clear corrupted data
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('user');
          }
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
    try {
      // Track login attempt
      trackAuthEvent('login_attempt', undefined, { username });

      const userData = validateUserCredentials(username, password);

      if (userData) {
        setUser(userData);

        const userRole = isAdmin(userData) ? 'admin' : isTeacher(userData) ? 'teacher' : 'guest';

        if (isTeacher(userData)) {
          setTeacher(userData);
          setAdmin(null);
        } else if (isAdmin(userData)) {
          setAdmin(userData);
          setTeacher(null);
        }

        setIsLoggedIn(true);

        // SSR-safe localStorage operations
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('user', JSON.stringify(userData));
          } catch (storageError) {
            console.error('Error saving to localStorage:', storageError);
            // Continue with login even if localStorage fails
          }
        }

        // Track successful login
        trackAuthEvent('login_success', userRole, {
          username,
          user_id: userData.id,
          user_name: userData.name
        });

        return true;
      }

      // Track failed login
      trackAuthEvent('login_failure', undefined, { username });
      return false;
    } catch (error) {
      console.error('Error during login:', error);
      // Track login error
      trackAuthEvent('login_failure', undefined, {
        username,
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  };

  const logout = () => {
    try {
      // Track logout before clearing user data
      const currentUserRole = admin ? 'admin' : teacher ? 'teacher' : 'guest';
      trackAuthEvent('logout', currentUserRole, {
        user_id: user?.id,
        user_name: user?.name
      });

      setUser(null);
      setTeacher(null);
      setAdmin(null);
      setIsLoggedIn(false);

      // SSR-safe localStorage operations
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('user');
          localStorage.removeItem('teacher'); // Legacy cleanup
        } catch (storageError) {
          console.error('Error clearing localStorage:', storageError);
        }
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
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
