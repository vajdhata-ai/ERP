import { createClient } from '@/lib/supabase/server'
import { ShieldCheck } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let fullName = 'Administrator'
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()
    if (profile?.full_name) fullName = profile.full_name
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Role: school_admin
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl mt-1">
              Admin Portal
            </h1>
          </div>
        </div>
        <p className="text-lg font-medium text-foreground">
          Logged in as <span className="font-semibold text-primary">school_admin</span> — {fullName}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Welcome to the Vajdhata School ERP Administration panel. All administrative modules, teacher rosters, class schedules, and fee configurations will appear here in Stage 3 & 4.
        </p>
      </div>
    </div>
  )
}

