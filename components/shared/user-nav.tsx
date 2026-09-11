'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { UserProfile } from '@/lib/types'
import { LogOut, User, ShieldCheck } from 'lucide-react'

export function UserNav({ profile }: { profile: UserProfile | null }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true)
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch (err) {
      console.error('Logout error:', err)
      // Fallback
      window.location.href = '/api/auth/signout'
    }
  }

  const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin',
    school_admin: 'School Admin',
    teacher: 'Teacher',
    student: 'Student',
    parent: 'Parent',
    accountant: 'Accountant',
    librarian: 'Librarian',
  }

  const roleBadges: Record<string, string> = {
    super_admin: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
    school_admin: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
    teacher: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    student: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
    parent: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    accountant: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
    librarian: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
  }

  const role = profile?.role || 'student'
  const displayName = profile?.full_name || 'User'
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('') || 'U'

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 rounded-full border border-border p-1.5 pr-3 hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-expanded={isOpen}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-xs shadow-sm">
          {initials}
        </div>
        <div className="hidden sm:flex flex-col items-start text-left">
          <span className="text-xs font-semibold leading-tight text-foreground line-clamp-1 max-w-[120px]">
            {displayName}
          </span>
          <span className="text-[10px] text-muted-foreground capitalize">
            {roleLabels[role] || role}
          </span>
        </div>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-border bg-card p-2 shadow-lg z-50 text-foreground animate-in fade-in-50 zoom-in-95">
            <div className="px-3 py-2 border-b border-border/60">
              <p className="text-sm font-semibold truncate">{displayName}</p>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    roleBadges[role] || 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  <ShieldCheck className="h-3 w-3" />
                  {roleLabels[role] || role}
                </span>
              </div>
            </div>

            <div className="py-1">
              <div className="px-3 py-1.5 text-xs text-muted-foreground flex items-center gap-2">
                <User className="h-3.5 w-3.5" />
                <span className="truncate">{profile?.phone || 'Account active'}</span>
              </div>
            </div>

            <div className="border-t border-border/60 pt-1">
              <button
                onClick={handleSignOut}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
              >
                <LogOut className="h-3.5 w-3.5" />
                {isLoggingOut ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
