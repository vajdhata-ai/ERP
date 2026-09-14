import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Users } from 'lucide-react'

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        subtitle="Manage student enrollments and profiles."
      />
      <EmptyState
        title="No data available"
        icon={Users}
        message="Manage student enrollments and profiles."
      />
    </div>
  )
}
