'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/hooks/useApi';
import { isTokenExpired } from '@/lib/auth';

interface User {
  id: string;
  name: string;
  nip: string;
  username: string;
  role: 'TEACHER' | 'ADMIN';
  phone?: string;
  email?: string;
  classId?: string;
  className?: string;
  subject?: string;
  position?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasAdminAccess: boolean;
  hasTeacherAccess: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
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

        const storedToken = localStorage.getItem('auth-token');
        const storedUser = localStorage.getItem('user');
        const storedIsLoggedIn = localStorage.getItem('isLoggedIn');

        // Debug logging
        console.log('AuthContext Debug:', {
          storedToken: storedToken ? 'exists' : 'null',
          storedUser: storedUser ? 'exists' : 'null',
          storedIsLoggedIn,
          tokenExpired: storedToken ? isTokenExpired(storedToken) : 'no token'
        });

        // Try new JWT-based auth first
        if (storedToken && storedUser) {
          try {
            // Check if token is expired (client-side safe)
            if (!isTokenExpired(storedToken)) {
              const parsedUser = JSON.parse(storedUser);

              // Validate parsed user data
              if (parsedUser && typeof parsedUser === 'object' && parsedUser.id && parsedUser.role) {
                setUser(parsedUser);
                setToken(storedToken);
                setIsLoggedIn(true);

                // Set token in API client
                apiClient.setToken(storedToken);
              } else {
                // Invalid user data, clear storage
                localStorage.removeItem('auth-token');
                localStorage.removeItem('user');
              }
            } else {
              // Expired token, clear storage
              localStorage.removeItem('auth-token');
              localStorage.removeItem('user');
            }
          } catch (parseError) {
            console.error('Error parsing stored auth data:', parseError);
            // Clear corrupted data
            localStorage.removeItem('auth-token');
            localStorage.removeItem('user');
          }
        }
        // Fallback to legacy auth for transition period
        else if (storedIsLoggedIn === 'true' && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);

            // Validate parsed user data and convert to new format if needed
            if (parsedUser && typeof parsedUser === 'object' && parsedUser.id && parsedUser.role) {
              // Convert legacy format to new format if needed
              const convertedUser = {
                ...parsedUser,
                role: typeof parsedUser.role === 'string' ? parsedUser.role.toUpperCase() : parsedUser.role,
                createdAt: parsedUser.createdAt || new Date().toISOString(),
                updatedAt: parsedUser.updatedAt || new Date().toISOString(),
              };

              setUser(convertedUser);
              setIsLoggedIn(true);
            } else {
              // Invalid user data, clear storage
              localStorage.removeItem('isLoggedIn');
              localStorage.removeItem('user');
            }
          } catch (parseError) {
            console.error('Error parsing stored legacy auth data:', parseError);
            // Clear corrupted data
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        // Clear invalid data
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user');
        // Legacy cleanup
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('teacher');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Try API-based login first
      try {
        const response = await apiClient.login(username, password);

        if (response.success) {
          setUser(response.user);
          setToken(response.token);
          setIsLoggedIn(true);

          // Set token in API client
          apiClient.setToken(response.token);

          // SSR-safe localStorage operations
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('auth-token', response.token);
              localStorage.setItem('user', JSON.stringify(response.user));

              // Legacy cleanup
              localStorage.removeItem('isLoggedIn');
              localStorage.removeItem('teacher');
            } catch (storageError) {
              console.error('Error saving to localStorage:', storageError);
              // Continue with login even if localStorage fails
            }
          }

          return true;
        }
      } catch (apiError) {
        console.warn('API login failed, falling back to legacy auth:', apiError);

        // Fallback to legacy authentication for transition period
        const { validateUserCredentials } = await import('@/services/dataService');
        const userData = await validateUserCredentials(username, password);

        if (userData) {
          // Convert legacy user data to new format
          const convertedUser = {
            id: userData.id,
            name: userData.name,
            nip: userData.nip,
            username: userData.username,
            role: userData.role.toUpperCase() as 'TEACHER' | 'ADMIN',
            phone: userData.phone,
            email: userData.email,
            classId: 'classId' in userData ? userData.classId : undefined,
            className: 'className' in userData ? userData.className : undefined,
            subject: 'subject' in userData ? userData.subject : undefined,
            position: 'position' in userData ? userData.position : undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          setUser(convertedUser);
          setIsLoggedIn(true);

          // SSR-safe localStorage operations
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('user', JSON.stringify(convertedUser));
              localStorage.setItem('isLoggedIn', 'true');
            } catch (storageError) {
              console.error('Error saving to localStorage:', storageError);
            }
          }

          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  };

  const logout = () => {
    try {
      // Call logout API (optional, for server-side cleanup)
      apiClient.logout().catch(console.error);

      setUser(null);
      setToken(null);
      setIsLoggedIn(false);

      // Clear token from API client
      apiClient.setToken(null);

      // SSR-safe localStorage operations
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('auth-token');
          localStorage.removeItem('user');
          // Legacy cleanup
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('teacher');
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
    token,
    isLoggedIn,
    isLoading,
    login,
    logout,
    isAuthenticated: isLoggedIn,
    hasAdminAccess: user?.role === 'ADMIN',
    hasTeacherAccess: user?.role === 'TEACHER',
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
