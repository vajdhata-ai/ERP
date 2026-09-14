'use client'

/**
 * app/(dashboard)/student/attendance/page.tsx
 * ============================================================================
 * Student / Parent attendance analytics page.
 *
 * Sections:
 *  1. Overall attendance percentage pill for the selected academic year.
 *  2. Bar chart (Recharts) — Present vs Absent per month (Apr–Mar).
 *  3. Donut/Pie chart — annual Present % / Absent % / Leave %.
 *  4. Month-by-month calendar grid (Mon–Sun columns) with coloured dots.
 *     Past dates show: green=present, red=absent, amber=leave, grey=on_duty.
 *     Previous/Next arrows + academic year selector.
 *  5. TODO: holiday/on-duty exclusion hook (Stage 12).
 *
 * Edge cases:
 *  - Students added mid-year: months before admission_date are dimmed.
 *  - Parents with multiple children: ?childId= param selects the child.
 * ============================================================================
 */

import * as React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import {
  getStudentAttendanceStats,
  getAcademicYear,
  getAcademicYearBounds,
  resolveStudentRecord,
  getLinkedChildren,
  StudentAttendanceStats,
  AttendanceStatus,
} from '@/lib/data/attendance'
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  TrendingUp,
  UserCheck,
  UserX,
  Clock3,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const DOT_COLORS: Record<AttendanceStatus, string> = {
  present: 'bg-emerald-500',
  absent: 'bg-red-500',
  leave: 'bg-amber-400',
  on_duty: 'bg-blue-400',
}

const CHART_COLORS = {
  present: '#10b981',
  absent: '#ef4444',
  leave: '#f59e0b',
  on_duty: '#3b82f6',
  neutral: '#94a3b8',
}

const ACADEMIC_YEARS: string[] = (() => {
  const current = getAcademicYear()
  const [startYearStr] = current.split('-')
  const startYear = parseInt(startYearStr, 10)
  const years: string[] = []
  for (let y = startYear - 2; y <= startYear + 1; y++) {
    years.push(`${y}-${String(y + 1).slice(-2)}`)
  }
  return years
})()

const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface LinkedChild {
  student_record_id: string
  full_name: string
  admission_no: string
  class_name: string
  section_name: string
  avatar_url: string | null
}

// ---------------------------------------------------------------------------
// Calendar grid helpers
// ---------------------------------------------------------------------------
/**
 * Build a 6-row × 7-column (Mon-Sun) grid for a given month.
 * Returns array of 42 items (some null = padding days from adjacent months).
 */
function buildCalendarGrid(year: number, monthIndex: number): (Date | null)[] {
  const firstDay = new Date(year, monthIndex, 1)
  const lastDay = new Date(year, monthIndex + 1, 0)

  // JS getDay(): 0=Sun,1=Mon,…,6=Sat. We want Mon=0.
  const startOffset = (firstDay.getDay() + 6) % 7
  const totalDays = lastDay.getDate()

  const grid: (Date | null)[] = []
  for (let i = 0; i < startOffset; i++) grid.push(null)
  for (let d = 1; d <= totalDays; d++) grid.push(new Date(year, monthIndex, d))
  while (grid.length % 7 !== 0) grid.push(null)

  return grid
}

function formatDateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatPill({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  color: string
}) {
  return (
    <div className={`flex flex-col items-center gap-1 rounded-2xl border px-4 py-3 ${color}`}>
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide opacity-70">
        {icon}
        {label}
      </div>
      <span className="text-2xl font-bold tabular-nums">{value}</span>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomBarTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((entry: { name: string; value: number; color: string }) => (
        <p key={entry.name} style={{ color: entry.color }} className="font-medium">
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function StudentAttendancePage() {
  const supabase = React.useMemo(() => createClient(), [])

  // -- Auth state
  const [profileId, setProfileId] = React.useState<string | null>(null)
  const [isParent, setIsParent] = React.useState(false)
  const [linkedChildren, setLinkedChildren] = React.useState<LinkedChild[]>([])
  const [selectedChildRecordId, setSelectedChildRecordId] =
    React.useState<string | null>(null)

  // -- Stats
  const [studentName, setStudentName] = React.useState('')
  const [admissionDate, setAdmissionDate] = React.useState<string | null>(null)
  const [academicYear, setAcademicYear] = React.useState(getAcademicYear())
  const [stats, setStats] = React.useState<StudentAttendanceStats | null>(null)
  const [loading, setLoading] = React.useState(true)

  // -- Calendar navigation
  const today = new Date()
  const [calMonth, setCalMonth] = React.useState(today.getMonth())
  const [calYear, setCalYear] = React.useState(today.getFullYear())

  // ---- 1. Load profile & children ----
  React.useEffect(() => {
    ;(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role, full_name')
        .eq('id', user.id)
        .single()

      if (!profile) return
      setProfileId(profile.id)

      if (profile.role === 'parent') {
        setIsParent(true)
        const children = await getLinkedChildren(supabase, profile.id)
        setLinkedChildren(children)
        if (children.length > 0) {
          setSelectedChildRecordId(children[0].student_record_id)
        }
      } else {
        setStudentName(profile.full_name ?? '')
      }
    })()
  }, [supabase])

  // ---- 2. Load stats when child or year changes ----
  React.useEffect(() => {
    if (!profileId) return

    ;(async () => {
      setLoading(true)
      try {
        const resolved = await resolveStudentRecord(
          supabase,
          profileId,
          selectedChildRecordId
        )
        if (!resolved) return

        setAdmissionDate(resolved.admissionDate)

        // Fetch student name if needed
        if (isParent && selectedChildRecordId) {
          const child = linkedChildren.find(
            (c) => c.student_record_id === selectedChildRecordId
          )
          if (child) setStudentName(child.full_name)
        } else if (!isParent) {
          // Already set from profile
        }

        const s = await getStudentAttendanceStats(
          supabase,
          resolved.studentRecordId,
          academicYear,
          resolved.admissionDate
        )
        setStats(s)
      } finally {
        setLoading(false)
      }
    })()
  }, [supabase, profileId, selectedChildRecordId, academicYear, isParent, linkedChildren])

  // ---- Derived chart data ----
  const barData = React.useMemo(() => {
    if (!stats) return []
    return stats.monthly.map((m) => ({
      month: m.month,
      Present: m.present,
      Absent: m.absent,
      Leave: m.leave,
    }))
  }, [stats])

  const donutData = React.useMemo(() => {
    if (!stats || stats.totalSchoolDays === 0) return []
    const total = stats.totalSchoolDays
    return [
      { name: 'Present', value: stats.totalPresent, color: CHART_COLORS.present },
      { name: 'Absent', value: stats.totalAbsent, color: CHART_COLORS.absent },
      { name: 'Leave', value: stats.totalLeave, color: CHART_COLORS.leave },
      {
        name: 'Unmarked',
        value: Math.max(0, total - stats.totalPresent - stats.totalAbsent - stats.totalLeave - stats.totalOnDuty),
        color: CHART_COLORS.neutral,
      },
    ].filter((d) => d.value > 0)
  }, [stats])

  // ---- Calendar: build record lookup ----
  const recordsByDate = React.useMemo(() => {
    if (!stats) return {}
    const map: Record<string, AttendanceStatus> = {}
    for (const r of stats.records) {
      map[r.date] = r.status
    }
    return map
  }, [stats])

  // ---- Calendar grid ----
  const calGrid = React.useMemo(
    () => buildCalendarGrid(calYear, calMonth),
    [calYear, calMonth]
  )

  function prevMonth() {
    if (calMonth === 0) {
      setCalMonth(11)
      setCalYear((y) => y - 1)
    } else {
      setCalMonth((m) => m - 1)
    }
  }

  function nextMonth() {
    const now = new Date()
    if (calYear > now.getFullYear() || (calYear === now.getFullYear() && calMonth >= now.getMonth())) return
    if (calMonth === 11) {
      setCalMonth(0)
      setCalYear((y) => y + 1)
    } else {
      setCalMonth((m) => m + 1)
    }
  }

  const calMonthLabel = new Date(calYear, calMonth, 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })

  const isNextDisabled = (() => {
    const now = new Date()
    return calYear > now.getFullYear() || (calYear === now.getFullYear() && calMonth >= now.getMonth())
  })()

  // ---- Admission date clamping for calendar ----
  const admissionDateObj = admissionDate ? new Date(admissionDate) : null

  function isBeforeAdmission(date: Date): boolean {
    if (!admissionDateObj) return false
    return date < admissionDateObj
  }

  // ---- Academic year bounds for calendar dimming ----
  const { start: ayStart, end: ayEnd } = getAcademicYearBounds(academicYear)

  function isOutsideAcademicYear(date: Date): boolean {
    return date < ayStart || date > ayEnd
  }

  // ---- Overall % colour ----
  const pctColor =
    !stats
      ? 'text-foreground'
      : stats.overallPercent >= 85
      ? 'text-emerald-600 dark:text-emerald-400'
      : stats.overallPercent >= 70
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-red-600 dark:text-red-400'

  // ---- Render ----
  if (!profileId || loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Attendance" subtitle="Loading attendance records…" />
        <LoadingSkeleton className="h-24 rounded-2xl" />
        <LoadingSkeleton className="h-64 rounded-2xl" />
        <LoadingSkeleton className="h-64 rounded-2xl" />
        <LoadingSkeleton className="h-72 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* ================================================================ */}
      {/* PAGE HEADER */}
      {/* ================================================================ */}
      <PageHeader
        title={isParent ? `Attendance — ${studentName}` : 'My Attendance'}
        subtitle={`Academic year ${academicYear}. ${admissionDate ? `Student enrolled from ${new Date(admissionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}.` : ''}`}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {/* Child switcher for parents */}
            {isParent && linkedChildren.length > 1 && (
              <select
                value={selectedChildRecordId ?? ''}
                onChange={(e) => setSelectedChildRecordId(e.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {linkedChildren.map((c) => (
                  <option key={c.student_record_id} value={c.student_record_id}>
                    {c.full_name} ({c.class_name}-{c.section_name})
                  </option>
                ))}
              </select>
            )}
            {/* Year selector */}
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {ACADEMIC_YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* ================================================================ */}
      {/* 1. OVERALL PERCENTAGE + STAT PILLS */}
      {/* ================================================================ */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
        {/* Big percentage */}
        <div className="text-center mb-5 pb-5 border-b border-border">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Overall Attendance — {academicYear}
          </p>
          <div className="flex items-baseline justify-center gap-2">
            <span className={`text-6xl font-extrabold tabular-nums ${pctColor}`}>
              {stats ? stats.overallPercent : '—'}
            </span>
            <span className={`text-2xl font-bold ${pctColor}`}>%</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {stats
              ? `${stats.totalPresent} present out of ${stats.totalSchoolDays} school days`
              : 'No records yet'}
          </p>
          {/* TODO (Stage 12): When calendar_events (holiday) data is available,
              subtract holidays from totalSchoolDays for more accurate percentage */}
        </div>

        {/* Stat pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatPill
            icon={<UserCheck className="h-3.5 w-3.5" />}
            label="Present"
            value={stats?.totalPresent ?? 0}
            color="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
          />
          <StatPill
            icon={<UserX className="h-3.5 w-3.5" />}
            label="Absent"
            value={stats?.totalAbsent ?? 0}
            color="border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"
          />
          <StatPill
            icon={<Clock3 className="h-3.5 w-3.5" />}
            label="Leave"
            value={stats?.totalLeave ?? 0}
            color="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300"
          />
          <StatPill
            icon={<CalendarDays className="h-3.5 w-3.5" />}
            label="School Days"
            value={stats?.totalSchoolDays ?? 0}
            color="border-border bg-muted/50 text-muted-foreground"
          />
        </div>
      </div>

      {/* ================================================================ */}
      {/* 2. BAR CHART — Monthly Present vs Absent */}
      {/* ================================================================ */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">
            Monthly Attendance — {academicYear}
          </h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4 -mt-2">
          Monthly breakdown of present and absent days across the academic year.
          {admissionDate && (
            <span className="ml-1 text-primary/70">
              Months before your enrolment date are not shown.
            </span>
          )}
        </p>

        {barData.every((d) => d.Present === 0 && d.Absent === 0 && d.Leave === 0) ? (
          <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border">
            <p className="text-sm text-muted-foreground">No attendance records for this year.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={barData}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              barSize={16}
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'hsl(var(--accent))' }} />
              <Bar dataKey="Present" fill={CHART_COLORS.present} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Absent" fill={CHART_COLORS.absent} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Leave" fill={CHART_COLORS.leave} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ================================================================ */}
      {/* 3. DONUT CHART — Annual breakdown */}
      {/* ================================================================ */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Annual Breakdown</h2>
        </div>

        {donutData.length === 0 ? (
          <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border">
            <p className="text-sm text-muted-foreground">No records to display.</p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <ResponsiveContainer width={220} height={220}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any, name: any) => [
                    `${value} days (${stats ? Math.round((Number(value) / stats.totalSchoolDays) * 100) : 0}%)`,
                    name,
                  ]}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid hsl(var(--border))',
                    backgroundColor: 'hsl(var(--popover))',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex flex-col gap-3 flex-1">
              {donutData.map((entry) => {
                const pct = stats
                  ? Math.round((entry.value / stats.totalSchoolDays) * 100 * 10) / 10
                  : 0
                return (
                  <div key={entry.name} className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="flex-1 text-sm font-medium text-foreground">
                      {entry.name}
                    </span>
                    <span className="text-sm font-bold tabular-nums text-foreground">
                      {pct}%
                    </span>
                    <span className="text-xs text-muted-foreground">({entry.value}d)</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/* 4. CALENDAR GRID */}
      {/* ================================================================ */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
        {/* Calendar header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Attendance Calendar</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prevMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[140px] text-center text-sm font-semibold text-foreground">
              {calMonthLabel}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              disabled={isNextDisabled}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Day-of-week headers (Mon–Sun) */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS_SHORT.map((d) => (
            <div
              key={d}
              className="py-1.5 text-center text-[10px] font-bold uppercase tracking-wide text-muted-foreground"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar cells */}
        <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden border border-border">
          {calGrid.map((date, i) => {
            if (!date) {
              return <div key={`empty-${i}`} className="bg-muted/30 aspect-square" />
            }

            const dateStr = formatDateStr(date)
            const isSunday = date.getDay() === 0
            const isPast = date <= today
            const isFuture = date > today
            const isToday =
              date.getDate() === today.getDate() &&
              date.getMonth() === today.getMonth() &&
              date.getFullYear() === today.getFullYear()
            const preAdmission = isBeforeAdmission(date)
            const outsideYear = isOutsideAcademicYear(date)
            const status = recordsByDate[dateStr]

            // TODO (Stage 12): Mark dates that fall on calendar_events holidays
            // here by checking a holiday set fetched from calendar_events.
            // Those dates should get the same dim treatment as Sundays.

            const isNonSchoolDay = isSunday
            const isDimmed = preAdmission || outsideYear || isFuture || isNonSchoolDay

            return (
              <div
                key={dateStr}
                title={
                  status
                    ? `${dateStr}: ${status}`
                    : isNonSchoolDay
                    ? `${dateStr}: Sunday`
                    : preAdmission
                    ? `${dateStr}: Before enrolment`
                    : dateStr
                }
                className={[
                  'relative flex flex-col items-center justify-center aspect-square transition-colors',
                  'bg-card',
                  isDimmed ? 'opacity-40' : '',
                  isToday ? 'ring-2 ring-primary ring-inset z-10' : '',
                  isNonSchoolDay ? 'bg-muted/20' : '',
                ].join(' ')}
              >
                {/* Date number */}
                <span
                  className={[
                    'text-[10px] sm:text-xs font-semibold tabular-nums',
                    isToday
                      ? 'text-primary'
                      : isFuture || isDimmed
                      ? 'text-muted-foreground'
                      : 'text-foreground',
                  ].join(' ')}
                >
                  {date.getDate()}
                </span>

                {/* Status dot — only for past non-Sunday, non-pre-admission dates */}
                {isPast && !isNonSchoolDay && !preAdmission && !outsideYear && (
                  <span
                    className={[
                      'mt-0.5 h-1.5 w-1.5 rounded-full',
                      status ? DOT_COLORS[status] : 'bg-muted-foreground/20',
                    ].join(' ')}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-4 justify-center sm:justify-start">
          {[
            { label: 'Present', color: 'bg-emerald-500' },
            { label: 'Absent', color: 'bg-red-500' },
            { label: 'Leave', color: 'bg-amber-400' },
            { label: 'On Duty', color: 'bg-blue-400' },
            { label: 'No record', color: 'bg-muted-foreground/20' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${item.color}`} />
              <span className="text-[11px] text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
