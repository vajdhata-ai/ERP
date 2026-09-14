import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { BookOpen } from 'lucide-react'

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Homework"
        subtitle="Assign and review homework submissions."
      />
      <EmptyState
        title="No data available"
        icon={BookOpen}
        message="Assign and review homework submissions."
      />
    </div>
  )
}
