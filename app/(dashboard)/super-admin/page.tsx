import { createClient } from '@/lib/supabase/server'
import { ShieldAlert } from 'lucide-react'

export default async function SuperAdminDashboard() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let fullName = 'Super Administrator'
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-800">
              Role: super_admin
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl mt-1">
              Super Admin Console
            </h1>
          </div>
        </div>
        <p className="text-lg font-medium text-foreground">
          Logged in as <span className="font-semibold text-red-600 dark:text-red-400">super_admin</span> — {fullName}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Platform-wide SaaS controls: school provisioning, tenant billing management, and cross-tenant audits.
        </p>
      </div>
    </div>
  )
}
