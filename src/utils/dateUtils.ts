/**
 * Date utility functions for the attendance management system
 * Uses modern JavaScript date APIs and proper timezone handling
 */

/**
 * Format date to Indonesian locale (used internally)
 * @param date - Date string or Date object
 * @param options - Intl.DateTimeFormat options
 */
const formatDateIndonesian = (
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Validate date
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date provided to formatDateIndonesian:', date);
    return 'Tanggal tidak valid';
  }

  return dateObj.toLocaleDateString('id-ID', options);
};

/**
 * Get date range between two dates (inclusive)
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @param excludeWeekends - Whether to exclude weekends
 */
export const getDateRange = (
  startDate: string,
  endDate: string,
  excludeWeekends = false
): string[] => {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Validate dates using modern Number.isNaN (ES2015+)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    console.warn('Invalid date range provided:', { startDate, endDate });
    return [];
  }

  if (start > end) {
    console.warn('Start date is after end date:', { startDate, endDate });
    return [];
  }

  const current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getDay();

    // Skip weekends if requested (0 = Sunday, 6 = Saturday)
    // Using modern logical operators (ES2020+)
    if (!excludeWeekends || (dayOfWeek !== 0 && dayOfWeek !== 6)) {
      dates.push(current.toLocaleDateString('sv-SE'));
    }

    current.setDate(current.getDate() + 1);
  }

  return dates;
};


