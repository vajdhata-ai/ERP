/**
 * lib/data/attendance.ts
 * ============================================================================
 * Data helpers for Stage 5 — Attendance Module
 * Used by:
 *   - app/(dashboard)/teacher/attendance/page.tsx
 *   - app/(dashboard)/student/attendance/page.tsx
 *   - app/api/attendance/save/route.ts
 * ============================================================================
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { SupabaseClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AttendanceStatus = 'present' | 'absent' | 'leave' | 'on_duty'

export interface ClassOption {
  id: string
  name: string
  sections: SectionOption[]
}

export interface SectionOption {
  id: string
  name: string
  class_id: string
}

export interface RosterStudent {
  student_id: string
  student_record_id: string // students.id (UUID)
  full_name: string
  admission_no: string
  avatar_url: string | null
  status: AttendanceStatus | null // null = not yet marked for this date
  attendance_id?: string | null    // existing attendance_records.id if any
}

export interface AttendanceRecord {
  id: string
  student_id: string
  date: string
  status: AttendanceStatus
  marked_by: string
}

export interface MonthlyStats {
  month: string         // e.g. 'Apr', 'May'
  monthIndex: number    // 0 = April … 11 = March (academic year order)
  year: number          // calendar year for this month
  present: number
  absent: number
  leave: number
  on_duty: number
  total: number
}

export interface StudentAttendanceStats {
  records: { date: string; status: AttendanceStatus }[]
  monthly: MonthlyStats[]
  totalPresent: number
  totalAbsent: number
  totalLeave: number
  totalOnDuty: number
  totalSchoolDays: number   // days counted (excluding pre-admission, Sundays — see TODO)
  overallPercent: number    // present / totalSchoolDays * 100
  admissionDate: string | null
}

// ---------------------------------------------------------------------------
// Academic-year helpers
// ---------------------------------------------------------------------------

/**
 * Given a JS Date, returns the academic year string like "2026-27".
 * Academic year runs April → March.
 */
export function getAcademicYear(date: Date = new Date()): string {
  const month = date.getMonth() // 0-indexed
  const year = date.getFullYear()
  if (month >= 3) {
    // April (3) or later → current year start
    return `${year}-${String(year + 1).slice(-2)}`
  } else {
    // Jan-Mar → previous year was the start
    return `${year - 1}-${String(year).slice(-2)}`
  }
}

/**
 * Given an academic year string like "2026-27", returns start and end dates.
 * Start = 1 April of the start year, End = 31 March of the end year.
 */
export function getAcademicYearBounds(academicYear: string): { start: Date; end: Date } {
  const parts = academicYear.split('-')
  const startYear = parseInt(parts[0], 10)
  return {
    start: new Date(startYear, 3, 1),   // April 1
    end: new Date(startYear + 1, 2, 31), // March 31
  }
}

/**
 * Returns the ordered list of months (Apr–Mar) for an academic year.
 * Each entry has { label, monthIndex (0-based), year }.
 */
export function getAcademicMonths(
  academicYear: string
): { label: string; monthIndex: number; year: number }[] {
  const parts = academicYear.split('-')
  const startYear = parseInt(parts[0], 10)
  const months = [
    'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
    'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar',
  ]
  return months.map((label, i) => {
    const calMonth = (i + 3) % 12  // April = 3, May = 4, … Jan = 0, Feb = 1, Mar = 2
    const year = calMonth >= 3 ? startYear : startYear + 1
    return { label, monthIndex: calMonth, year }
  })
}

// ---------------------------------------------------------------------------
// 1. Teacher helpers
// ---------------------------------------------------------------------------

/**
 * Fetch all classes with their sections for a given school.
 * Returns them sorted by class name.
 */
export async function getClassesAndSections(
  supabase: SupabaseClient,
  schoolId: string
): Promise<ClassOption[]> {
  const { data: classes, error: classErr } = await supabase
    .from('classes')
    .select('id, name')
    .eq('school_id', schoolId)
    .order('name')

  if (classErr || !classes) return []

  const { data: sections, error: secErr } = await supabase
    .from('sections')
    .select('id, name, class_id')
    .eq('school_id', schoolId)
    .order('name')

  if (secErr || !sections) return []

  return classes.map((cls) => ({
    id: cls.id,
    name: cls.name,
    sections: sections
      .filter((s) => s.class_id === cls.id)
      .map((s) => ({ id: s.id, name: s.name, class_id: s.class_id })),
  }))
}

/**
 * Fetch the student roster for a section, pre-populated with attendance
 * status if records already exist for the given date.
 * Returns one entry per student, status = null if not yet marked.
 */
