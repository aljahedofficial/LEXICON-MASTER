type LogLevel = 'error' | 'warn' | 'info' | 'debug'

interface LogContext {
  [key: string]: unknown
}

class Logger {
  private level: LogLevel

  constructor() {
    this.level = (process.env.LOG_LEVEL as LogLevel) || 'info'
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['error', 'warn', 'info', 'debug']
    return levels.indexOf(level) <= levels.indexOf(this.level)
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` ${JSON.stringify(context)}` : ''
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    if (!this.shouldLog('error')) return

    const errorDetails = error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name,
    } : error

    console.error(this.formatMessage('error', message, { ...context, error: errorDetails }))

    // Send to error tracking service in production
    if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
      // Integration point for Sentry or other error tracking
      // Sentry.captureException(error, { extra: context })
    }
  }

  warn(message: string, context?: LogContext) {
    if (!this.shouldLog('warn')) return
    console.warn(this.formatMessage('warn', message, context))
  }

  info(message: string, context?: LogContext) {
    if (!this.shouldLog('info')) return
    console.log(this.formatMessage('info', message, context))
  }

  debug(message: string, context?: LogContext) {
    if (!this.shouldLog('debug')) return
    console.debug(this.formatMessage('debug', message, context))
  }

  // Special method for API requests
  apiRequest(method: string, path: string, statusCode: number, duration: number, userId?: string) {
    this.info('API Request', {
      method,
      path,
      statusCode,
      duration: `${duration}ms`,
      userId,
    })
  }

  // Special method for database queries (useful for debugging)
  dbQuery(query: string, duration: number) {
    this.debug('Database Query', {
      query: query.substring(0, 100),
      duration: `${duration}ms`,
    })
  }
}

export const logger = new Logger()

/**
 * Performance monitoring wrapper
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now()
  try {
    const result = await fn()
    const duration = Date.now() - start
    
    if (duration > 1000) {
      logger.warn(`Slow operation detected: ${name}`, { duration: `${duration}ms` })
    } else {
      logger.debug(`Performance: ${name}`, { duration: `${duration}ms` })
    }
    
    return result
  } catch (error) {
    const duration = Date.now() - start
    logger.error(`Operation failed: ${name}`, error, { duration: `${duration}ms` })
    throw error
  }
}

/**
 * Request logger middleware helper
 */
export function createRequestLogger() {
  return (req: Request) => {
    const start = Date.now()
    const { method, url } = req
    
    return {
      end: (statusCode: number) => {
        const duration = Date.now() - start
        logger.apiRequest(method, url, statusCode, duration)
      },
    }
  }
}
