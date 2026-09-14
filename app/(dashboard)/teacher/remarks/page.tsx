import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { FileSpreadsheet } from 'lucide-react'

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Remarks"
        subtitle="Add and manage student remarks and observations."
      />
      <EmptyState
        title="No data available"
        icon={FileSpreadsheet}
        message="Add and manage student remarks and observations."
      />
    </div>
  )
}
