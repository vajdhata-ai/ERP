import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Library } from 'lucide-react'

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Library"
        subtitle="Manage book inventory and library transactions."
      />
      <EmptyState
        title="No data available"
        icon={Library}
        message="Manage book inventory and library transactions."
      />
    </div>
  )
}
