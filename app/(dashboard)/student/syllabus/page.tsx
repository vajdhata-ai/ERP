import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { BookOpen } from 'lucide-react'

export default function StudentSyllabusPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Curriculum & Syllabus"
        subtitle="Detailed term-wise syllabus breakdown and learning milestones."
      />
      <EmptyState
        title="Syllabus Modules"
        icon={BookOpen}
        message="Your class academic syllabus, chapter blueprints, and unit weightages will appear here once published by department coordinators."
      />
    </div>
  )
}
