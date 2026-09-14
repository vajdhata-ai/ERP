import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Bus } from 'lucide-react'

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Transport"
        subtitle="Bus routes, stop locations, and live tracking."
      />
      <EmptyState
        title="No data available"
        icon={Bus}
        message="Bus routes, stop locations, and live tracking."
      />
    </div>
  )
}
