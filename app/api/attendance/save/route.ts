/**
 * app/api/attendance/save/route.ts
 * ============================================================================
 * POST /api/attendance/save
 *
 * Body: {
 *   school_id: string
 *   section_id: string
 *   date: string        // YYYY-MM-DD
 *   records: Array<{ student_record_id: string; status: AttendanceStatus }>
 * }
 *
 * 1. Verifies caller is a teacher / school_admin in the same school.
 * 2. Upserts each record into attendance_records.
 * 3. For students newly marked absent, inserts a notification row for each
 *    linked parent.
 * 4. TODO (Stage 8): Call WhatsApp sending function for absent notifications.
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AttendanceStatus } from '@/lib/data/attendance'

interface SaveRecord {
  student_record_id: string
  status: AttendanceStatus
}

interface SaveRequestBody {
  school_id: string
  section_id: string
  date: string
  records: SaveRecord[]
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()

    // 1. Authenticate
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Verify role: must be teacher or admin
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('id, school_id, role')
      .eq('id', user.id)
      .single()

    if (profileErr || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 403 })
    }

    if (!['teacher', 'school_admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden: insufficient role' }, { status: 403 })
    }

    // 3. Parse body
    const body: SaveRequestBody = await req.json()
    const { school_id, date, records } = body

    if (!school_id || !date || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    // Must be the same school as the caller (unless super_admin)
    if (profile.role !== 'super_admin' && profile.school_id !== school_id) {
      return NextResponse.json({ error: 'Forbidden: school mismatch' }, { status: 403 })
    }

    // 4. Fetch existing attendance records for this date (to detect newly-absent)
    const studentIds = records.map((r) => r.student_record_id)

    const { data: existingRecords } = await supabase
      .from('attendance_records')
      .select('id, student_id, status')
      .eq('school_id', school_id)
      .eq('date', date)
      .in('student_id', studentIds)

    const existingStatusMap: Record<string, string> = {}
    if (existingRecords) {
      for (const r of existingRecords) {
        existingStatusMap[r.student_id] = r.status
      }
    }

    // 5. Upsert all attendance records
    const upsertRows = records.map((r) => ({
      school_id,
      student_id: r.student_record_id,
      date,
      status: r.status,
      marked_by: profile.id,
    }))

    const { error: upsertErr } = await supabase
      .from('attendance_records')
      .upsert(upsertRows, {
        onConflict: 'student_id,date',
        ignoreDuplicates: false,
      })

    if (upsertErr) {
      console.error('[attendance/save] upsert error:', upsertErr)
      return NextResponse.json({ error: 'Failed to save attendance', detail: upsertErr.message }, { status: 500 })
    }

    // 6. Determine newly-absent students (wasn't absent before, now is)
    const newlyAbsentStudentIds = records
      .filter(
        (r) =>
          r.status === 'absent' && existingStatusMap[r.student_record_id] !== 'absent'
      )
      .map((r) => r.student_record_id)

    if (newlyAbsentStudentIds.length > 0) {
      // 6a. Find linked parents for these students
      const { data: links } = await supabase
        .from('parent_student_links')
        .select('parent_profile_id, student_id, students(profiles(full_name))')
        .in('student_id', newlyAbsentStudentIds)
        .eq('school_id', school_id)

      if (links && links.length > 0) {
        const notificationRows = links.map((link) => {
          const student = Array.isArray(link.students) ? link.students[0] : (link.students as { profiles: { full_name: string } | { full_name: string }[] | null } | null)
          const profileRaw = (student as { profiles?: { full_name: string } | { full_name: string }[] | null } | null)?.profiles
          const studentProfile = Array.isArray(profileRaw) ? profileRaw[0] : profileRaw
          const studentName = studentProfile?.full_name ?? 'Your child'
          const friendlyDate = new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
          return {
            school_id,
            profile_id: link.parent_profile_id,
            title: 'Attendance Alert — Absent',
            body: `${studentName} was marked absent on ${friendlyDate}.`,
            type: 'attendance',
            is_read: false,
          }
        })

        const { error: notifErr } = await supabase.from('notifications').insert(notificationRows)
        if (notifErr) {
          // Log but don't fail the request — attendance was already saved
          console.error('[attendance/save] notification insert error:', notifErr)
        }

        // TODO (Stage 8): For each link, retrieve parent phone number and call
        // sendWhatsAppMessage(parentPhone, message) from the WhatsApp integration.
        // Example stub:
        //
        // for (const link of links) {
        //   const { data: parentProfile } = await supabase
        //     .from('profiles')
        //     .select('phone')
        //     .eq('id', link.parent_profile_id)
        //     .single()
        //
        //   if (parentProfile?.phone) {
        //     await sendWhatsAppMessage(
        //       parentProfile.phone,
        //       `Your child was marked absent on ${date}. — Radiant Public School`
        //     )
        //   }
        // }
      }
    }

    return NextResponse.json({
      success: true,
      saved: records.length,
      notified: newlyAbsentStudentIds.length,
    })
  } catch (err) {
    console.error('[attendance/save] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
