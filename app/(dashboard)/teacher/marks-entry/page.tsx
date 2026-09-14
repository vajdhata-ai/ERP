import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { GraduationCap } from 'lucide-react'

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Marks Entry"
        subtitle="Enter and update student exam marks."
      />
      <EmptyState
        title="No data available"
        icon={GraduationCap}
        message="Enter and update student exam marks."
      />
    </div>
  )
}
