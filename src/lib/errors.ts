import { NextResponse } from 'next/server'

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_ERROR')
    this.name = 'RateLimitError'
  }
}

/**
 * Handle API errors and return appropriate responses
 */
export function handleAPIError(error: unknown): NextResponse {
  console.error('API Error:', error)

  // Handle known app errors
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    )
  }

  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: unknown }
    
    if (prismaError.code === 'P2002') {
      return NextResponse.json(
        { error: 'A record with this information already exists' },
        { status: 409 }
      )
    }
    
    if (prismaError.code === 'P2025') {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      )
    }
  }

  // Handle validation errors
  if (error instanceof Error && error.message.includes('validation')) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  // Generic error
  const message = error instanceof Error ? error.message : 'Internal server error'
  
  return NextResponse.json(
    {
      error: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred'
        : message,
    },
    { status: 500 }
  )
}

/**
 * Async error wrapper for API routes
 */
export function catchAsync(
  handler: (request: Request, context?: unknown) => Promise<NextResponse>
) {
  return async (request: Request, context?: unknown) => {
    try {
      return await handler(request, context)
    } catch (error) {
      return handleAPIError(error)
    }
  }
}

/**
 * Log error to monitoring service
 */
export function logError(error: Error, context?: Record<string, unknown>) {
  const errorLog = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    timestamp: new Date().toISOString(),
    context,
    environment: process.env.NODE_ENV,
  }

  // In production, send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Integration point for error tracking (e.g., Sentry, LogRocket)
    console.error('[Production Error]', JSON.stringify(errorLog, null, 2))
  } else {
    console.error('[Development Error]', errorLog)
  }
}
