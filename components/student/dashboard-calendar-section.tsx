'use client'

import * as React from 'react'
import {
  Calendar as CalendarIcon,
  Sparkles,
  Clock,
  CalendarDays,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { CalendarWidget } from '@/components/shared/calendar-widget'
import { CalendarEventItem } from '@/lib/data/student-dashboard'
import { CalendarEvent } from '@/lib/types'
import { cn } from '@/lib/utils'

interface DashboardCalendarSectionProps {
  events: CalendarEventItem[]
  className?: string
}

export function DashboardCalendarSection({
  events,
  className,
}: DashboardCalendarSectionProps) {
  // Map CalendarEventItem to CalendarWidget's CalendarEvent type
  const widgetEvents: CalendarEvent[] = React.useMemo(() => {
    return events.map((e) => ({
      id: e.id,
      title: e.title,
      date: e.start_date,
      type: e.event_type,
      description: e.description || undefined,
    }))
  }, [events])

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarIcon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground tracking-tight">
              School Calendar & Schedule
            </h3>
            <p className="text-xs text-muted-foreground">
              Current month view with today highlighted and upcoming 30-day agenda
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
          <Sparkles className="h-3 w-3" />
          Next 30 Days
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Reused CalendarWidget from Stage 3 */}
        <div className="lg:col-span-5">
          <CalendarWidget events={widgetEvents} />
        </div>

        {/* Right: Events List Below/Adjacent pulling from calendar_events for next 30 days */}
        <div className="lg:col-span-7 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">
                  Upcoming Events (Next 30 Days)
                </h4>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                {events.length} Scheduled
              </span>
            </div>

            {events.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-8 text-center">
                <CalendarIcon className="h-6 w-6 mx-auto text-muted-foreground mb-2 stroke-[1.5]" />
                <p className="text-xs font-semibold text-foreground">No events in the next 30 days</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Check back later or view the full annual calendar.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {events.map((evt) => {
                  let formattedDay = '01'
                  let formattedMonth = 'OCT'
                  let fullDateStr = evt.start_date

                  try {
                    const parsed = parseISO(evt.start_date)
                    formattedDay = format(parsed, 'dd')
                    formattedMonth = format(parsed, 'MMM')
                    fullDateStr = format(parsed, 'dd MMMM yyyy')
                  } catch {
                    fullDateStr = evt.start_date
                  }

                  const isMultiDay = evt.end_date && evt.end_date !== evt.start_date

                  return (
                    <div
                      key={evt.id}
                      className="group rounded-xl border border-border/70 bg-card hover:bg-muted/30 hover:border-primary/40 p-3 transition-all flex items-start gap-3.5 shadow-2xs"
                    >
                      {/* Date Badge */}
                      <div className="flex flex-col items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary h-12 w-12 shrink-0 font-sans shadow-2xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider leading-none">
                          {formattedMonth}
                        </span>
                        <span className="text-base font-black leading-none mt-0.5">
                          {formattedDay}
                        </span>
                      </div>

                      {/* Event Details */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h5 className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {evt.title}
                          </h5>

                          <span
                            className={cn(
                              'text-[9px] uppercase font-bold tracking-wider px-2 py-0.2 rounded-full shrink-0',
                              evt.event_type === 'holiday' &&
                                'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
                              evt.event_type === 'exam' &&
                                'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
                              evt.event_type === 'event' &&
                                'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
                              (evt.event_type === 'meeting' || evt.event_type === 'general') &&
                                'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800'
                            )}
                          >
                            {evt.event_type}
                          </span>
                        </div>

                        {evt.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                            {evt.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 pt-0.5 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground/70" />
                            {fullDateStr}
                            {isMultiDay && ` to ${evt.end_date}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
