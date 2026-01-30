import { NextRequest } from 'next/server'
import { RateLimitError } from './errors'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  max: number // Max requests per window
}

/**
 * In-memory rate limiter (use Redis in production for distributed systems)
 */
export class RateLimiter {
  constructor(private config: RateLimitConfig) {}

  async check(identifier: string): Promise<boolean> {
    const now = Date.now()
    const record = store[identifier]

    // Clean up expired records periodically
    if (Math.random() < 0.01) {
      this.cleanup()
    }

    if (!record || now > record.resetTime) {
      // Create new record or reset expired one
      store[identifier] = {
        count: 1,
        resetTime: now + this.config.windowMs,
      }
      return true
    }

    if (record.count >= this.config.max) {
      return false
    }

    record.count++
    return true
  }

  private cleanup() {
    const now = Date.now()
    for (const key in store) {
      if (store[key].resetTime < now) {
        delete store[key]
      }
    }
  }

  getRemainingRequests(identifier: string): number {
    const record = store[identifier]
    if (!record || Date.now() > record.resetTime) {
      return this.config.max
    }
    return Math.max(0, this.config.max - record.count)
  }

  getResetTime(identifier: string): number {
    const record = store[identifier]
    if (!record) {
      return Date.now() + this.config.windowMs
    }
    return record.resetTime
  }
}

/**
 * Get identifier for rate limiting (IP address or user ID)
 */
export function getRateLimitIdentifier(request: NextRequest, userId?: string): string {
  if (userId) {
    return `user:${userId}`
  }

  // Get IP from various possible headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'
  
  return `ip:${ip}`
}

/**
 * Apply rate limiting to a request
 */
export async function applyRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  userId?: string
): Promise<void> {
  const identifier = getRateLimitIdentifier(request, userId)
  const limiter = new RateLimiter(config)

  const allowed = await limiter.check(identifier)

  if (!allowed) {
    const resetTime = limiter.getResetTime(identifier)
    const retryAfter = Math.ceil((resetTime - Date.now()) / 1000)
    
    throw new RateLimitError(
      `Rate limit exceeded. Try again in ${retryAfter} seconds.`
    )
  }
}

/**
 * Predefined rate limit configurations
 */
export const RateLimits = {
  // Strict: 10 requests per minute
  STRICT: {
    windowMs: 60 * 1000,
    max: 10,
  },
  // Standard: 100 requests per minute
  STANDARD: {
    windowMs: 60 * 1000,
    max: 100,
  },
  // Lenient: 500 requests per 5 minutes
  LENIENT: {
    windowMs: 5 * 60 * 1000,
    max: 500,
  },
  // File upload: 10 uploads per 10 minutes
  FILE_UPLOAD: {
    windowMs: 10 * 60 * 1000,
    max: 10,
  },
  // Authentication: 5 attempts per 15 minutes
  AUTH: {
    windowMs: 15 * 60 * 1000,
    max: 5,
  },
}
