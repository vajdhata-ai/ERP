import * as React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  retryText?: string
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryText = 'Try Again',
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center animate-in fade-in-50',
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive shadow-xs mb-4">
        <AlertTriangle className="h-7 w-7 stroke-[1.75]" />
      </div>
      <h3 className="text-base font-semibold text-foreground tracking-tight">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm text-muted-foreground leading-relaxed">{message}</p>
      {onRetry && (
        <div className="mt-5">
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="gap-2 border-destructive/30 hover:bg-destructive/10 hover:text-destructive text-destructive font-medium"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {retryText}
          </Button>
        </div>
      )}
    </div>
  )
}
