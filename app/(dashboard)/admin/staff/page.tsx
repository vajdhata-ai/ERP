import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { UserCheck } from 'lucide-react'

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff"
        subtitle="Manage teacher and staff records."
      />
      <EmptyState
        title="No data available"
        icon={UserCheck}
        message="Manage teacher and staff records."
      />
    </div>
  )
}
