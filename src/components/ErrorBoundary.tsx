'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { Card } from './Card'
import { Button } from './Button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error boundary caught:', error, errorInfo)
    
    // Log to monitoring service in production
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // Integration point for error tracking service (e.g., Sentry)
      // window.errorTracker?.captureException(error, { extra: errorInfo })
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="max-w-2xl w-full">
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Something went wrong
              </h1>
              <p className="text-muted-foreground mb-6">
                We&apos;re sorry, but something unexpected happened. Please try refreshing the page.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-left">
                  <p className="font-mono text-sm text-red-700 dark:text-red-300 mb-2">
                    {this.state.error.message}
                  </p>
                  <pre className="font-mono text-xs text-red-600 dark:text-red-400 overflow-x-auto">
                    {this.state.error.stack}
                  </pre>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <Button onClick={this.handleReset} variant="primary">
                  Try Again
                </Button>
                <Button onClick={() => window.location.href = '/'} variant="outline">
                  Go Home
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Page-level error boundary component
 */
export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="max-w-md w-full">
            <div className="p-6 text-center">
              <div className="text-4xl mb-3">😕</div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Page Error
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                This page encountered an error. Please go back and try again.
              </p>
              <Button onClick={() => window.history.back()} variant="primary" size="sm">
                Go Back
              </Button>
            </div>
          </Card>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}