export async function getRosterForSection(
  supabase: SupabaseClient,
  schoolId: string,
  sectionId: string,
  date: string // YYYY-MM-DD
): Promise<RosterStudent[]> {
  // 1. Fetch all active students in this section
  const { data: students, error: stuErr } = await supabase
    .from('students')
    .select(
      'id, admission_no, profile_id, profiles(full_name, avatar_url, is_active)'
    )
    .eq('school_id', schoolId)
    .eq('section_id', sectionId)
    .order('admission_no')

  if (stuErr || !students) return []

  const activeStudents = students.filter((s) => {
    const profile = Array.isArray(s.profiles) ? s.profiles[0] : s.profiles
    return profile?.is_active !== false
  })

  // 2. Fetch existing attendance records for those students on this date
  const studentIds = activeStudents.map((s) => s.id)
  let existingMap: Record<string, { id: string; status: AttendanceStatus }> = {}

  if (studentIds.length > 0) {
    const { data: existing } = await supabase
      .from('attendance_records')
      .select('id, student_id, status')
      .eq('school_id', schoolId)
      .eq('date', date)
      .in('student_id', studentIds)

    if (existing) {
      existingMap = existing.reduce(
        (acc, rec) => {
          acc[rec.student_id] = { id: rec.id, status: rec.status as AttendanceStatus }
          return acc
        },
        {} as Record<string, { id: string; status: AttendanceStatus }>
      )
    }
  }

  // 3. Merge
  return activeStudents.map((s) => {
    const profile = Array.isArray(s.profiles) ? s.profiles[0] : (s.profiles as any)
    const existing = existingMap[s.id]
    return {
      student_id: s.profile_id,  // profile UUID (used as the user-facing ID)
      student_record_id: s.id,   // students.id (used for DB operations)
      full_name: profile?.full_name ?? 'Unknown',
      admission_no: s.admission_no,
      avatar_url: profile?.avatar_url ?? null,
      status: existing?.status ?? null,
      attendance_id: existing?.id ?? null,
    }
  })
}

// ---------------------------------------------------------------------------
// 2. Student / parent helpers
// ---------------------------------------------------------------------------

/**
 * Resolves the students.id for a given profile_id (student or parent).
 * For parents, pass childStudentRecordId directly.
 * Returns: { studentRecordId, admissionDate, schoolId }
 */
export async function resolveStudentRecord(
  supabase: SupabaseClient,
  profileId: string,
  childStudentRecordId?: string | null
): Promise<{ studentRecordId: string; admissionDate: string | null; schoolId: string } | null> {
  if (childStudentRecordId) {
    const { data } = await supabase
      .from('students')
      .select('id, admission_date, school_id')
      .eq('id', childStudentRecordId)
      .single()
    if (!data) return null
    return {
      studentRecordId: data.id,
      admissionDate: data.admission_date ?? null,
      schoolId: data.school_id,
    }
  }

  // Try to find via profile_id (student)
  const { data: student } = await supabase
    .from('students')
    .select('id, admission_date, school_id')
    .eq('profile_id', profileId)
    .single()

  if (student) {
    return {
      studentRecordId: student.id,
      admissionDate: student.admission_date ?? null,
      schoolId: student.school_id,
    }
  }

  // Try to find via parent_student_links → first child
  const { data: link } = await supabase
    .from('parent_student_links')
    .select('student_id, students(id, admission_date, school_id)')
    .eq('parent_profile_id', profileId)
    .limit(1)
    .single()

  if (link) {
    const s = Array.isArray(link.students) ? link.students[0] : (link.students as any)
    return {
      studentRecordId: s?.id ?? link.student_id,
      admissionDate: s?.admission_date ?? null,
      schoolId: s?.school_id ?? '',
    }
  }

  return null
}

/**
 * Fetch all attendance records for a student within an academic year,
 * compute monthly breakdowns and overall percentage.
 *
 * Edge case: Only counts days from admission_date onward (not before).
 * TODO (Stage 12): Exclude holidays from calendar_events where event_type = 'holiday'
 *   when counting totalSchoolDays. For now Sundays are excluded, other holidays are not.
 */
