/**
 * Analytics Configuration and Utilities
 * Provides centralized analytics tracking for the Absen Digital application
 */

import { track } from '@vercel/analytics';

// Analytics event types for the attendance system
export type AnalyticsEvent = 
  | 'login_attempt'
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'attendance_view'
  | 'attendance_manual_entry'
  | 'attendance_save'
  | 'class_management_view'
  | 'class_add'
  | 'class_delete'
  | 'report_generate'
  | 'report_print'
  | 'dashboard_view'
  | 'page_view'
  | 'error_occurred';

// User role types for analytics segmentation
export type UserRole = 'admin' | 'teacher' | 'guest';

// Analytics properties interface
interface AnalyticsProperties {
  user_role?: UserRole;
  class_name?: string;
  page_path?: string;
  error_type?: string;
  feature_used?: string;
  timestamp?: string;
  session_id?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Track custom events with Vercel Analytics
 * @param event - The event name to track
 * @param properties - Additional properties to send with the event
 */
export const trackEvent = (event: AnalyticsEvent, properties?: AnalyticsProperties) => {
  // Only track in production or when explicitly enabled
  if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true') {
    try {
      const eventProperties = {
        ...properties,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      };

      track(event, eventProperties);
      
      // Log in development for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Analytics Event:', event, eventProperties);
      }
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }
};

/**
 * Track page views with additional context
 * @param pagePath - The page path being viewed
 * @param userRole - The role of the user viewing the page
 * @param additionalProps - Any additional properties
 */
export const trackPageView = (
  pagePath: string, 
  userRole?: UserRole, 
  additionalProps?: AnalyticsProperties
) => {
  trackEvent('page_view', {
    page_path: pagePath,
    user_role: userRole,
    ...additionalProps,
  });
};

/**
 * Track user authentication events
 * @param eventType - Type of auth event (login_attempt, login_success, etc.)
 * @param userRole - Role of the user
 * @param additionalProps - Additional properties
 */
export const trackAuthEvent = (
  eventType: 'login_attempt' | 'login_success' | 'login_failure' | 'logout',
  userRole?: UserRole,
  additionalProps?: AnalyticsProperties
) => {
  trackEvent(eventType, {
    user_role: userRole,
    ...additionalProps,
  });
};

/**
 * Track attendance-related events
 * @param eventType - Type of attendance event
 * @param className - Name of the class
 * @param userRole - Role of the user performing the action
 * @param additionalProps - Additional properties
 */
export const trackAttendanceEvent = (
  eventType: 'attendance_view' | 'attendance_manual_entry' | 'attendance_save',
  className?: string,
  userRole?: UserRole,
  additionalProps?: AnalyticsProperties
) => {
  trackEvent(eventType, {
    class_name: className,
    user_role: userRole,
    ...additionalProps,
  });
};

/**
 * Track class management events
 * @param eventType - Type of class management event
 * @param className - Name of the class
 * @param userRole - Role of the user performing the action
 * @param additionalProps - Additional properties
 */
export const trackClassManagementEvent = (
  eventType: 'class_management_view' | 'class_add' | 'class_delete',
  className?: string,
  userRole?: UserRole,
  additionalProps?: AnalyticsProperties
) => {
  trackEvent(eventType, {
    class_name: className,
    user_role: userRole,
    feature_used: 'class_management',
    ...additionalProps,
  });
};

/**
 * Track report generation events
 * @param eventType - Type of report event
 * @param reportType - Type of report being generated
 * @param userRole - Role of the user generating the report
 * @param additionalProps - Additional properties
 */
export const trackReportEvent = (
  eventType: 'report_generate' | 'report_print',
  reportType?: string,
  userRole?: UserRole,
  additionalProps?: AnalyticsProperties
) => {
  trackEvent(eventType, {
    feature_used: reportType,
    user_role: userRole,
    ...additionalProps,
  });
};

/**
 * Track error events
 * @param errorType - Type of error that occurred
 * @param errorMessage - Error message or description
 * @param pagePath - Page where the error occurred
 * @param additionalProps - Additional properties
 */
export const trackError = (
  errorType: string,
  errorMessage?: string,
  pagePath?: string,
  additionalProps?: AnalyticsProperties
) => {
  trackEvent('error_occurred', {
    error_type: errorType,
    page_path: pagePath,
    error_message: errorMessage,
    ...additionalProps,
  });
};

/**
 * Generate a simple session ID for tracking user sessions
 * @returns A simple session identifier
 */
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get or create session ID from sessionStorage
 * @returns Session ID string
 */
export const getSessionId = (): string => {
  if (typeof window === 'undefined') return generateSessionId();
  
  try {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = generateSessionId();
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  } catch {
    return generateSessionId();
  }
};

/**
 * Analytics configuration object
 */
export const analyticsConfig = {
  enabled: process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true',
  debug: process.env.NODE_ENV === 'development',
  trackPageViews: true,
  trackUserInteractions: true,
  trackErrors: true,
};

// Export default analytics utilities
export default {
  trackEvent,
  trackPageView,
  trackAuthEvent,
  trackAttendanceEvent,
  trackClassManagementEvent,
  trackReportEvent,
  trackError,
  getSessionId,
  config: analyticsConfig,
};
