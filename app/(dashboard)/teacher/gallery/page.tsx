import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Image } from 'lucide-react'

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Gallery"
        subtitle="Upload and view class photo galleries."
      />
      <EmptyState
        title="No data available"
        icon={Image}
        message="Upload and view class photo galleries."
      />
    </div>
  )
}
