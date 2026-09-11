import { createClient } from '@/lib/supabase/server'
import { Banknote } from 'lucide-react'

export default async function AccountantDashboard() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let fullName = 'Accountant'
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
            <Banknote className="h-6 w-6" />
          </div>
          <div>
            <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Role: accountant
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl mt-1">
              Accounts Portal
            </h1>
          </div>
        </div>
        <p className="text-lg font-medium text-foreground">
          Logged in as <span className="font-semibold text-purple-600 dark:text-purple-400">accountant</span> — {fullName}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Welcome to the Accounts portal. Fee structure definitions, offline receipt generation, Razorpay reconciliations, and defaulter tracking will appear here.
        </p>
      </div>
    </div>
  )
}

