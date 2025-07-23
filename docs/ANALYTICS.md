# Analytics Implementation Guide

This document describes the analytics implementation for the Absen Digital application using Vercel Analytics.

## Overview

The analytics system provides comprehensive tracking for:
- Page views and user navigation
- Authentication events (login/logout)
- Attendance management actions
- Class management operations
- Report generation and printing
- Error tracking and debugging

## Components

### 1. Vercel Analytics
- **@vercel/analytics**: Tracks custom events and page views
- Provides real-time user behavior insights
- Performance monitoring capabilities

### 2. Analytics Library (`src/lib/analytics.ts`)
Centralized analytics configuration with typed event tracking:
- Custom event types for attendance system
- User role segmentation (admin/teacher/guest)
- Environment-aware tracking (production/development)
- Error handling and debugging

### 3. Analytics Hook (`src/hooks/useAnalytics.ts`)
React hook for easy component integration:
- Automatic page view tracking
- User context integration
- Convenience functions for common actions
- Session management

### 4. Authentication Analytics
Integrated into `AuthContext` to track:
- Login attempts and success/failure rates
- User role distribution
- Session management
- Logout events

## Usage Examples

### Basic Event Tracking
```typescript
import { useAnalytics } from '@/hooks/useAnalytics';

function MyComponent() {
  const { track, trackButtonClick } = useAnalytics();

  const handleSave = () => {
    // Track custom event
    track('attendance_save', {
      class_name: 'Kelas 1A',
      student_count: 25
    });
  };

  const handlePrint = () => {
    // Track button click
    trackButtonClick('print_report', {
      report_type: 'attendance_summary'
    });
  };

  return (
    <div>
      <button onClick={handleSave}>Save Attendance</button>
      <button onClick={handlePrint}>Print Report</button>
    </div>
  );
}
```

### Authentication Tracking
```typescript
// Automatically tracked in AuthContext
const { login, logout } = useAuth();

// These will automatically track analytics events:
login(username, password); // Tracks: login_attempt, login_success/failure
logout(); // Tracks: logout
```

### Attendance Tracking
```typescript
import { useAnalytics } from '@/hooks/useAnalytics';

function AttendanceComponent() {
  const { trackAttendance } = useAnalytics();

  const handleAttendanceView = (className: string) => {
    trackAttendance('attendance_view', className);
  };

  const handleManualEntry = (className: string) => {
    trackAttendance('attendance_manual_entry', className, {
      entry_method: 'manual_form'
    });
  };

  return (
    // Component JSX
  );
}
```

### Error Tracking
```typescript
import { useAnalytics } from '@/hooks/useAnalytics';

function MyComponent() {
  const { trackError } = useAnalytics();

  const handleApiCall = async () => {
    try {
      await apiCall();
    } catch (error) {
      trackError('api_error', error.message, {
        api_endpoint: '/api/attendance',
        error_code: error.status
      });
    }
  };
}
```

## Event Types

### Core Events
- `page_view` - Automatic page navigation tracking
- `login_attempt` - User login attempts
- `login_success` - Successful logins
- `login_failure` - Failed login attempts
- `logout` - User logout events

### Attendance Events
- `attendance_view` - Viewing attendance data
- `attendance_manual_entry` - Manual attendance entry
- `attendance_save` - Saving attendance data

### Class Management Events
- `class_management_view` - Viewing class management
- `class_add` - Adding new classes
- `class_delete` - Deleting classes

### Report Events
- `report_generate` - Generating reports
- `report_print` - Printing reports

### Error Events
- `error_occurred` - Application errors

## Configuration

### Environment Variables
```bash
# Enable analytics in development (optional)
NEXT_PUBLIC_ANALYTICS_ENABLED=true

# Application URL for metadata
NEXT_PUBLIC_APP_URL=https://asdig.vercel.app

# Google Site Verification (optional)
GOOGLE_SITE_VERIFICATION=your_verification_code

# Debug mode (development only)
NEXT_PUBLIC_ANALYTICS_DEBUG=true
```

### Analytics Configuration
The analytics system automatically:
- Enables tracking in production
- Provides debug logging in development
- Handles errors gracefully
- Respects user privacy

## Data Collected

### User Context
- User role (admin/teacher/guest)
- User ID and name (when authenticated)
- Session ID for tracking user sessions

### Page Context
- Page path and navigation patterns
- Timestamp of events
- Environment (production/development)

### Feature Usage
- Which features are used most frequently
- Success/failure rates for operations
- Error patterns and debugging information

### Performance Data
- User interaction metrics
- Feature usage patterns
- Error rates and debugging data

## Privacy & Security

- No personally identifiable information is tracked beyond user roles
- All tracking respects user privacy
- Data is processed by Vercel Analytics (GDPR compliant)
- Analytics can be disabled via environment variables

## Monitoring & Insights

### Vercel Dashboard
Access analytics at: https://vercel.com/dashboard/analytics

### Key Metrics to Monitor
1. **User Engagement**
   - Page views and navigation patterns
   - Feature adoption rates
   - Session duration

2. **Authentication**
   - Login success/failure rates
   - User role distribution
   - Session patterns

3. **Feature Usage**
   - Most used features
   - Error rates by feature
   - User workflow patterns

4. **Application Health**
   - Error tracking and resolution
   - User experience patterns
   - Feature performance metrics

## Troubleshooting

### Analytics Not Working
1. Check environment variables
2. Verify Vercel deployment
3. Check browser console for errors
4. Ensure analytics is enabled for your environment

### Debug Mode
Enable debug logging in development:
```bash
NEXT_PUBLIC_ANALYTICS_DEBUG=true
```

This will log all analytics events to the browser console.

## Best Practices

1. **Event Naming**: Use consistent, descriptive event names
2. **Properties**: Include relevant context without PII
3. **Error Handling**: Always wrap analytics calls in try-catch
4. **Performance**: Analytics calls are non-blocking
5. **Privacy**: Respect user privacy and data protection laws

## Future Enhancements

- Custom dashboard for school-specific metrics
- Real-time analytics for attendance monitoring
- Advanced user behavior analysis
- Integration with school management systems
- Custom alerts for important events
