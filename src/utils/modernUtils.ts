/**
 * Modern JavaScript utilities using ES2020+ features
 * These functions use native browser APIs and modern syntax
 * to avoid unnecessary transpilation and polyfills
 */

/**
 * Debounce function using modern JavaScript (ES2020+)
 * Uses optional chaining and nullish coalescing
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    // Use nullish coalescing operator (??) - ES2020
    const delay = wait ?? 300;
    
    // Clear previous timeout
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle function using modern JavaScript
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Modern array grouping using Object.groupBy (ES2024) with fallback
 */
export const groupBy = <T, K extends string | number | symbol>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> => {
  // Use modern Object.groupBy if available, otherwise fallback
  if ('groupBy' in Object && typeof Object.groupBy === 'function') {
    return Object.groupBy(array, keyFn) as Record<K, T[]>;
  }
  
  // Fallback implementation using reduce
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    groups[key] ??= []; // Nullish coalescing assignment (ES2021)
    groups[key].push(item);
    return groups;
  }, {} as Record<K, T[]>);
};

/**
 * Modern async utility with AbortController (ES2017+)
 */
export const fetchWithTimeout = async (
  url: string,
  options: RequestInit & { timeout?: number } = {}
): Promise<Response> => {
  const { timeout = 8000, ...fetchOptions } = options;
  
  // Use AbortController for timeout (modern browsers)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

/**
 * Modern localStorage wrapper with error handling
 * Uses optional chaining and modern try-catch patterns
 */
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined') return defaultValue ?? null;
      
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : (defaultValue ?? null);
    } catch {
      return defaultValue ?? null;
    }
  },
  
  set: (key: string, value: unknown): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  
  remove: (key: string): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
  
  clear: (): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      
      localStorage.clear();
      return true;
    } catch {
      return false;
    }
  }
};

/**
 * Modern intersection observer utility
 * Uses modern Promise-based API
 */
export const createIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): IntersectionObserver | null => {
  // Check for browser support
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }
  
  return new IntersectionObserver(callback, {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
    ...options,
  });
};

/**
 * Modern clipboard API wrapper
 */
export const clipboard = {
  write: async (text: string): Promise<boolean> => {
    try {
      // Use modern Clipboard API if available
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    } catch {
      return false;
    }
  },
  
  read: async (): Promise<string | null> => {
    try {
      if (navigator?.clipboard?.readText) {
        return await navigator.clipboard.readText();
      }
      return null;
    } catch {
      return null;
    }
  }
};

/**
 * Modern URL utilities using URLSearchParams (ES2017+)
 */
export const urlUtils = {
  getParams: (url?: string): Record<string, string> => {
    const searchParams = new URLSearchParams(url ?? window.location.search);
    return Object.fromEntries(searchParams.entries());
  },
  
  setParams: (params: Record<string, string>, replace = false): void => {
    const url = new URL(window.location.href);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    
    if (replace) {
      window.history.replaceState({}, '', url.toString());
    } else {
      window.history.pushState({}, '', url.toString());
    }
  },
  
  removeParam: (key: string, replace = false): void => {
    const url = new URL(window.location.href);
    url.searchParams.delete(key);
    
    if (replace) {
      window.history.replaceState({}, '', url.toString());
    } else {
      window.history.pushState({}, '', url.toString());
    }
  }
};

/**
 * Modern performance measurement using Performance API
 */
export const performance = {
  mark: (name: string): void => {
    if ('performance' in window && 'mark' in window.performance) {
      window.performance.mark(name);
    }
  },
  
  measure: (name: string, startMark: string, endMark?: string): number | null => {
    if ('performance' in window && 'measure' in window.performance) {
      try {
        window.performance.measure(name, startMark, endMark);
        const entries = window.performance.getEntriesByName(name, 'measure');
        return entries[entries.length - 1]?.duration ?? null;
      } catch {
        return null;
      }
    }
    return null;
  }
};
