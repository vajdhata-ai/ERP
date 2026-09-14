import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { CalendarWidget } from '@/components/shared/calendar-widget'
import { BookOpen } from 'lucide-react'

export default function TeacherDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Teacher Dashboard"
        subtitle="Good day! Here is your teaching overview."
      />
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <EmptyState
            title="Your Teaching Summary"
            icon={BookOpen}
            message="Attendance stats, pending homework, and class performance will appear here."
          />
        </div>
        <div>
          <CalendarWidget />
        </div>
      </div>
    </div>
  )
}
