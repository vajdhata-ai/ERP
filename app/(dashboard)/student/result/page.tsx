import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { GraduationCap } from 'lucide-react'

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Result"
        subtitle="Your exam results and academic performance."
      />
      <EmptyState
        title="No data available"
        icon={GraduationCap}
        message="Your exam results and academic performance."
      />
    </div>
  )
}
