
/**
 * Enhanced memoization utility for caching expensive function results
 * Implements a simple LRU (Least Recently Used) cache for better memory management
 * 
 * @param fn Function to memoize
 * @param capacity Maximum number of results to cache (default: 100)
 * @returns Memoized function with the same signature as the input function
 */
export function enhancedMemoize<T extends Function>(fn: T, capacity: number = 100): T {
  const cache = new Map();
  
  const memoized = function(...args: any[]) {
    // Create a string key from the arguments
    const key = JSON.stringify(args);
    
    // Check if result is in cache
    if (cache.has(key)) {
      // Move item to most recently used position
      const value = cache.get(key);
      cache.delete(key);
      cache.set(key, value);
      return value;
    }
    
    // If cache is at capacity, remove least recently used item
    if (cache.size >= capacity) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }
    
    // Calculate result and store in cache
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
  
  // Cast back to the original function type
  return memoized as unknown as T;
}

/**
 * Simple logging utility for consistent log formatting
 */
export const logger = {
  debug: (message: string, ...args: any[]) => {
    console.log(`[DEBUG] ${message}`, ...args);
  },
  info: (message: string, ...args: any[]) => {
    console.log(`[INFO] ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  }
};

/**
 * Async equivalent of enhancedMemoize for memoizing async functions
 * 
 * @param fn Async function to memoize
 * @param capacity Maximum number of results to cache (default: 100)
 * @returns Memoized async function with the same signature as the input function
 */
export function enhancedAsyncMemoize<T extends Function>(fn: T, capacity: number = 100): T {
  const cache = new Map();
  
  const memoized = async function(...args: any[]) {
    // Create a string key from the arguments
    const key = JSON.stringify(args);
    
    // Check if result is in cache
    if (cache.has(key)) {
      // Move item to most recently used position
      const value = cache.get(key);
      cache.delete(key);
      cache.set(key, value);
      return value;
    }
    
    // If cache is at capacity, remove least recently used item
    if (cache.size >= capacity) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }
    
    // Calculate result and store in cache
    const result = await fn(...args);
    cache.set(key, result);
    return result;
  };
  
  // Cast back to the original function type
  return memoized as unknown as T;
}
