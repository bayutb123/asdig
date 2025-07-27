/**
 * Analytics Hook for React Components
 * Provides easy-to-use analytics tracking functions for React components
 */

import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import {
  trackEvent,
  trackPageView,
  trackAuthEvent,
  trackAttendanceEvent,
  trackClassManagementEvent,
  trackReportEvent,
  trackError,
  getSessionId,
  type AnalyticsEvent,
  type UserRole,
} from '@/lib/analytics';

/**
 * Custom hook for analytics tracking
 * Automatically tracks page views and provides tracking functions
 */
export const useAnalytics = () => {
  const { user, admin, teacher } = useAuth();
  const pathname = usePathname();

  // Determine user role for analytics
  const getUserRole = useCallback((): UserRole => {
    if (admin) return 'admin';
    if (teacher) return 'teacher';
    return 'guest';
  }, [admin, teacher]);

  // Track page views automatically
  useEffect(() => {
    if (pathname) {
      const userRole = getUserRole();
      const sessionId = getSessionId();
      
      trackPageView(pathname, userRole, {
        session_id: sessionId,
        user_id: user?.id,
        user_name: user?.name,
      });
    }
  }, [pathname, user, getUserRole]);

  // Wrapped tracking functions with user context
  const track = useCallback((event: AnalyticsEvent, properties?: Record<string, string | number | boolean | undefined>) => {
    const userRole = getUserRole();
    const sessionId = getSessionId();

    trackEvent(event, {
      ...properties,
      user_role: userRole,
      session_id: sessionId,
      user_id: user?.id,
      page_path: pathname,
    });
  }, [user, pathname, getUserRole]);

  const trackAuth = useCallback((
    eventType: 'login_attempt' | 'login_success' | 'login_failure' | 'logout',
    additionalProps?: Record<string, string | number | boolean | undefined>
  ) => {
    const userRole = getUserRole();
    trackAuthEvent(eventType, userRole, {
      ...additionalProps,
      session_id: getSessionId(),
      page_path: pathname,
    });
  }, [pathname, getUserRole]);

  const trackAttendance = useCallback((
    eventType: 'attendance_view' | 'attendance_manual_entry' | 'attendance_save',
    className?: string,
    additionalProps?: Record<string, string | number | boolean | undefined>
  ) => {
    const userRole = getUserRole();
    trackAttendanceEvent(eventType, className, userRole, {
      ...additionalProps,
      session_id: getSessionId(),
      page_path: pathname,
      user_id: user?.id,
    });
  }, [user, pathname, getUserRole]);

  const trackClassManagement = useCallback((
    eventType: 'class_management_view' | 'class_add' | 'class_delete',
    className?: string,
    additionalProps?: Record<string, string | number | boolean | undefined>
  ) => {
    const userRole = getUserRole();
    trackClassManagementEvent(eventType, className, userRole, {
      ...additionalProps,
      session_id: getSessionId(),
      page_path: pathname,
      user_id: user?.id,
    });
  }, [user, pathname, getUserRole]);

  const trackReport = useCallback((
    eventType: 'report_generate' | 'report_print',
    reportType?: string,
    additionalProps?: Record<string, string | number | boolean | undefined>
  ) => {
    const userRole = getUserRole();
    trackReportEvent(eventType, reportType, userRole, {
      ...additionalProps,
      session_id: getSessionId(),
      page_path: pathname,
      user_id: user?.id,
    });
  }, [user, pathname, getUserRole]);

  const trackErrorEvent = useCallback((
    errorType: string,
    errorMessage?: string,
    additionalProps?: Record<string, string | number | boolean | undefined>
  ) => {
    trackError(errorType, errorMessage, pathname, {
      ...additionalProps,
      session_id: getSessionId(),
      user_role: getUserRole(),
      user_id: user?.id,
    });
  }, [user, pathname, getUserRole]);

  // Convenience function for tracking button clicks
  const trackButtonClick = useCallback((
    buttonName: string,
    additionalProps?: Record<string, string | number | boolean | undefined>
  ) => {
    track('page_view', {
      feature_used: 'button_click',
      button_name: buttonName,
      ...additionalProps,
    });
  }, [track]);

  // Convenience function for tracking form submissions
  const trackFormSubmit = useCallback((
    formName: string,
    success: boolean,
    additionalProps?: Record<string, string | number | boolean | undefined>
  ) => {
    track('page_view', {
      feature_used: 'form_submit',
      form_name: formName,
      form_success: success,
      ...additionalProps,
    });
  }, [track]);

  return {
    // Core tracking functions
    track,
    trackAuth,
    trackAttendance,
    trackClassManagement,
    trackReport,
    trackError: trackErrorEvent,
    
    // Convenience functions
    trackButtonClick,
    trackFormSubmit,
    
    // User context
    userRole: getUserRole(),
    sessionId: getSessionId(),
    userId: user?.id,
  };
};

export default useAnalytics;
