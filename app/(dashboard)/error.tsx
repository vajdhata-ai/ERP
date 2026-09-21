'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard Error Boundary Caught:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
      <div className="h-16 w-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Something went wrong!</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        An error occurred while rendering this module. We've isolated the issue so the rest of your dashboard remains functional.
      </p>
      
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-bold shadow-md hover:bg-primary/90 transition-all active:scale-95"
        >
          <RefreshCcw className="h-4 w-4" /> Try again
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="px-6 py-2.5 font-bold text-muted-foreground hover:bg-muted rounded-lg transition-all"
        >
          Return Home
        </button>
      </div>
    </div>
  )
}
