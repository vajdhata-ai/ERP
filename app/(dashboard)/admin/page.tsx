import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { CalendarWidget } from '@/components/shared/calendar-widget'
import { ShieldCheck } from 'lucide-react'

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        subtitle="School administration overview and quick actions."
      />
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <EmptyState
            title="School Overview"
            icon={ShieldCheck}
            message="Student count, fee collection stats, staff attendance, and key metrics will appear here."
          />
        </div>
        <div>
          <CalendarWidget />
        </div>
      </div>
    </div>
  )
}
