import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { CalendarWidget } from '@/components/shared/calendar-widget'
import { ShieldCheck } from 'lucide-react'

export default function SuperAdminDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Super Admin Dashboard"
        subtitle="Global platform overview — all schools, subscriptions, and system health."
      />
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <EmptyState
            title="Global Overview"
            icon={ShieldCheck}
            message="School count, active subscriptions, platform usage, and system health metrics will appear here."
          />
        </div>
        <div>
          <CalendarWidget />
        </div>
      </div>
    </div>
  )
}
