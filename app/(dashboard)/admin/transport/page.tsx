import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Bus } from 'lucide-react'

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Transport"
        subtitle="Manage bus routes, vehicles, and student assignments."
      />
      <EmptyState
        title="No data available"
        icon={Bus}
        message="Manage bus routes, vehicles, and student assignments."
      />
    </div>
  )
}
