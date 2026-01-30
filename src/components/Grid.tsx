'use client'

import React from 'react'

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

const gapClasses: Record<NonNullable<GridProps['gap']>, string> = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
}

const columnClasses: Record<NonNullable<GridProps['columns']>, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6',
  8: 'md:grid-cols-8',
  10: 'md:grid-cols-10',
  12: 'md:grid-cols-12',
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ columns = 12, gap = 'md', className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={`grid grid-cols-1 ${columnClasses[columns]} ${gapClasses[gap]} ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  )
)

Grid.displayName = 'Grid'

interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12
}

const spanClasses: Record<NonNullable<GridItemProps['span']>, string> = {
  1: 'md:col-span-1',
  2: 'md:col-span-2',
  3: 'md:col-span-3',
  4: 'md:col-span-4',
  5: 'md:col-span-5',
  6: 'md:col-span-6',
  8: 'md:col-span-8',
  10: 'md:col-span-10',
  12: 'md:col-span-12',
}

export const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  ({ span = 12, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={`${spanClasses[span]} ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  )
)

GridItem.displayName = 'GridItem'
