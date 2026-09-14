'use client'

import * as React from 'react'
import { Menu, Search, GraduationCap } from 'lucide-react'
import { Sidebar } from '@/components/shared/sidebar'
import { NotificationBell } from '@/components/shared/notification-bell'
import { UserNav } from '@/components/shared/user-nav'
import { NavItem } from '@/lib/navigation'
import { UserProfile } from '@/lib/types'

interface DashboardShellProps {
  children: React.ReactNode
  navItems: NavItem[]
  profile: UserProfile | null
  schoolName: string
}

export function DashboardShell({
  children,
  navItems,
  profile,
  schoolName,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* ── TOP BAR ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 flex h-14 items-center border-b border-border bg-card/90 backdrop-blur-sm px-3 sm:px-5 gap-3 shadow-xs">
        {/* Hamburger – mobile only */}
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation"
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-accent transition-colors"
        >
          <Menu className="h-4.5 w-4.5" style={{ height: 18, width: 18 }} />
        </button>

        {/* School Identity */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div className="hidden sm:block min-w-0">
            <p className="text-sm font-bold text-foreground tracking-tight leading-none truncate max-w-[160px] md:max-w-[220px]">
              {schoolName}
            </p>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider leading-none mt-0.5">
              School ERP
            </p>
          </div>
        </div>

        <div className="flex-1" />

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Search icon (placeholder — full search in Stage 6) */}
          <button
            type="button"
            aria-label="Search"
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-accent transition-colors"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Notification Bell */}
          <NotificationBell
            profileId={profile?.id}
            schoolId={profile?.school_id ?? undefined}
          />

          {/* Profile Chip */}
          <UserNav profile={profile} />
        </div>
      </header>

      {/* ── BODY: Sidebar + Main ────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar
          navItems={navItems}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content area */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
