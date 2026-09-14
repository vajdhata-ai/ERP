import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Laptop } from 'lucide-react'

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Digital Learning"
        subtitle="Access e-books, videos, and learning resources."
      />
      <EmptyState
        title="No data available"
        icon={Laptop}
        message="Access e-books, videos, and learning resources."
      />
    </div>
  )
}
