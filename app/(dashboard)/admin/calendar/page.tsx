import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Calendar } from 'lucide-react'

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        subtitle="Manage school events, holidays, and exam schedules."
      />
      <EmptyState
        title="No data available"
        icon={Calendar}
        message="Manage school events, holidays, and exam schedules."
      />
    </div>
  )
}
