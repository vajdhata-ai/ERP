'use client'

import * as React from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from 'lucide-react'
import {
  format,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns'
import { CalendarEvent } from '@/lib/types'
import { cn } from '@/lib/utils'

interface CalendarWidgetProps {
  events?: CalendarEvent[]
  className?: string
  onDateSelect?: (date: Date) => void
}

const DEFAULT_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Science Fair Exhibition',
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'event',
    description: 'Annual school science project exhibition in the auditorium.',
  },
  {
    id: '2',
    title: 'Mid-term Revision Test',
    date: format(new Date(Date.now() + 86400000 * 3), 'yyyy-MM-dd'),
    type: 'exam',
    description: 'Mathematics and Physical Sciences unit test.',
  },
  {
    id: '3',
    title: 'Parent-Teacher Meeting',
    date: format(new Date(Date.now() + 86400000 * 7), 'yyyy-MM-dd'),
    type: 'meeting',
    description: 'Quarterly review discussion with class teachers.',
  },
  {
    id: '4',
    title: 'National Holiday',
    date: format(new Date(Date.now() + 86400000 * 12), 'yyyy-MM-dd'),
    type: 'holiday',
    description: 'School remains closed.',
  },
]

export function CalendarWidget({
  events = DEFAULT_EVENTS,
  className,
  onDateSelect,
}: CalendarWidgetProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date())
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date())

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }) // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days = eachDayOfInterval({ start: startDate, end: endDate })

  const handleDateClick = (day: Date) => {
    setSelectedDate(day)
    if (onDateSelect) {
      onDateSelect(day)
    }
  }

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')
  const selectedDayEvents = events.filter((e) => e.date === selectedDateStr)

  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs flex flex-col',
        className
      )}
    >
      {/* Month Navigation Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CalendarIcon className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold text-foreground tracking-tight">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 text-center text-[11px] font-medium text-muted-foreground mb-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className="py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {days.map((day, i) => {
          const dayStr = format(day, 'yyyy-MM-dd')
          const isSelected = isSameDay(day, selectedDate)
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isCurrentDay = isToday(day)
          const dayEvents = events.filter((e) => e.date === dayStr)
          const hasEvents = dayEvents.length > 0

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleDateClick(day)}
              className={cn(
                'relative flex h-8 sm:h-9 w-full flex-col items-center justify-center rounded-lg text-xs transition-all font-medium',
                !isCurrentMonth && 'text-muted-foreground/40',
                isCurrentMonth && !isSelected && 'text-foreground hover:bg-accent/70',
                isSelected && 'bg-primary text-primary-foreground font-semibold shadow-xs',
                isCurrentDay && !isSelected && 'border border-primary text-primary font-bold'
              )}
            >
              <span>{format(day, 'd')}</span>
              {hasEvents && (
                <span
                  className={cn(
                    'absolute bottom-1 h-1 w-1 rounded-full',
                    isSelected ? 'bg-primary-foreground' : 'bg-primary'
                  )}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Selected Day Agenda Snippet */}
      <div className="mt-4 pt-3 border-t border-border/60">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-2">
          <span>Schedule for {format(selectedDate, 'MMM d, yyyy')}</span>
          <span className="font-medium text-foreground">{selectedDayEvents.length} items</span>
        </div>

        {selectedDayEvents.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-1">
            No events scheduled for this day.
          </p>
        ) : (
          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {selectedDayEvents.map((evt) => (
              <div
                key={evt.id}
                className="rounded-lg border border-border/80 bg-muted/40 p-2 text-left text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground truncate">{evt.title}</span>
                  <span
                    className={cn(
                      'text-[9px] px-1.5 py-0.2 rounded-full uppercase tracking-wider font-semibold shrink-0 ml-1',
                      evt.type === 'holiday' && 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
                      evt.type === 'exam' && 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
                      evt.type === 'meeting' && 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
                      evt.type === 'event' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    )}
                  >
                    {evt.type || 'Event'}
                  </span>
                </div>
                {evt.description && (
                  <p className="mt-1 text-[11px] text-muted-foreground line-clamp-1">
                    {evt.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
