'use client'

import React from 'react'

export const Table = React.forwardRef<HTMLTableElement, React.TableHTMLAttributes<HTMLTableElement>>(
  ({ className, children, ...props }, ref) => (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table
        ref={ref}
        className={`w-full border-collapse text-sm ${className || ''}`}
        {...props}
      >
        {children}
      </table>
    </div>
  )
)

Table.displayName = 'Table'

export const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, children, ...props }, ref) => (
    <thead
      ref={ref}
      className={`bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 ${className || ''}`}
      {...props}
    >
      {children}
    </thead>
  )
)

TableHeader.displayName = 'TableHeader'

export const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, children, ...props }, ref) => (
    <tbody
      ref={ref}
      className={`divide-y divide-gray-200 dark:divide-gray-700 ${className || ''}`}
      {...props}
    >
      {children}
    </tbody>
  )
)

TableBody.displayName = 'TableBody'

export const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, children, ...props }, ref) => (
    <tr
      ref={ref}
      className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${className || ''}`}
      {...props}
    >
      {children}
    </tr>
  )
)

TableRow.displayName = 'TableRow'

export const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, children, ...props }, ref) => (
    <th
      ref={ref}
      className={`px-6 py-3 text-left font-semibold text-gray-900 dark:text-white ${className || ''}`}
      {...props}
    >
      {children}
    </th>
  )
)

TableHead.displayName = 'TableHead'

export const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, children, ...props }, ref) => (
    <td
      ref={ref}
      className={`px-6 py-4 text-gray-900 dark:text-gray-100 ${className || ''}`}
      {...props}
    >
      {children}
    </td>
  )
)

TableCell.displayName = 'TableCell'
