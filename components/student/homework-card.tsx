'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  BookOpen,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { HomeworkItem } from '@/lib/data/student-dashboard'
import { cn } from '@/lib/utils'

interface HomeworkCardProps {
  homework: HomeworkItem[]
  className?: string
}

export function HomeworkCard({ homework, className }: HomeworkCardProps) {
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
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground tracking-tight">
                Homework & Assignments
              </h3>
              <p className="text-xs text-muted-foreground">
                Current tasks, practice sheets, and submission deadlines
              </p>
            </div>
          </div>

          <Link
            href="/student/homework"
            className="group inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors shrink-0"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Homework list */}
        <div className="mt-4 space-y-3">
          {homework.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-6 text-center">
              <Layers className="h-6 w-6 mx-auto text-muted-foreground mb-2 stroke-[1.5]" />
              <p className="text-xs font-semibold text-foreground">No pending homework</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                All assigned tasks for this class are complete or not yet posted.
              </p>
            </div>
          ) : (
            homework.map((item) => {
              let formattedCreated = 'Recent'
              let formattedDue = 'Upcoming'

              try {
                formattedCreated = format(parseISO(item.created_at), 'dd MMM yyyy')
              } catch {
                formattedCreated = item.created_at
              }

              try {
                formattedDue = format(parseISO(item.due_date), 'dd MMM yyyy')
              } catch {
                formattedDue = item.due_date
              }

              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-border/70 bg-card p-3.5 hover:border-indigo-500/40 hover:bg-muted/30 transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Subject tag */}
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shrink-0">
                        {item.subject}
                      </span>

                      {/* Type badge */}
                      <span className="text-[10px] font-medium text-muted-foreground capitalize">
                        {item.type}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-foreground line-clamp-1">
                      {item.title}
                    </h4>

                    {item.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Dates & Status Pill */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-border/40">
                    {/* Status Pill */}
                    {item.status === 'submitted' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 shrink-0">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                        Submitted
                      </span>
                    ) : item.status === 'late' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 shrink-0">
                        <AlertCircle className="h-3 w-3 text-rose-600 dark:text-rose-400" />
                        Overdue
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 shrink-0">
                        <Clock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                        Pending
                      </span>
                    )}

                    {/* Dates metadata */}
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground/70" />
                        Assigned: {formattedCreated}
                      </span>
                      <span className="font-semibold text-foreground">
                        Due: {formattedDue}
                      </span>
                    </div>
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
