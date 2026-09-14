import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { User } from 'lucide-react'

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let fullName = 'Your Profile'
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()
    if (profile?.full_name) fullName = profile.full_name
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        subtitle={`Viewing profile for ${fullName}`}
      />
      <EmptyState
        title="Profile details coming soon"
        icon={User}
        message="Your personal details, contact information, and account settings will be manageable here in a future stage."
      />
    </div>
  )
}
