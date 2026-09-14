import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Clock } from 'lucide-react'

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Time Table"
        subtitle="Your weekly class schedule."
      />
      <EmptyState
        title="No data available"
        icon={Clock}
        message="Your weekly class schedule."
      />
    </div>
  )
}
