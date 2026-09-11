import React, { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { UserNav } from '@/components/shared/user-nav'
import { DashboardAlertListener } from '@/components/shared/dashboard-alert-listener'
import { UserProfile } from '@/lib/types'
import { GraduationCap } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile: UserProfile | null = null
  let schoolName = 'VAJDHATA ERP'

  if (user) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, school_id, full_name, role, phone, avatar_url, is_active, created_at, updated_at, schools(id, name, school_code)')
      .eq('id', user.id)
      .single()

    if (profileData) {
      profile = profileData as unknown as UserProfile
      if (profileData.schools && !Array.isArray(profileData.schools)) {
        schoolName = (profileData.schools as { name: string }).name || schoolName
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Suspense fallback={null}>
        <DashboardAlertListener />
      </Suspense>

      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-sm sm:text-base text-foreground tracking-tight line-clamp-1">
              {schoolName}
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Vajdhata Multi-Tenant School ERP
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <UserNav profile={profile} />
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
        {children}
      </main>
    </div>
  )
}

