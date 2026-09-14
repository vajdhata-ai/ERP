import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { CalendarWidget } from '@/components/shared/calendar-widget'
import { Library } from 'lucide-react'

export default function LibrarianDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Librarian Dashboard"
        subtitle="Book catalog, issue/return status, and overdue reports."
      />
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <EmptyState
            title="Library Overview"
            icon={Library}
            message="Active borrows, overdue books, and catalog statistics will appear here."
          />
        </div>
        <div>
          <CalendarWidget />
        </div>
      </div>
    </div>
  )
}
