import * as React from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  actions,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-border/60 mb-6',
        className
      )}
    >
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {(actions || action) && (
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {actions}
          {action}
        </div>
      )}
    </div>
  )
}
