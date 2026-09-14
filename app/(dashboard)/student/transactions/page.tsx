import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Library } from 'lucide-react'

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions (Library)"
        subtitle="Your library book issues and returns."
      />
      <EmptyState
        title="No data available"
        icon={Library}
        message="Your library book issues and returns."
      />
    </div>
  )
}
