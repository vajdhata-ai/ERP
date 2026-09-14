import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { HeartPulse } from 'lucide-react'

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Infirmary"
        subtitle="Health records and medical visit history."
      />
      <EmptyState
        title="No data available"
        icon={HeartPulse}
        message="Health records and medical visit history."
      />
    </div>
  )
}
