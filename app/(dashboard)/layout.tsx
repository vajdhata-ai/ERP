import { cookies } from 'next/headers'
import React, { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { DashboardAlertListener } from '@/components/shared/dashboard-alert-listener'
import { DashboardShell } from '@/components/shared/dashboard-shell'
import { UserProfile, UserRole } from '@/lib/types'
import { getNavigationForRole } from '@/lib/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile: UserProfile | null = null
  let schoolName = 'VAJDHATA ERP'

  if (user) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select(
        'id, school_id, full_name, role, phone, avatar_url, is_active, created_at, updated_at, schools(id, name, school_code, logo_url)'
      )
      .eq('id', user.id)
      .single()

    if (profileData) {
      profile = profileData as unknown as UserProfile

      if (profileData.schools && !Array.isArray(profileData.schools)) {
        schoolName = (profileData.schools as { name: string }).name || schoolName
      }

      // For student role, also fetch class/section info
      if (profileData.role === 'student') {
        const { data: studentData } = await supabase
          .from('students')
          .select('class_id, section_id, classes(name), sections(name)')
          .eq('profile_id', user.id)
          .single()

        if (studentData && profile) {
          // Supabase join returns array or object depending on relation — cast safely
          const classRaw = studentData.classes
          const sectionRaw = studentData.sections
          const classInfo = (Array.isArray(classRaw) ? classRaw[0] : classRaw) as { name: string } | null
          const sectionInfo = (Array.isArray(sectionRaw) ? sectionRaw[0] : sectionRaw) as { name: string } | null
          profile = {
            ...profile,
            class_name: classInfo?.name ?? null,
            section_name: sectionInfo?.name ?? null,
          }
        }
      }
    }
  }

  const cookieStore = cookies()
  const demoRole = cookieStore.get('vajdhata_demo_role')?.value as UserRole | undefined
  if (!profile && demoRole) {
    profile = {
      id: 'd1111111-dddd-dddd-dddd-dddddddddddd',
      school_id: '11111111-1111-1111-1111-111111111111',
      full_name: demoRole === 'teacher' ? 'Rajesh Verma (Senior PGT Physics)' : demoRole === 'school_admin' ? 'Dr. Vinod Sharma' : 'Aarav Patel',
      role: demoRole,
      phone: '+919876543210',
      avatar_url: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }
  const role = profile?.role ?? 'student'
  const navItems = getNavigationForRole(role)

  return (
    <>
      <Suspense fallback={null}>
        <DashboardAlertListener />
      </Suspense>
      <DashboardShell
        navItems={navItems}
        profile={profile}
        schoolName={schoolName}
      >
        {children}
      </DashboardShell>
    </>
  )
}
