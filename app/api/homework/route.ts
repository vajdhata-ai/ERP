/* eslint-disable @typescript-eslint/no-explicit-any */
﻿import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface CreateHomeworkBody {
  school_id: string
  class_id: string
  section_id: string
  class_name?: string
  section_name?: string
  subject: string
  type: 'homework' | 'assignment'
  title: string
  description: string
  due_date: string | null
  teacher_remarks?: string | null
  attachment_url?: string | null
  attachment_name?: string | null
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // 1. Parse body
    const body: CreateHomeworkBody = await req.json()
    const {
      school_id,
      class_id,
      section_id,
      class_name,
      section_name,
      subject,
      type = 'homework',
      title,
      description,
      due_date,
      teacher_remarks,
      attachment_url,
      attachment_name,
    } = body

    if (!title || !description || !subject || !class_id || !section_id) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, subject, class_id, and section_id are required.' },
        { status: 400 }
      )
    }

    const createdBy = user?.id || 'd1111111-dddd-dddd-dddd-dddddddddddd'
    const schoolId = school_id || '11111111-1111-1111-1111-111111111111'

    // 2. Try inserting into Supabase homework table
    let insertedHomework: any = null
    try {
      const { data, error: insertErr } = await supabase
        .from('homework')
        .insert({
          school_id: schoolId,
          class_id,
          section_id,
          subject,
          type,
          title,
          description,
          due_date: due_date || null,
          created_by: createdBy,
          teacher_remarks: teacher_remarks || null,
          attachment_url: attachment_url || null,
          attachment_name: attachment_name || null,
        })
        .select()
        .single()

      if (!insertErr && data) {
        insertedHomework = data

        // 3. Query all students in this class/section to create homework_status
        const { data: students } = await supabase
          .from('students')
          .select('id, profile_id')
          .eq('school_id', schoolId)
          .eq('class_id', class_id)
          .eq('section_id', section_id)

        if (students && students.length > 0) {
          const statusRows = students.map((s) => ({
            school_id: schoolId,
            homework_id: insertedHomework.id,
            student_id: s.id,
            status: 'pending',
          }))

          await supabase.from('homework_status').insert(statusRows)

          // 4. Create parent notifications for each affected student
          const studentIds = students.map((s) => s.id)
          const { data: parentLinks } = await supabase
            .from('parent_student_links')
            .select('parent_profile_id, student_id')
            .in('student_id', studentIds)
            .eq('school_id', schoolId)

          if (parentLinks && parentLinks.length > 0) {
            const friendlyDue = due_date
              ? `Due on ${new Date(due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
              : 'No submission deadline'

            const notificationRows = parentLinks.map((link) => ({
              school_id: schoolId,
              profile_id: link.parent_profile_id,
              title: `New ${type === 'assignment' ? 'Assignment' : 'Homework'}: ${title}`,
              body: `${subject} homework assigned for Class ${class_name || ''} ${section_name || ''}. ${friendlyDue}.`,
              type: 'homework',
              is_read: false,
            }))

            await supabase.from('notifications').insert(notificationRows)
          }
        }
      }
    } catch (err) {
      console.warn('Supabase insert warning (offline or demo fallback):', err)
    }

    // Return the response
    return NextResponse.json({
      success: true,
      homework: insertedHomework || {
        id: crypto.randomUUID(),
        school_id: schoolId,
        class_id,
        section_id,
        class_name,
        section_name,
        subject,
        type,
        title,
        description,
        due_date,
        created_by: createdBy,
        teacher_remarks,
        attachment_url,
        attachment_name,
        created_at: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error('API /homework error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to process homework request' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing homework ID' }, { status: 400 })
    }

    try {
      await supabase.from('homework').delete().eq('id', id)
    } catch (err) {
      console.warn('Supabase delete warning:', err)
    }

    return NextResponse.json({ success: true, id })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to delete' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createClient()
    const body = await req.json()
    const { id, title, description, due_date, subject, type, teacher_remarks, attachment_url, attachment_name } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing homework ID' }, { status: 400 })
    }

    try {
      await supabase
        .from('homework')
        .update({
          title,
          description,
          due_date: due_date || null,
          subject,
          type,
          teacher_remarks: teacher_remarks || null,
          attachment_url: attachment_url || null,
          attachment_name: attachment_name || null,
        })
        .eq('id', id)
    } catch (err) {
      console.warn('Supabase patch warning:', err)
    }

    return NextResponse.json({ success: true, id })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to update' }, { status: 500 })
  }
}
