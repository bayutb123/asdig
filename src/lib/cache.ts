/**
 * Client-side caching utilities
 * Provides memory and localStorage caching with TTL support
 */

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

class Cache {
  private memoryCache = new Map<string, CacheItem<unknown>>()
  private readonly defaultTTL = 5 * 60 * 1000 // 5 minutes

  /**
   * Set item in memory cache
   */
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  /**
   * Get item from memory cache
   */
  get<T>(key: string): T | null {
    const item = this.memoryCache.get(key)
    
    if (!item) {
      return null
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.memoryCache.delete(key)
      return null
    }

    return item.data
  }

  /**
   * Delete item from memory cache
   */
  delete(key: string): boolean {
    return this.memoryCache.delete(key)
  }

  /**
   * Clear all memory cache
   */
  clear(): void {
    this.memoryCache.clear()
  }

  /**
   * Set item in localStorage with TTL
   */
  setLocal<T>(key: string, data: T, ttl: number = this.defaultTTL): boolean {
    try {
      if (typeof window === 'undefined') return false

      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      }

      localStorage.setItem(`cache_${key}`, JSON.stringify(item))
      return true
    } catch (error) {
      console.warn('Failed to set localStorage cache:', error)
      return false
    }
  }

  /**
   * Get item from localStorage
   */
  getLocal<T>(key: string): T | null {
    try {
      if (typeof window === 'undefined') return null

      const itemStr = localStorage.getItem(`cache_${key}`)
      if (!itemStr) return null

      const item: CacheItem<T> = JSON.parse(itemStr)

      // Check if item has expired
      if (Date.now() - item.timestamp > item.ttl) {
        localStorage.removeItem(`cache_${key}`)
        return null
      }

      return item.data
    } catch (error) {
      console.warn('Failed to get localStorage cache:', error)
      return null
    }
  }

  /**
   * Delete item from localStorage
   */
  deleteLocal(key: string): boolean {
    try {
      if (typeof window === 'undefined') return false
      localStorage.removeItem(`cache_${key}`)
      return true
    } catch (error) {
      console.warn('Failed to delete localStorage cache:', error)
      return false
    }
  }

  /**
   * Clear all localStorage cache items
   */
  clearLocal(): boolean {
    try {
      if (typeof window === 'undefined') return false

      const keys = Object.keys(localStorage).filter(key => key.startsWith('cache_'))
      keys.forEach(key => localStorage.removeItem(key))
      return true
    } catch (error) {
      console.warn('Failed to clear localStorage cache:', error)
      return false
    }
  }

  /**
   * Get or set pattern - tries cache first, then executes function
   */
  async getOrSet<T>(
    key: string,
    fn: () => Promise<T>,
    ttl: number = this.defaultTTL,
    useLocal: boolean = false
  ): Promise<T> {
    // Try memory cache first
    let cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Try localStorage if enabled
    if (useLocal) {
      cached = this.getLocal<T>(key)
      if (cached !== null) {
        // Also set in memory cache for faster access
        this.set(key, cached, ttl)
        return cached
      }
    }

    // Execute function and cache result
    const result = await fn()
    this.set(key, result, ttl)
    
    if (useLocal) {
      this.setLocal(key, result, ttl)
    }

    return result
  }

  /**
   * Invalidate cache by pattern
   */
  invalidatePattern(pattern: string): void {
    // Memory cache
    const memoryKeys = Array.from(this.memoryCache.keys())
    memoryKeys.forEach(key => {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key)
      }
    })

    // localStorage
    if (typeof window !== 'undefined') {
      try {
        const keys = Object.keys(localStorage).filter(key => 
          key.startsWith('cache_') && key.includes(pattern)
        )
        keys.forEach(key => localStorage.removeItem(key))
      } catch (error) {
        console.warn('Failed to invalidate localStorage pattern:', error)
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const memorySize = this.memoryCache.size
    let localStorageSize = 0

    if (typeof window !== 'undefined') {
      try {
        const keys = Object.keys(localStorage).filter(key => key.startsWith('cache_'))
        localStorageSize = keys.length
      } catch {
        // Ignore error
      }
    }

    return {
      memorySize,
      localStorageSize,
    }
  }
}

// Export singleton instance
export const cache = new Cache()

// Cache key generators
export const cacheKeys = {
  users: () => 'users',
  classes: () => 'classes',
  students: (classId?: string) => classId ? `students_${classId}` : 'students',
  attendance: (params?: Record<string, string>) => {
    const paramStr = params ? Object.entries(params).sort().map(([k, v]) => `${k}:${v}`).join('_') : ''
    return `attendance${paramStr ? `_${paramStr}` : ''}`
  },
  user: (id: string) => `user_${id}`,
  class: (id: string) => `class_${id}`,
  student: (id: string) => `student_${id}`,
}

// Cache TTL constants (in milliseconds)
export const cacheTTL = {
  short: 1 * 60 * 1000,      // 1 minute
  medium: 5 * 60 * 1000,     // 5 minutes
  long: 30 * 60 * 1000,      // 30 minutes
  veryLong: 2 * 60 * 60 * 1000, // 2 hours
}
