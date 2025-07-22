/**
 * Modern date utility functions for the attendance management system
 * Uses modern JavaScript date APIs and proper timezone handling
 */

/**
 * Get current date in ISO format (YYYY-MM-DD) using local timezone
 * Replaces deprecated new Date().toISOString().split('T')[0] pattern
 */
export const getCurrentDateISO = (): string => {
  return new Date().toLocaleDateString('sv-SE');
};

/**
 * Format date to Indonesian locale
 * @param date - Date string or Date object
 * @param options - Intl.DateTimeFormat options
 */
export const formatDateIndonesian = (
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
 * Format time to Indonesian locale (HH:MM)
 * @param time - Time string in HH:MM format or Date object
 */
export const formatTimeIndonesian = (time: string | Date): string => {
  if (typeof time === 'string') {
    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      console.warn('Invalid time format provided:', time);
      return time; // Return as-is if invalid
    }
    return time;
  }
  
  const dateObj = time;
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date provided to formatTimeIndonesian:', time);
    return '--:--';
  }
  
  return dateObj.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
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

/**
 * Check if a date is a weekend
 * @param date - Date string or Date object
 */
export const isWeekend = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date provided to isWeekend:', date);
    return false;
  }
  
  const dayOfWeek = dateObj.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
};

/**
 * Get the start and end dates of the current week
 * @param date - Reference date (defaults to today)
 */
export const getCurrentWeekRange = (date?: string | Date): { start: string; end: string } => {
  const referenceDate = date ? 
    (typeof date === 'string' ? new Date(date) : date) : 
    new Date();
  
  if (isNaN(referenceDate.getTime())) {
    console.warn('Invalid date provided to getCurrentWeekRange:', date);
    const today = new Date();
    return {
      start: today.toLocaleDateString('sv-SE'),
      end: today.toLocaleDateString('sv-SE')
    };
  }
  
  const dayOfWeek = referenceDate.getDay();
  const startOfWeek = new Date(referenceDate);
  const endOfWeek = new Date(referenceDate);
  
  // Calculate start of week (Monday)
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startOfWeek.setDate(referenceDate.getDate() - daysToMonday);
  
  // Calculate end of week (Friday for school days)
  const daysToFriday = dayOfWeek === 0 ? 2 : (5 - dayOfWeek);
  endOfWeek.setDate(referenceDate.getDate() + daysToFriday);
  
  return {
    start: startOfWeek.toLocaleDateString('sv-SE'),
    end: endOfWeek.toLocaleDateString('sv-SE')
  };
};

/**
 * Get the start and end dates of the current month
 * @param date - Reference date (defaults to today)
 */
export const getCurrentMonthRange = (date?: string | Date): { start: string; end: string } => {
  const referenceDate = date ? 
    (typeof date === 'string' ? new Date(date) : date) : 
    new Date();
  
  if (isNaN(referenceDate.getTime())) {
    console.warn('Invalid date provided to getCurrentMonthRange:', date);
    const today = new Date();
    return {
      start: today.toLocaleDateString('sv-SE'),
      end: today.toLocaleDateString('sv-SE')
    };
  }
  
  const startOfMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const endOfMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0);
  
  return {
    start: startOfMonth.toLocaleDateString('sv-SE'),
    end: endOfMonth.toLocaleDateString('sv-SE')
  };
};

/**
 * Validate date string format (YYYY-MM-DD)
 * @param dateString - Date string to validate
 */
export const isValidDateString = (dateString: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }
  
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && date.toLocaleDateString('sv-SE') === dateString;
};

/**
 * Get relative date description in Indonesian
 * @param date - Date string or Date object
 */
export const getRelativeDateDescription = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  if (isNaN(dateObj.getTime())) {
    return 'Tanggal tidak valid';
  }
  
  const todayStr = today.toLocaleDateString('sv-SE');
  const dateStr = dateObj.toLocaleDateString('sv-SE');
  
  if (dateStr === todayStr) {
    return 'Hari ini';
  }
  
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toLocaleDateString('sv-SE');
  
  if (dateStr === yesterdayStr) {
    return 'Kemarin';
  }
  
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = tomorrow.toLocaleDateString('sv-SE');
  
  if (dateStr === tomorrowStr) {
    return 'Besok';
  }
  
  // For other dates, return formatted date
  return formatDateIndonesian(dateObj, {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
};
