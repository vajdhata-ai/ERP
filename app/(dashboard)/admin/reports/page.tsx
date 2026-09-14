import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { FileText } from 'lucide-react'

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Generate and export school performance reports."
      />
      <EmptyState
        title="No data available"
        icon={FileText}
        message="Generate and export school performance reports."
      />
    </div>
  )
}
