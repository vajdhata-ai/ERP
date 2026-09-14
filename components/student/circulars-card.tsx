'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Bell,
  ArrowRight,
  Calendar,
  Sparkles,
  Layers,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { CircularItem } from '@/lib/data/student-dashboard'
import { cn } from '@/lib/utils'

interface CircularsCardProps {
  circulars: CircularItem[]
  studentClassName?: string
  className?: string
}

// Category color mappings
const CATEGORY_STYLES: Record<string, string> = {
  Sports: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
  Academic: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800',
  Notice: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
  Event: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
  General: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800',
}

export function CircularsCard({
  circulars,
  studentClassName,
  className,
}: CircularsCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-all',
        className
      )}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
                Circulars & Notices
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  <Sparkles className="h-2.5 w-2.5" />
                  Live Feed
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Official notices for all school and Class {studentClassName || 'XII'}
              </p>
            </div>
          </div>

          <Link
            href="/student/communication"
            className="group inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors shrink-0"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Circulars List */}
        <div className="mt-4 space-y-3">
          {circulars.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-6 text-center">
              <Layers className="h-6 w-6 mx-auto text-muted-foreground mb-2 stroke-[1.5]" />
              <p className="text-xs font-semibold text-foreground">No circulars posted yet</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                New school and class announcements will appear here.
              </p>
            </div>
          ) : (
            circulars.map((circ) => {
              let formattedDate = 'Recent'
              try {
                formattedDate = format(parseISO(circ.created_at), 'dd MMM yyyy')
              } catch {
                formattedDate = circ.created_at
              }

              const catStyle =
                CATEGORY_STYLES[circ.category] || CATEGORY_STYLES.General

              return (
                <div
                  key={circ.id}
                  className="group relative rounded-xl border border-border/70 bg-card p-3.5 hover:border-primary/40 hover:bg-muted/30 transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={cn(
                          'text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border shrink-0',
                          catStyle
                        )}
                      >
                        {circ.category}
                      </span>
                      {circ.target_class_id ? (
                        <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2 py-0.2 rounded-md shrink-0">
                          Class Specific
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-0.2 rounded-md shrink-0">
                          Whole School
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {circ.title}
                    </h4>

                    <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">
                      {circ.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground shrink-0 sm:self-center font-medium">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                    <span>{formattedDate}</span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
