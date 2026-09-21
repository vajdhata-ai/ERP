'use client'

import * as React from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { getLocalCalendarEvents } from '@/lib/data/calendar'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths, isWithinInterval, parseISO } from 'date-fns'

export default function StudentCalendarPage() {
  const [events, setEvents] = React.useState(getLocalCalendarEvents())
  const [currentDate, setCurrentDate] = React.useState(new Date())

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const startDayOfWeek = monthStart.getDay()
  const blanks = Array.from({ length: startDayOfWeek }, (_, i) => i)

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Holiday': return 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/40 dark:text-orange-300'
      case 'Exam': return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300'
      case 'Event': default: return 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300'
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="School Calendar" 
        subtitle="Holidays, exams, and important events."
      />

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main Calendar */}
        <div className="lg:col-span-3 rounded-2xl border bg-card shadow-sm overflow-hidden flex flex-col min-h-[600px]">
          <div className="p-4 border-b flex items-center justify-between bg-muted/20">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-xs font-semibold border rounded-lg hover:bg-muted mr-2">Today</button>
              <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1.5 border rounded-lg hover:bg-muted"><ChevronLeft className="h-4 w-4" /></button>
              <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1.5 border rounded-lg hover:bg-muted"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 border-b bg-muted/10">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center text-xs font-bold uppercase tracking-wide text-muted-foreground border-r last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          <div className="flex-1 grid grid-cols-7 grid-rows-5 bg-muted/5">
            {blanks.map(b => <div key={`blank-${b}`} className="border-r border-b p-2 min-h-[100px]" />)}
            
            {days.map(day => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const dayEvents = events.filter(e => {
                const start = parseISO(e.start_date)
                const end = parseISO(e.end_date)
                return isWithinInterval(day, { start, end }) || dateStr === e.start_date
              })

              return (
                <div key={dateStr} className={`border-r border-b p-2 min-h-[100px] flex flex-col gap-1 transition-colors ${isToday(day) ? 'bg-primary/5' : 'hover:bg-muted/30'}`}>
                  <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${isToday(day) ? 'bg-primary text-primary-foreground' : 'text-foreground'}`}>
                    {format(day, 'd')}
                  </span>
                  <div className="flex-1 flex flex-col gap-1 overflow-y-auto no-scrollbar">
                    {dayEvents.map(ev => {
                      const isStart = dateStr === ev.start_date
                      const isEnd = dateStr === ev.end_date
                      return (
                        <div key={ev.id} className={`text-[10px] font-bold px-1.5 py-1 truncate border-y border-l border-r 
                          ${getTypeColor(ev.event_type)}
                          ${!isStart ? 'border-l-0 rounded-l-none -ml-2 pl-3' : 'rounded-l-md'}
                          ${!isEnd ? 'border-r-0 rounded-r-none -mr-2 pr-3' : 'rounded-r-md'}
                        `} title={ev.title}>
                          {ev.title}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Sidebar Events */}
        <div className="rounded-2xl border bg-card shadow-sm p-4 h-fit max-h-[600px] flex flex-col">
          <h3 className="font-bold text-sm uppercase tracking-wide text-muted-foreground mb-4">Upcoming Events</h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {events
              .filter(e => new Date(e.end_date) >= new Date(new Date().setHours(0,0,0,0)))
              .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
              .slice(0, 10)
              .map(ev => (
                <div key={ev.id} className="p-3 rounded-xl border bg-background hover:border-primary/50 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${getTypeColor(ev.event_type)} border-none`}>
                      {ev.event_type}
                    </span>
                  </div>
                  <p className="text-sm font-bold leading-tight mt-1">{ev.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {ev.start_date === ev.end_date 
                      ? format(parseISO(ev.start_date), 'd MMM yyyy')
                      : `${format(parseISO(ev.start_date), 'd MMM')} - ${format(parseISO(ev.end_date), 'd MMM yyyy')}`}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
