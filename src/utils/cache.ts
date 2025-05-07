
/**
 * Cache management utility to improve performance for expensive operations
 */

type CacheEntry<T> = {
  value: T;
  timestamp: number;
};

interface CacheOptions {
  /** Max cache size to prevent memory leaks */
  maxSize?: number;
  /** TTL in milliseconds (default: 5 minutes) */
  ttl?: number;
}

export class Cache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;
  private ttl: number;

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 100;
    this.ttl = options.ttl || 5 * 60 * 1000; // 5 minutes default
  }

  /**
   * Get a value from cache if it exists and is not expired
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) return undefined;
    
    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.value;
  }

  /**
   * Set a value in the cache
   */
  set(key: string, value: T): void {
    // If cache is at max capacity, remove oldest entry
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Returns the current cache size
   */
  size(): number {
    return this.cache.size;
  }
}

/**
 * Enhanced memoize function with TTL and cache size management
 */
export function enhancedMemoize<T extends (...args: any[]) => any>(
  fn: T,
  getKey: (...args: Parameters<T>) => string = (...args) => JSON.stringify(args),
  options: CacheOptions = {}
): T & { clearCache: () => void; cacheSize: () => number } {
  const cache = new Cache<ReturnType<T>>(options);
  
  const memoized = ((...args: Parameters<T>): ReturnType<T> => {
    const key = getKey(...args);
    
    // Check if we have a cached result
    const cachedResult = cache.get(key);
    if (cachedResult !== undefined) {
      return cachedResult;
    }
    
    // If not, compute and cache the result
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T & { clearCache: () => void; cacheSize: () => number };
  
  // Add methods to manage the cache
  memoized.clearCache = () => cache.clear();
  memoized.cacheSize = () => cache.size();
  
  return memoized;
}

/**
 * Utility to create environment-aware logging
 */
export const logger = {
  /**
   * Log info message in development only
   */
  info: (message: string, ...args: any[]): void => {
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[INFO] ${message}`, ...args);
    }
  },
  
  /**
   * Log warning message (shown in all environments)
   */
  warn: (message: string, ...args: any[]): void => {
    console.warn(`[WARNING] ${message}`, ...args);
  },
  
  /**
   * Log error message (shown in all environments)
   */
  error: (message: string, ...args: any[]): void => {
    console.error(`[ERROR] ${message}`, ...args);
  },
  
  /**
   * Log debug message (only in development)
   */
  debug: (message: string, ...args: any[]): void => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }
};
