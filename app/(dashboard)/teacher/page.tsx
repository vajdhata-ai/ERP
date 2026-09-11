import { createClient } from '@/lib/supabase/server'
import { BookOpen } from 'lucide-react'

export default async function TeacherDashboard() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let fullName = 'Teacher'
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Role: teacher
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl mt-1">
              Teacher Portal
            </h1>
          </div>
        </div>
        <p className="text-lg font-medium text-foreground">
          Logged in as <span className="font-semibold text-emerald-600 dark:text-emerald-400">teacher</span> — {fullName}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Welcome to your teacher portal. Classroom attendance marking, homework assignment creation, and exam grading will be available here.
        </p>
      </div>
    </div>
  )
}

