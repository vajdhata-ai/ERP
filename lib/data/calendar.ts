// lib/data/calendar.ts
export type CalendarEvent = {
  id: string
  title: string
  event_type: 'Holiday' | 'Event' | 'Exam'
  start_date: string
  end_date: string
  description?: string
}

export const DEMO_EVENTS: CalendarEvent[] = [
  { id: 'c-1', title: 'Summer Vacation', event_type: 'Holiday', start_date: '2026-05-15', end_date: '2026-06-20', description: 'School closed for summer.' },
  { id: 'c-2', title: 'Independence Day', event_type: 'Event', start_date: '2026-08-15', end_date: '2026-08-15', description: 'Flag hoisting at 8:00 AM.' },
  { id: 'c-3', title: 'Term 1 Exams', event_type: 'Exam', start_date: '2026-09-10', end_date: '2026-09-22', description: 'Half yearly assessments.' },
  { id: 'c-4', title: 'Diwali Break', event_type: 'Holiday', start_date: '2026-11-08', end_date: '2026-11-12' },
  { id: 'c-5', title: 'Annual Sports Day', event_type: 'Event', start_date: '2026-12-15', end_date: '2026-12-16' },
]

export function getLocalCalendarEvents() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('erp_calendar_events')
    if (saved) return JSON.parse(saved) as CalendarEvent[]
    localStorage.setItem('erp_calendar_events', JSON.stringify(DEMO_EVENTS))
  }
  return DEMO_EVENTS
}

export function saveLocalCalendarEvents(events: CalendarEvent[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('erp_calendar_events', JSON.stringify(events))
  }
}
