'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  MessageSquare,
  CalendarCheck,
  GraduationCap,
  Laptop,
  BookOpen,
  CreditCard,
  ArrowUpRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickLinkItem {
  title: string
  subtitle: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  theme: {
    bg: string
    border: string
    text: string
    iconBg: string
    badge: string
  }
}

const QUICK_LINKS: QuickLinkItem[] = [
  {
    title: 'Communication',
    subtitle: 'Notices & Messages',
    href: '/student/communication',
    icon: MessageSquare,
    theme: {
      bg: 'bg-sky-50/70 hover:bg-sky-50 dark:bg-sky-950/20 dark:hover:bg-sky-950/30',
      border: 'border-sky-200/80 hover:border-sky-300 dark:border-sky-900/60 dark:hover:border-sky-800',
      text: 'text-sky-900 dark:text-sky-200',
      iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
      badge: 'text-sky-700 dark:text-sky-300',
    },
  },
  {
    title: 'Attendance',
    subtitle: 'Daily Records & Leave',
    href: '/student/attendance',
    icon: CalendarCheck,
    theme: {
      bg: 'bg-emerald-50/70 hover:bg-emerald-50 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30',
      border: 'border-emerald-200/80 hover:border-emerald-300 dark:border-emerald-900/60 dark:hover:border-emerald-800',
      text: 'text-emerald-900 dark:text-emerald-200',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      badge: 'text-emerald-700 dark:text-emerald-300',
    },
  },
  {
    title: 'Results',
    subtitle: 'Exams & Marks Cards',
    href: '/student/result',
    icon: GraduationCap,
    theme: {
      bg: 'bg-amber-50/70 hover:bg-amber-50 dark:bg-amber-950/20 dark:hover:bg-amber-950/30',
      border: 'border-amber-200/80 hover:border-amber-300 dark:border-amber-900/60 dark:hover:border-amber-800',
      text: 'text-amber-900 dark:text-amber-200',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      badge: 'text-amber-700 dark:text-amber-300',
    },
  },
  {
    title: 'Digital Learning',
    subtitle: 'E-Books & Modules',
    href: '/student/digital-learning',
    icon: Laptop,
    theme: {
      bg: 'bg-purple-50/70 hover:bg-purple-50 dark:bg-purple-950/20 dark:hover:bg-purple-950/30',
      border: 'border-purple-200/80 hover:border-purple-300 dark:border-purple-900/60 dark:hover:border-purple-800',
      text: 'text-purple-900 dark:text-purple-200',
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      badge: 'text-purple-700 dark:text-purple-300',
    },
  },
  {
    title: 'Syllabus',
    subtitle: 'Curriculum & Units',
    href: '/student/syllabus',
    icon: BookOpen,
    theme: {
      bg: 'bg-rose-50/70 hover:bg-rose-50 dark:bg-rose-950/20 dark:hover:bg-rose-950/30',
      border: 'border-rose-200/80 hover:border-rose-300 dark:border-rose-900/60 dark:hover:border-rose-800',
      text: 'text-rose-900 dark:text-rose-200',
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      badge: 'text-rose-700 dark:text-rose-300',
    },
  },
  {
    title: 'Fee Payments',
    subtitle: 'Dues & Receipts',
    href: '/student/fee',
    icon: CreditCard,
    theme: {
      bg: 'bg-teal-50/70 hover:bg-teal-50 dark:bg-teal-950/20 dark:hover:bg-teal-950/30',
      border: 'border-teal-200/80 hover:border-teal-300 dark:border-teal-900/60 dark:hover:border-teal-800',
      text: 'text-teal-900 dark:text-teal-200',
      iconBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
      badge: 'text-teal-700 dark:text-teal-300',
    },
  },
]

interface QuickLinksGridProps {
  className?: string
}

export function QuickLinksGrid({ className }: QuickLinksGridProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Quick Access Services
        </h3>
        <span className="text-[11px] text-muted-foreground font-medium">
          Instant Portal Access
        </span>
      </div>

      {/* 2x2 on mobile, 2x3 on larger screens */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {QUICK_LINKS.map((link) => {
          const Icon = link.icon
          return (
            <Link
              key={link.title}
              href={link.href}
              className={cn(
                'group relative rounded-2xl border p-4 sm:p-5 transition-all duration-200 flex flex-col justify-between shadow-2xs hover:shadow-xs hover:-translate-y-0.5',
                link.theme.bg,
                link.theme.border
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className={cn(
                    'flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110 shadow-2xs',
                    link.theme.iconBg
                  )}
                >
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className={cn('h-4 w-4', link.theme.badge)} />
                </div>
              </div>

              <div className="mt-4">
                <h4
                  className={cn(
                    'text-sm sm:text-base font-bold tracking-tight',
                    link.theme.text
                  )}
                >
                  {link.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 truncate">
                  {link.subtitle}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
