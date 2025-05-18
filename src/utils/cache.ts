
/**
 * Enhanced memoization utility
 * Provides configurable caching for expensive functions
 */

type CacheOptions = {
  maxSize?: number;
  ttl?: number; // Time to live in milliseconds
};

// Simple in-memory cache implementation
interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

export const enhancedMemoize = <T extends (...args: any[]) => any>(
  fn: T,
  keyFn?: (...args: Parameters<T>) => string,
  options: CacheOptions = {}
): T => {
  const cache = new Map<string, CacheEntry<ReturnType<T>>>();
  const { maxSize = 100, ttl = 0 } = options;
  
  const memoizedFn = ((...args: Parameters<T>): ReturnType<T> => {
    // Generate cache key
    const key = keyFn ? keyFn(...args) : JSON.stringify(args);
    const now = Date.now();
    
    // Check if we have a valid cached result
    if (cache.has(key)) {
      const entry = cache.get(key)!;
      
      // Check if the entry is still valid (ttl)
      if (ttl === 0 || now - entry.timestamp < ttl) {
        logger.debug(`Cache hit for key: ${key.slice(0, 50)}...`);
        return entry.value;
      } else {
        // Entry expired
        logger.debug(`Cache expired for key: ${key.slice(0, 50)}...`);
        cache.delete(key);
      }
    }
    
    // Calculate the result
    logger.debug(`Cache miss for key: ${key.slice(0, 50)}...`);
    const result = fn(...args);
    
    // Store in cache
    cache.set(key, {
      value: result,
      timestamp: now
    });
    
    // Manage cache size
    if (maxSize > 0 && cache.size > maxSize) {
      // Remove oldest entry
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
      logger.debug(`Cache size limit reached, removed oldest entry`);
    }
    
    return result;
  }) as T;
  
  return memoizedFn;
};

// Simple logging utility
export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
  info: (message: string, ...args: any[]) => {
    console.info(`[INFO] ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  }
};
