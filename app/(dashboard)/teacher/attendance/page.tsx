'use client'

/**
 * app/(dashboard)/teacher/attendance/page.tsx
 * ============================================================================
 * Teacher attendance marking page.
 *
 * Flow:
 *  1. Teacher picks Class → Section → Date (defaults to today).
 *  2. Roster loads — if attendance already exists for that section+date,
 *     existing statuses are pre-loaded; otherwise everyone defaults to Present.
 *  3. Teacher taps status buttons (Present / Absent / Leave) per student.
 *  4. "Mark All Present" shortcut resets all to Present.
 *  5. Save upserts via POST /api/attendance/save.
 *  6. Absent students automatically trigger parent notifications (in API).
 * ============================================================================
 */

import * as React from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import {
  getClassesAndSections,
  getRosterForSection,
  AttendanceStatus,
  ClassOption,
  RosterStudent,
} from '@/lib/data/attendance'
import {
  CheckCircle2,
  XCircle,
  Clock3,
  Users,
  CalendarDays,
  Save,
  ChevronDown,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------
const STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; short: string; color: string; activeColor: string; icon: React.ReactNode }
> = {
  present: {
    label: 'Present',
    short: 'P',
    color:
      'border-border bg-card text-muted-foreground hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300',
    activeColor:
      'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300 shadow-sm',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  absent: {
    label: 'Absent',
    short: 'A',
    color:
      'border-border bg-card text-muted-foreground hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:hover:border-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-300',
    activeColor:
      'border-red-500 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-950/50 dark:text-red-300 shadow-sm',
    icon: <XCircle className="h-4 w-4" />,
  },
  leave: {
    label: 'Leave',
    short: 'L',
    color:
      'border-border bg-card text-muted-foreground hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 dark:hover:border-amber-700 dark:hover:bg-amber-950/40 dark:hover:text-amber-300',
    activeColor:
      'border-amber-500 bg-amber-50 text-amber-700 dark:border-amber-600 dark:bg-amber-950/50 dark:text-amber-300 shadow-sm',
    icon: <Clock3 className="h-4 w-4" />,
  },
  on_duty: {
    label: 'On Duty',
    short: 'OD',
    color:
      'border-border bg-card text-muted-foreground hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:border-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-300',
    activeColor:
      'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-600 dark:bg-blue-950/50 dark:text-blue-300 shadow-sm',
    icon: <CalendarDays className="h-4 w-4" />,
  },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function initStatusMap(
  roster: RosterStudent[]
): Record<string, AttendanceStatus> {
  const map: Record<string, AttendanceStatus> = {}
  for (const s of roster) {
    map[s.student_record_id] = s.status ?? 'present'
  }
  return map
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function TeacherAttendancePage() {
  const supabase = React.useMemo(() => createClient(), [])

  const [schoolId, setSchoolId] = React.useState<string | null>(null)
  const [teacherProfileId, setTeacherProfileId] = React.useState<string | null>(null)

  const [classes, setClasses] = React.useState<ClassOption[]>([])
  const [selectedClassId, setSelectedClassId] = React.useState<string>('')
  const [selectedSectionId, setSelectedSectionId] = React.useState<string>('')
  const [selectedDate, setSelectedDate] = React.useState<string>(todayStr())

  const [roster, setRoster] = React.useState<RosterStudent[]>([])
  const [statusMap, setStatusMap] = React.useState<Record<string, AttendanceStatus>>({})
  const [alreadySaved, setAlreadySaved] = React.useState(false)

  const [loadingProfile, setLoadingProfile] = React.useState(true)
  const [loadingClasses, setLoadingClasses] = React.useState(false)
  const [loadingRoster, setLoadingRoster] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  // ---- 1. Load teacher profile + school ----
  React.useEffect(() => {
    ;(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setLoadingProfile(false)
        return
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, school_id')
        .eq('id', user.id)
        .single()
      if (profile) {
        setSchoolId(profile.school_id)
        setTeacherProfileId(profile.id)
      }
      setLoadingProfile(false)
    })()
  }, [supabase])

  // ---- 2. Load classes once school is known ----
  React.useEffect(() => {
    if (!schoolId) return
    setLoadingClasses(true)
    getClassesAndSections(supabase, schoolId).then((cls) => {
      setClasses(cls)
      // Auto-select first class + first section
      if (cls.length > 0) {
        setSelectedClassId(cls[0].id)
        if (cls[0].sections.length > 0) {
          setSelectedSectionId(cls[0].sections[0].id)
        }
      }
      setLoadingClasses(false)
    })
  }, [supabase, schoolId])

  // ---- 3. Load roster when section/date changes ----
  React.useEffect(() => {
    if (!schoolId || !selectedSectionId || !selectedDate) return
    setLoadingRoster(true)
    getRosterForSection(supabase, schoolId, selectedSectionId, selectedDate).then(
      (students) => {
        setRoster(students)
        const hadExisting = students.some((s) => s.status !== null)
        setAlreadySaved(hadExisting)
        setStatusMap(initStatusMap(students))
        setLoadingRoster(false)
      }
    )
  }, [supabase, schoolId, selectedSectionId, selectedDate])

  // ---- Derived ----
  const selectedClass = classes.find((c) => c.id === selectedClassId)
  const availableSections = selectedClass?.sections ?? []

  function handleClassChange(classId: string) {
    setSelectedClassId(classId)
    const cls = classes.find((c) => c.id === classId)
    const firstSection = cls?.sections?.[0]?.id ?? ''
    setSelectedSectionId(firstSection)
  }

  function handleStatusChange(studentRecordId: string, status: AttendanceStatus) {
    setStatusMap((prev) => ({ ...prev, [studentRecordId]: status }))
  }

  function handleMarkAllPresent() {
    const allPresent: Record<string, AttendanceStatus> = {}
    for (const s of roster) {
      allPresent[s.student_record_id] = 'present'
    }
    setStatusMap(allPresent)
  }

  async function handleSave() {
    if (!schoolId || !selectedSectionId || !teacherProfileId || roster.length === 0) return
    setSaving(true)

    const records = roster.map((s) => ({
      student_record_id: s.student_record_id,
      status: statusMap[s.student_record_id] ?? 'present',
    }))

    try {
      const res = await fetch('/api/attendance/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          school_id: schoolId,
          section_id: selectedSectionId,
          date: selectedDate,
          records,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Save failed')
      setAlreadySaved(true)
      const absentCount = records.filter((r) => r.status === 'absent').length
      toast.success(
        `Attendance saved for ${records.length} student${records.length !== 1 ? 's' : ''}` +
          (absentCount > 0 ? ` · ${absentCount} parent${absentCount !== 1 ? 's' : ''} notified` : '')
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      toast.error(`Failed to save: ${msg}`)
    } finally {
      setSaving(false)
    }
  }

  // ---- Summary counts ----
  const counts = React.useMemo(() => {
    let present = 0, absent = 0, leave = 0
    for (const id of Object.keys(statusMap)) {
      const s = statusMap[id]
      if (s === 'present') present++
      else if (s === 'absent') absent++
      else if (s === 'leave') leave++
    }
    return { present, absent, leave }
  }, [statusMap])

  // ---- Render ----
  if (loadingProfile) {
    return (
      <div className="space-y-6">
        <PageHeader title="Attendance" subtitle="Mark daily class attendance." />
        <LoadingSkeleton className="h-20 rounded-2xl" />
        <LoadingSkeleton className="h-96 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <PageHeader
        title="Attendance"
        subtitle="Mark daily attendance for your class. Existing records are pre-loaded."
        actions={
          alreadySaved && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Already saved — editing
            </span>
          )
        }
      />

      {/* ---- Filter Bar ---- */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Class */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Class
            </label>
            <div className="relative">
              <select
                value={selectedClassId}
                onChange={(e) => handleClassChange(e.target.value)}
                disabled={loadingClasses}
                className="w-full appearance-none rounded-xl border border-border bg-background px-3 py-2.5 pr-9 text-sm font-medium text-foreground shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
              >
                {loadingClasses && <option value="">Loading…</option>}
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    Class {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          {/* Section */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Section
            </label>
            <div className="relative">
              <select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                disabled={availableSections.length === 0}
                className="w-full appearance-none rounded-xl border border-border bg-background px-3 py-2.5 pr-9 text-sm font-medium text-foreground shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
              >
                {availableSections.map((s) => (
                  <option key={s.id} value={s.id}>
                    Section {s.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              max={todayStr()}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-medium text-foreground shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>
      </div>

      {/* ---- Roster Area ---- */}
      {loadingRoster ? (
        <LoadingSkeleton className="h-96 rounded-2xl" />
      ) : roster.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center">
          <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-semibold text-foreground">No students found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Select a class and section to load the roster.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Top action bar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Summary pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {counts.present} Present
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800">
                <XCircle className="h-3.5 w-3.5" />
                {counts.absent} Absent
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800">
                <Clock3 className="h-3.5 w-3.5" />
                {counts.leave} Leave
              </span>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/60"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Mark All Present
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 shadow-sm"
              >
                <Save className="h-3.5 w-3.5" />
                {saving ? 'Saving…' : 'Save Attendance'}
              </button>
            </div>
          </div>

          {/* Student rows */}
          <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
            <div className="divide-y divide-border">
              {roster.map((student, idx) => {
                const currentStatus = statusMap[student.student_record_id] ?? 'present'
                return (
                  <div
                    key={student.student_record_id}
                    className="flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-3.5 hover:bg-accent/30 transition-colors"
                  >
                    {/* Rank */}
                    <span className="hidden sm:flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                      {idx + 1}
                    </span>

                    {/* Avatar */}
                    <div className="h-9 w-9 shrink-0 rounded-full bg-muted overflow-hidden border border-border">
                      {student.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={student.avatar_url}
                          alt={student.full_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-muted-foreground">
                          {student.full_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Name + admission no */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {student.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">{student.admission_no}</p>
                    </div>

                    {/* Status buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {(['present', 'absent', 'leave'] as AttendanceStatus[]).map(
                        (status) => {
                          const cfg = STATUS_CONFIG[status]
                          const isActive = currentStatus === status
                          return (
                            <button
                              key={status}
                              type="button"
                              onClick={() =>
                                handleStatusChange(student.student_record_id, status)
                              }
                              title={cfg.label}
                              className={[
                                'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all',
                                isActive ? cfg.activeColor : cfg.color,
                              ].join(' ')}
                            >
                              {cfg.icon}
                              <span className="hidden sm:inline">{cfg.label}</span>
                              <span className="sm:hidden">{cfg.short}</span>
                            </button>
                          )
                        }
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bottom save button (convenience — same as top) */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 shadow-sm"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving…' : 'Save Attendance'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
