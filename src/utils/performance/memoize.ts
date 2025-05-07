
/**
 * A simple memoization utility to avoid recalculating expensive operations
 * @param fn The function to memoize
 * @param getKey Function to generate a cache key (defaults to JSON.stringify of arguments)
 * @param maxCacheSize Maximum number of results to cache (defaults to 100)
 * @returns Memoized function
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  getKey: (...args: Parameters<T>) => string = (...args) => JSON.stringify(args),
  maxCacheSize: number = 100
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  const memoized = ((...args: Parameters<T>): ReturnType<T> => {
    const key = getKey(...args);
    
    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>;
    }
    
    const result = fn(...args);
    
    // Manage cache size
    if (cache.size >= maxCacheSize) {
      // Remove oldest entry
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }
    
    cache.set(key, result);
    return result;
  }) as T;
  
  // Expose method to clear the cache
  (memoized as any).clearCache = () => cache.clear();
  
  return memoized;
}

/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified wait time has elapsed since the last time it was invoked
 * @param fn The function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>): void => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      fn(...args);
    }, wait);
  };
}

/**
 * Creates a throttled function that only invokes the provided function
 * at most once per every specified interval
 * @param fn The function to throttle
 * @param limit Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let waiting = false;
  let lastArgs: Parameters<T> | null = null;
  
  return (...args: Parameters<T>): void => {
    if (waiting) {
      lastArgs = args;
      return;
    }
    
    fn(...args);
    waiting = true;
    
    setTimeout(() => {
      waiting = false;
      if (lastArgs) {
        const argsToUse = lastArgs;
        lastArgs = null;
        fn(...argsToUse);
      }
    }, limit);
  };
}
