import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Calendar } from 'lucide-react'

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="School Calendar"
        subtitle="Upcoming holidays, exams, and school events."
      />
      <EmptyState
        title="No data available"
        icon={Calendar}
        message="Upcoming holidays, exams, and school events."
      />
    </div>
  )
}