export async function getStudentAttendanceStats(
  supabase: SupabaseClient,
  studentRecordId: string,
  academicYear: string,
  admissionDate: string | null
): Promise<StudentAttendanceStats> {
  const { start, end } = getAcademicYearBounds(academicYear)
  const today = new Date()
  const effectiveEnd = end < today ? end : today

  // Clamp start to admission date if later
  let effectiveStart = start
  if (admissionDate) {
    const admDate = new Date(admissionDate)
    if (admDate > effectiveStart) effectiveStart = admDate
  }

  const startStr = formatDateStr(effectiveStart)
  const endStr = formatDateStr(effectiveEnd)

  const { data: records } = await supabase
    .from('attendance_records')
    .select('date, status')
    .eq('student_id', studentRecordId)
    .gte('date', startStr)
    .lte('date', endStr)
    .order('date')

  const safeRecords: { date: string; status: AttendanceStatus }[] =
    (records ?? []).map((r) => ({ date: r.date, status: r.status as AttendanceStatus }))

  // Build status lookup
  const statusByDate: Record<string, AttendanceStatus> = {}
  for (const r of safeRecords) {
    statusByDate[r.date] = r.status
  }

  // Aggregate totals
  let totalPresent = 0
  let totalAbsent = 0
  let totalLeave = 0
  let totalOnDuty = 0

  for (const r of safeRecords) {
    if (r.status === 'present') totalPresent++
    else if (r.status === 'absent') totalAbsent++
    else if (r.status === 'leave') totalLeave++
    else if (r.status === 'on_duty') totalOnDuty++
  }

  // Monthly breakdown — iterate academic months
  const academicMonths = getAcademicMonths(academicYear)
  const monthly: MonthlyStats[] = academicMonths.map((m) => {
    const monthStart = new Date(m.year, m.monthIndex, 1)
    const monthEnd = new Date(m.year, m.monthIndex + 1, 0)

    // Only count months that have started
    const clampedEnd = monthEnd < effectiveEnd ? monthEnd : effectiveEnd
    const clampedStart = monthStart < effectiveStart ? effectiveStart : monthStart

    let present = 0, absent = 0, leave = 0, on_duty = 0, total = 0

    if (clampedStart <= clampedEnd) {
      // Walk each day in the clamped range
      const cursor = new Date(clampedStart)
      while (cursor <= clampedEnd) {
        const dayOfWeek = cursor.getDay()
        const dateStr = formatDateStr(cursor)

        // TODO (Stage 12): also exclude calendar_events holidays here
        if (dayOfWeek !== 0) { // 0 = Sunday — exclude Sundays from school days
          total++
          const s = statusByDate[dateStr]
          if (s === 'present') present++
          else if (s === 'absent') absent++
          else if (s === 'leave') leave++
          else if (s === 'on_duty') on_duty++
        }

        cursor.setDate(cursor.getDate() + 1)
      }
    }

    return {
      month: m.label,
      monthIndex: m.monthIndex,
      year: m.year,
      present,
      absent,
      leave,
      on_duty,
      total,
    }
  })

  // totalSchoolDays = non-Sunday days from effectiveStart to effectiveEnd
  // TODO (Stage 12): subtract holiday days from calendar_events here
  let totalSchoolDays = 0
  {
    const cursor = new Date(effectiveStart)
    while (cursor <= effectiveEnd) {
      if (cursor.getDay() !== 0) totalSchoolDays++
      cursor.setDate(cursor.getDate() + 1)
    }
  }

  const overallPercent =
    totalSchoolDays > 0
      ? Math.round((totalPresent / totalSchoolDays) * 100 * 10) / 10
      : 0

  return {
    records: safeRecords,
    monthly,
    totalPresent,
    totalAbsent,
    totalLeave,
    totalOnDuty,
    totalSchoolDays,
    overallPercent,
    admissionDate,
  }
}

/**
 * Fetch all children linked to a parent profile.
 * Returns minimal info for the child-switcher.
 */
export async function getLinkedChildren(
  supabase: SupabaseClient,
  parentProfileId: string
): Promise<
  {
    student_record_id: string
    full_name: string
    admission_no: string
    class_name: string
    section_name: string
    avatar_url: string | null
  }[]
> {
  const { data } = await supabase
    .from('parent_student_links')
    .select(
      `student_id,
       students(
         id, admission_no,
         profiles(full_name, avatar_url),
         classes(name),
         sections(name)
       )`
    )
    .eq('parent_profile_id', parentProfileId)

  if (!data) return []

  return data.map((link) => {
    const s = Array.isArray(link.students) ? link.students[0] : (link.students as any)
    const profile = Array.isArray(s?.profiles) ? s.profiles[0] : s?.profiles
    const cls = Array.isArray(s?.classes) ? s.classes[0] : s?.classes
    const sec = Array.isArray(s?.sections) ? s.sections[0] : s?.sections
    return {
      student_record_id: s?.id ?? link.student_id,
      full_name: profile?.full_name ?? '—',
      admission_no: s?.admission_no ?? '—',
      class_name: cls?.name ?? '—',
      section_name: sec?.name ?? '—',
      avatar_url: profile?.avatar_url ?? null,
    }
  })
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------
function formatDateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}
