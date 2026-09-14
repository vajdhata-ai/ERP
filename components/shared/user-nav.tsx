'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { UserProfile } from '@/lib/types'
import { LogOut, User, ShieldCheck, ChevronDown } from 'lucide-react'

export function UserNav({ profile }: { profile: UserProfile | null }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true)
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch (err) {
      console.error('Logout error:', err)
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

  // If user has class info (e.g. Student Class X-A)
  const secondaryLabel =
    profile?.class_name
      ? `Class ${profile.class_name}${profile.section_name ? `-${profile.section_name}` : ''}`
      : roleLabels[role] || role

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 rounded-full border border-border bg-card p-1 pr-2.5 sm:pr-3 hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-expanded={isOpen}
      >
        {profile?.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt={displayName}
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover shadow-xs border border-border"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-xs shadow-xs">
            {initials}
          </div>
        )}
        <div className="hidden md:flex flex-col items-start text-left">
          <span className="text-xs font-semibold leading-tight text-foreground line-clamp-1 max-w-[120px]">
            {displayName}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[120px]">
            {secondaryLabel}
          </span>
        </div>
        <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block opacity-70" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 sm:w-60 origin-top-right rounded-2xl border border-border bg-card p-2 shadow-xl z-50 text-foreground animate-in fade-in-50 zoom-in-95">
          <div className="px-3 py-2.5 border-b border-border/70">
            <p className="text-sm font-semibold truncate text-foreground">{displayName}</p>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  roleBadges[role] || 'bg-secondary text-secondary-foreground'
                }`}
              >
                <ShieldCheck className="h-3 w-3" />
                {roleLabels[role] || role}
              </span>
              {profile?.class_name && (
                <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  Class {profile.class_name}{profile.section_name ? `-${profile.section_name}` : ''}
                </span>
              )}
            </div>
          </div>

          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-accent transition-colors"
            >
              <User className="h-4 w-4 text-muted-foreground" />
              <span>My Profile</span>
            </Link>
          </div>

          <div className="border-t border-border/70 pt-1">
            <button
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              <span>{isLoggingOut ? 'Signing out...' : 'Logout'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
