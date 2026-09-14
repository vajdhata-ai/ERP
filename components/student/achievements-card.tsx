'use client'

import * as React from 'react'
import {
  Award,
  Star,
  Quote,
  Calendar,
  UserCheck,
  Sparkles,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { EmptyState } from '@/components/shared/empty-state'
import { AchievementRemarkItem } from '@/lib/data/student-dashboard'
import { cn } from '@/lib/utils'

interface AchievementsCardProps {
  achievements: AchievementRemarkItem[]
  studentName?: string
  className?: string
}

export function AchievementsCard({
  achievements,
  studentName,
  className,
}: AchievementsCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs transition-all space-y-4',
        className
      )}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
              Achievements & Teacher Remarks
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2 py-0.2 rounded-full">
                <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                Merit Log
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Recognitions, academic honours, and formal educator commendations
            </p>
          </div>
        </div>

        {achievements.length > 0 && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
            {achievements.length} Recorded
          </span>
        )}
      </div>

      {/* Content: Remarks list OR shared EmptyState */}
      {achievements.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No Achievements or Remarks Yet"
          message={`No formal academic commendations or teacher remarks have been recorded for ${
            studentName || 'this student'
          } yet.`}
          className="min-h-[220px] bg-muted/20 border-border/70"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {achievements.map((item) => {
            let formattedDate = 'Recent'
            try {
              formattedDate = format(parseISO(item.created_at), 'dd MMMM yyyy')
            } catch {
              formattedDate = item.created_at
            }

            const isPositive = item.remark_type === 'positive'
            const isNegative = item.remark_type === 'negative'

            return (
              <div
                key={item.id}
                className={cn(
                  'relative rounded-xl border p-4 transition-all shadow-2xs flex flex-col justify-between space-y-3',
                  isPositive &&
                    'bg-amber-50/40 dark:bg-amber-950/15 border-amber-200/80 dark:border-amber-900/60',
                  isNegative &&
                    'bg-rose-50/40 dark:bg-rose-950/15 border-rose-200/80 dark:border-rose-900/60',
                  !isPositive &&
                    !isNegative &&
                    'bg-card border-border/70 hover:bg-muted/30'
                )}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border',
                        isPositive &&
                          'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800',
                        isNegative &&
                          'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800',
                        !isPositive &&
                          !isNegative &&
                          'bg-muted text-muted-foreground border-border'
                      )}
                    >
                      <Sparkles className="h-3 w-3" />
                      {isPositive ? 'Commendation' : item.remark_type}
                    </span>

                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                      <Calendar className="h-3 w-3" />
                      {formattedDate}
                    </span>
                  </div>

                  {/* Remark text */}
                  <div className="relative pl-3 text-xs sm:text-sm text-foreground leading-relaxed italic border-l-2 border-amber-500/40">
                    <Quote className="h-3 w-3 text-amber-500/40 inline-block mr-1 -mt-1" />
                    {item.remark_text}
                  </div>
                </div>

                {/* Teacher info */}
                <div className="pt-2 border-t border-border/40 flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                  <UserCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">Recorded by {item.given_by_name}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
