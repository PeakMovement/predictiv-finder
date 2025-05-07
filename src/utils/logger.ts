
/**
 * Configurable logging utility with environment awareness and log levels
 * Replaces direct console.log calls with a structured approach
 */

// Log levels in order of severity
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

// Configure minimum log level by environment
const DEFAULT_LOG_LEVEL: Record<string, LogLevel> = {
  development: 'debug',
  test: 'info',
  production: 'warn',
};

// Current environment
const ENV = import.meta.env.MODE || 'development';

/**
 * Logger configuration options
 */
interface LoggerOptions {
  /** Minimum log level to display */
  minLevel?: LogLevel;
  /** Whether to include timestamps in logs */
  timestamps?: boolean;
  /** Whether to include the log level in logs */
  showLevel?: boolean;
  /** Custom prefix for log messages */
  prefix?: string;
}

/**
 * Creates a logger instance with the specified options
 * 
 * @param options Logger configuration options
 * @returns Logger object with methods for each log level
 * 
 * @example
 * ```typescript
 * const logger = createLogger({ minLevel: 'warn' });
 * logger.info('This won't be logged');
 * logger.error('This will be logged');
 * ```
 */
export function createLogger(options: LoggerOptions = {}) {
  const {
    minLevel = DEFAULT_LOG_LEVEL[ENV] || 'info',
    timestamps = true,
    showLevel = true,
    prefix = '',
  } = options;

  // Log level hierarchy for filtering
  const levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    silent: 4,
  };

  // Minimum level as a number for comparison
  const minLevelValue = levels[minLevel];

  /**
   * Formats the log prefix with optional components
   */
  const formatPrefix = (level: LogLevel): string => {
    let result = '';

    if (timestamps) {
      result += `[${new Date().toISOString()}] `;
    }

    if (showLevel) {
      result += `[${level.toUpperCase()}] `;
    }

    if (prefix) {
      result += `[${prefix}] `;
    }

    return result;
  };

  /**
   * Generic logging function used by specific level methods
   */
  const log = (level: LogLevel, ...args: any[]): void => {
    // Skip if this level is below the minimum level
    if (levels[level] < minLevelValue || minLevel === 'silent') {
      return;
    }

    const logFn = level === 'debug' ? console.debug :
                 level === 'info' ? console.info :
                 level === 'warn' ? console.warn :
                 console.error;

    // Prepend the formatted prefix to the first argument if it's a string
    if (typeof args[0] === 'string') {
      args[0] = `${formatPrefix(level)}${args[0]}`;
    } else {
      // If the first arg isn't a string, add the prefix as a separate arg at the beginning
      args.unshift(formatPrefix(level));
    }

    logFn(...args);
  };

  return {
    debug: (...args: any[]) => log('debug', ...args),
    info: (...args: any[]) => log('info', ...args),
    warn: (...args: any[]) => log('warn', ...args),
    error: (...args: any[]) => log('error', ...args),
    
    /**
     * Creates a child logger with additional context
     * 
     * @param childPrefix Additional prefix for the child logger
     * @param childOptions Optional configuration overrides for the child
     * @returns A new logger instance with combined configuration
     * 
     * @example
     * ```typescript
     * const apiLogger = logger.child('API');
     * apiLogger.info('Request received'); // Logs: [2023-05-07T12:34:56.789Z] [INFO] [API] Request received
     * ```
     */
    child: (childPrefix: string, childOptions: Partial<LoggerOptions> = {}) => {
      return createLogger({
        ...options,
        prefix: prefix ? `${prefix}:${childPrefix}` : childPrefix,
        ...childOptions,
      });
    },
    
    /**
     * Sets the minimum log level
     * 
     * @param level New minimum log level
     */
    setLevel: (level: LogLevel) => {
      options.minLevel = level;
    }
  };
}

// Create default app logger
export const logger = createLogger({
  minLevel: DEFAULT_LOG_LEVEL[ENV],
  prefix: 'App'
});

// Create specialized loggers
export const apiLogger = logger.child('API');
export const authLogger = logger.child('Auth');
export const stateLogger = logger.child('State');
