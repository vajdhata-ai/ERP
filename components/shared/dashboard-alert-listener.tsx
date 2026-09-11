'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'

export function DashboardAlertListener() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (searchParams.get('unauthorized') === 'true') {
      toast.error("You don't have access to that page.", {
        description: "You've been redirected back to your authorized portal.",
        duration: 5000,
      })

      // Clean up URL without reload
      const newParams = new URLSearchParams(searchParams.toString())
      newParams.delete('unauthorized')
      const newQuery = newParams.toString()
      const newUrl = newQuery ? `${pathname}?${newQuery}` : pathname
      router.replace(newUrl, { scroll: false })
    }
  }, [searchParams, router, pathname])

  return null
}
