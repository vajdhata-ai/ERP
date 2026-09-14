'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { StudentProfileCard } from '@/components/student/student-profile-card'
import { CircularsCard } from '@/components/student/circulars-card'
import { QuickLinksGrid } from '@/components/student/quick-links-grid'
import { HomeworkCard } from '@/components/student/homework-card'
import { DashboardCalendarSection } from '@/components/student/dashboard-calendar-section'
import { AchievementsCard } from '@/components/student/achievements-card'
import { ChildSwitcher } from '@/components/student/child-switcher'
import {
  fetchStudentDashboardData,
  StudentDashboardData,
} from '@/lib/data/student-dashboard'
import { RefreshCw } from 'lucide-react'

export default function StudentDashboardPage() {
  const searchParams = useSearchParams()
  const childParam = searchParams.get('childId')

  const [data, setData] = React.useState<StudentDashboardData | null>(null)
  const [selectedChildId, setSelectedChildId] = React.useState<string | null>(
    childParam
  )
  const [isLoading, setIsLoading] = React.useState(true)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const supabase = React.useMemo(() => createClient(), [])

  // Main data fetching function
  const loadDashboardData = React.useCallback(
    async (childId?: string | null, isManualRefresh = false) => {
      if (isManualRefresh) {
        setIsRefreshing(true)
      }

      try {
        const dashboardData = await fetchStudentDashboardData(
          supabase,
          childId || selectedChildId
        )

        setData(dashboardData)

        // If parent has children and no child was explicitly selected, default to active
        if (
          dashboardData.isParent &&
          dashboardData.linkedChildren.length > 0 &&
          !childId &&
          !selectedChildId
        ) {
          setSelectedChildId(dashboardData.student.id)
        }
      } catch (err) {
        console.error('Failed to load student dashboard data:', err)
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [supabase, selectedChildId]
  )

  // Initial load and URL param change sync
  React.useEffect(() => {
    if (childParam && childParam !== selectedChildId) {
      setSelectedChildId(childParam)
      loadDashboardData(childParam)
    } else {
      loadDashboardData(selectedChildId)
    }
  }, [childParam, loadDashboardData, selectedChildId])

  // Handle Child Switcher toggle
  const handleSelectChild = (childId: string) => {
    setSelectedChildId(childId)
    loadDashboardData(childId)
    // Update URL query parameter smoothly without full reload
    const url = new URL(window.location.href)
    url.searchParams.set('childId', childId)
    window.history.pushState({}, '', url.toString())
  }

  // Window Focus Refetch:
  // Refetches live data whenever the student/parent returns to the browser tab
  React.useEffect(() => {
    const handleFocus = () => {
      loadDashboardData(selectedChildId)
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [loadDashboardData, selectedChildId])

  // Supabase Real-time Subscriptions:
  // Instantly reflect updates if a teacher posts a circular, assigns homework, or submits a remark
  React.useEffect(() => {
    const channel = supabase
      .channel('student-dashboard-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'circulars' },
        () => {
          loadDashboardData(selectedChildId)
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'homework' },
        () => {
          loadDashboardData(selectedChildId)
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'remarks' },
        () => {
          loadDashboardData(selectedChildId)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, loadDashboardData, selectedChildId])

  if (isLoading || !data) {
    return (
      <div className="space-y-6 pb-12">
        <PageHeader
          title="Student Dashboard"
          subtitle="Loading live academic updates and student profile..."
        />
        <div className="space-y-6">
          <LoadingSkeleton className="h-36 rounded-2xl" />
          <LoadingSkeleton className="h-48 rounded-2xl" />
          <LoadingSkeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    )
  }

  const showChildSwitcher =
    data.isParent && data.linkedChildren.length > 1

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Page Header with Real-Time Badge, Refresh button & Child Switcher */}
      <div className="flex flex-col gap-4">
        <PageHeader
          title={
            data.isParent
              ? `Parent Overview — ${data.student.full_name}`
              : `Student Dashboard`
          }
          subtitle={`Welcome back! Here is the latest academic overview for ${data.student.full_name} (${data.student.class_name}-${data.student.section_name}).`}
          actions={
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Real-Time Live Status Pill */}
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/80 shadow-2xs"
                title="Live Supabase Real-Time sync is active"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="hidden sm:inline">Live Supabase Sync</span>
                <span className="sm:hidden">Live</span>
              </div>

              {/* Manual Refresh Button */}
              <button
                type="button"
                onClick={() => loadDashboardData(selectedChildId, true)}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-accent text-xs font-semibold text-foreground shadow-2xs transition-all disabled:opacity-50"
                aria-label="Refresh Dashboard Data"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 text-muted-foreground ${
                    isRefreshing ? 'animate-spin' : ''
                  }`}
                />
                <span className="hidden sm:inline">Refetch</span>
              </button>
            </div>
          }
        />

        {/* Parent Child-Switcher Control (if PARENT with >1 linked children) */}
        {showChildSwitcher && (
          <div className="p-3 sm:p-4 rounded-2xl border border-primary/20 bg-primary/5 dark:bg-primary/10 shadow-2xs">
            <ChildSwitcher
              childrenList={data.linkedChildren}
              activeChildId={data.student.id}
              onSelectChild={handleSelectChild}
            />
          </div>
        )}
      </div>

      {/* 
        =======================================================================
        SECTIONS IN REQUIRED ORDER:
        1. Student Profile card
        2. Circular/News card
        3. Quick Links
        4. Homework/Assignments card
        5. Calendar widget & next 30 days events list
        6. Achievement section
        =======================================================================
      */}

      {/* SECTION 1: Student Profile Card */}
      <section aria-label="Student Profile">
        <StudentProfileCard student={data.student} />
      </section>

      {/* SECTION 2: Circular/News Card */}
      <section aria-label="Circulars and Notices">
        <CircularsCard
          circulars={data.circulars}
          studentClassName={data.student.class_name}
        />
      </section>

      {/* SECTION 3: Quick Links Grid (2x2 or 2x3 tappable tiles) */}
      <section aria-label="Quick Access Services">
        <QuickLinksGrid />
      </section>

      {/* SECTION 4: Homework/Assignments Card */}
      <section aria-label="Homework and Assignments">
        <HomeworkCard homework={data.homework} />
      </section>

      {/* SECTION 5: Calendar Widget & Next 30 Days Events */}
      <section aria-label="School Calendar and Schedule">
        <DashboardCalendarSection events={data.calendarEvents} />
      </section>

      {/* SECTION 6: Achievement & Remarks Section (or shared EmptyState) */}
      <section aria-label="Achievements and Remarks">
        <AchievementsCard
          achievements={data.achievements}
          studentName={data.student.full_name}
        />
      </section>
    </div>
  )
}
