'use client'

import React from 'react'

type ToastVariant = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  id: string
  title?: string
  message: string
  variant?: ToastVariant
  onClose?: (id: string) => void
}

const variantClasses: Record<ToastVariant, string> = {
  success: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
  error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
  warning: 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300',
  info: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
}

export const Toast: React.FC<ToastProps> = ({ id, title, message, variant = 'info', onClose }) => (
  <div className={`w-full rounded-lg border p-4 shadow-sm ${variantClasses[variant]}`} role="status">
    <div className="flex items-start justify-between gap-4">
      <div>
        {title && <p className="font-semibold mb-1">{title}</p>}
        <p className="text-sm">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={() => onClose(id)}
          className="text-sm font-semibold opacity-70 hover:opacity-100"
          aria-label="Close notification"
        >
          ✕
        </button>
      )}
    </div>
  </div>
)

interface ToastContainerProps {
  toasts: ToastProps[]
  onClose?: (id: string) => void
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => (
  <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 w-80">
    {toasts.map((toast) => (
      <Toast key={toast.id} {...toast} onClose={onClose} />
    ))}
  </div>
)
