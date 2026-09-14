import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { AlertTriangle } from 'lucide-react'

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Risk Dashboard"
        subtitle="Monitor attendance alerts, fee defaults, and risk metrics."
      />
      <EmptyState
        title="No data available"
        icon={AlertTriangle}
        message="Monitor attendance alerts, fee defaults, and risk metrics."
      />
    </div>
  )
}
