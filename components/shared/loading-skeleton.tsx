import * as React from 'react'
import { cn } from '@/lib/utils'

interface LoadingSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'card' | 'list' | 'stats' | 'circle'
  count?: number
}

export function LoadingSkeleton({
  className,
  variant = 'default',
  count = 1,
  ...props
}: LoadingSkeletonProps) {
  if (variant === 'circle') {
    return (
      <div
        className={cn('animate-pulse rounded-full bg-slate-200 dark:bg-slate-800', className)}
        {...props}
      />
    )
  }

  if (variant === 'card') {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className={cn(
              'rounded-xl border border-border bg-card p-5 space-y-3 animate-pulse shadow-xs',
              className
            )}
            {...props}
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="h-8 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-3 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'stats') {
    return (
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className={cn(
              'rounded-xl border border-border bg-card p-4 space-y-2 animate-pulse shadow-xs',
              className
            )}
            {...props}
          >
            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-7 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'list') {
    return (
      <div className={cn('space-y-3 rounded-xl border border-border bg-card p-4', className)} {...props}>
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="flex items-center space-x-4 animate-pulse py-2">
            <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
            <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn('animate-pulse rounded-md bg-slate-200 dark:bg-slate-800', className)}
      {...props}
    />
  )
}
