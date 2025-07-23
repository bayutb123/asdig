/**
 * Supabase-based Authentication Context
 * Replaces the old JSON-based authentication with Supabase database
 */

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userService } from '@/lib/database';
import { type User } from '@/lib/supabase';
import { trackAuthEvent } from '@/lib/analytics';

interface AuthContextType {
  user: User | null;
  teacher: User | null;
  admin: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasAdminAccess: boolean;
  hasTeacherAccess: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function SupabaseAuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [teacher, setTeacher] = useState<User | null>(null);
  const [admin, setAdmin] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Computed properties
  const isAuthenticated = isLoggedIn && user !== null;
  const hasAdminAccess = isAuthenticated && user?.role === 'admin';
  const hasTeacherAccess = isAuthenticated && (user?.role === 'teacher' || user?.role === 'admin');

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check localStorage for existing session
        if (typeof window !== 'undefined') {
          const storedUser = localStorage.getItem('supabase_user');
          const storedLoginStatus = localStorage.getItem('supabase_isLoggedIn');
          
          if (storedUser && storedLoginStatus === 'true') {
            try {
              const userData = JSON.parse(storedUser) as User;
              
              // Verify user still exists and is active in database
              const currentUser = await userService.getByUsername(userData.username);
              
              if (currentUser && currentUser.is_active) {
                setUser(currentUser);
                setIsLoggedIn(true);
                
                if (currentUser.role === 'teacher') {
                  setTeacher(currentUser);
                  setAdmin(null);
                } else if (currentUser.role === 'admin') {
                  setAdmin(currentUser);
                  setTeacher(null);
                }
              } else {
                // User no longer exists or is inactive, clear session
                localStorage.removeItem('supabase_user');
                localStorage.removeItem('supabase_isLoggedIn');
              }
            } catch (error) {
              console.error('Error parsing stored user data:', error);
              localStorage.removeItem('supabase_user');
              localStorage.removeItem('supabase_isLoggedIn');
            }
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Track login attempt
      trackAuthEvent('login_attempt', undefined, { username });

      const userData = await userService.validateCredentials(username, password);

      if (userData && userData.is_active) {
        setUser(userData);

        const userRole = userData.role;

        if (userRole === 'teacher') {
          setTeacher(userData);
          setAdmin(null);
        } else if (userRole === 'admin') {
          setAdmin(userData);
          setTeacher(null);
        }

        setIsLoggedIn(true);

        // Store session in localStorage
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('supabase_isLoggedIn', 'true');
            localStorage.setItem('supabase_user', JSON.stringify(userData));
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
    } finally {
      setIsLoading(false);
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

      // Clear localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('supabase_isLoggedIn');
          localStorage.removeItem('supabase_user');
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
    isAuthenticated,
    hasAdminAccess,
    hasTeacherAccess,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
}

export default AuthContext;
