import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { CalendarWidget } from '@/components/shared/calendar-widget'
import { DollarSign } from 'lucide-react'

export default function AccountantDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Accountant Dashboard"
        subtitle="Fee collections, invoices, and financial summaries."
      />
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <EmptyState
            title="Financial Overview"
            icon={DollarSign}
            message="Fee collection stats, pending invoices, and transaction summaries will appear here."
          />
        </div>
        <div>
          <CalendarWidget />
        </div>
      </div>
    </div>
  )
}
