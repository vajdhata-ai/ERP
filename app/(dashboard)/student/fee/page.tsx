import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { CreditCard } from 'lucide-react'

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee"
        subtitle="View your fee invoices and payment history."
      />
      <EmptyState
        title="No data available"
        icon={CreditCard}
        message="View your fee invoices and payment history."
      />
    </div>
  )
}
