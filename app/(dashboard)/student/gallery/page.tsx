import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Image } from 'lucide-react'

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Image Gallery"
        subtitle="Photos from school events and activities."
      />
      <EmptyState
        title="No data available"
        icon={Image}
        message="Photos from school events and activities."
      />
    </div>
  )
}
