import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { DollarSign } from 'lucide-react'

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Management"
        subtitle="Configure fee structures, invoices, and collections."
      />
      <EmptyState
        title="No data available"
        icon={DollarSign}
        message="Configure fee structures, invoices, and collections."
      />
    </div>
  )
}
