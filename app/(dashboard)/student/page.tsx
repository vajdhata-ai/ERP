import { createClient } from '@/lib/supabase/server'
import { GraduationCap } from 'lucide-react'

export default async function StudentDashboard() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let fullName = 'Student'
  let role = 'student'
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', user.id)
      .single()
    if (profile?.full_name) fullName = profile.full_name
    if (profile?.role) role = profile.role
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
              Role: {role}
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl mt-1">
              Student & Parent Portal
            </h1>
          </div>
        </div>
        <p className="text-lg font-medium text-foreground">
          Logged in as <span className="font-semibold text-sky-600 dark:text-sky-400">{role}</span> — {fullName}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Welcome to your student and parent portal. Attendance history, daily homework submissions, fee payment tracking, live bus tracking, and exam report cards will appear here.
        </p>
      </div>
    </div>
  )
}

