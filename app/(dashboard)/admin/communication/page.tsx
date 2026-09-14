import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { MessageSquare } from 'lucide-react'

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Communication"
        subtitle="Send circulars, messages, and announcements."
      />
      <EmptyState
        title="No data available"
        icon={MessageSquare}
        message="Send circulars, messages, and announcements."
      />
    </div>
  )
}
