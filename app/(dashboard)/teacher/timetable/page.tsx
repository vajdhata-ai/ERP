import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Clock } from 'lucide-react'

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Time Table"
        subtitle="View your class teaching schedule."
      />
      <EmptyState
        title="No data available"
        icon={Clock}
        message="View your class teaching schedule."
      />
    </div>
  )
}
