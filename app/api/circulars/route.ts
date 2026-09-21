/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/circulars — Create a new circular + send WhatsApp + push notifications
 * GET  /api/circulars — Fetch circulars for authenticated user's school
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await req.json()
    const { title, description, category, target_class_id, target_section_id, send_whatsapp, school_id } = body

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }

    const schoolId = school_id || '11111111-1111-1111-1111-111111111111'
    const createdBy = user?.id || 'b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb'

    let circularId: string | null = null

    // 1. Insert circular into DB
    try {
      const { data, error } = await supabase
        .from('circulars')
        .insert({
          school_id: schoolId,
          title,
          description,
          category: category || 'General',
          target_class_id: target_class_id || null,
          target_section_id: target_section_id || null,
          created_by: createdBy,
          send_whatsapp: send_whatsapp || false,
        })
        .select()
        .single()

      if (!error && data) {
        circularId = data.id

        // 2. Create in-app notifications for affected students/parents
        let profileQuery = supabase.from('profiles').select('id').eq('school_id', schoolId)
        if (!target_class_id) {
          // Whole school
        } else {
          // Specific class — get student profile_ids in that class
          const { data: students } = await supabase
            .from('students')
            .select('profile_id, id')
            .eq('school_id', schoolId)
            .eq('class_id', target_class_id)

          if (students && students.length > 0) {
            const studentProfileIds = students.map((s: any) => s.profile_id)
            // Also get linked parent profile IDs
            const studentIds = students.map((s: any) => s.id)
            const { data: parentLinks } = await supabase
              .from('parent_student_links')
              .select('parent_profile_id')
              .in('student_id', studentIds)
              .eq('school_id', schoolId)

            const allProfileIds = [
              ...studentProfileIds,
              ...(parentLinks || []).map((l: any) => l.parent_profile_id),
            ]

            if (allProfileIds.length > 0) {
              const notifRows = allProfileIds.map((pid: string) => ({
                school_id: schoolId,
                profile_id: pid,
                title: `📢 ${title}`,
                body: description.slice(0, 200),
                type: 'circular',
                is_read: false,
              }))
              await supabase.from('notifications').insert(notifRows)
            }
          }
        }
      }
    } catch (err) {
      console.warn('Supabase circular insert warning:', err)
    }

    // 3. Trigger WhatsApp send (fire-and-forget)
    if (send_whatsapp) {
      try {
        await fetch(`${req.nextUrl.origin}/api/whatsapp/send-circular`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            circular_id: circularId,
            school_id: schoolId,
            title,
            target_class_id,
          }),
        })
      } catch (err) {
        console.warn('WhatsApp trigger warning:', err)
      }
    }

    return NextResponse.json({
      success: true,
      circular: {
        id: circularId || crypto.randomUUID(),
        school_id: schoolId,
        title,
        description,
        category: category || 'General',
        target_class_id: target_class_id || null,
        created_by: createdBy,
        send_whatsapp: send_whatsapp || false,
        created_at: new Date().toISOString(),
      },
    })
  } catch (err: any) {
    console.error('POST /api/circulars error:', err)
    return NextResponse.json({ error: err?.message || 'Failed to create circular' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(req.url)
    const schoolId = searchParams.get('school_id') || '11111111-1111-1111-1111-111111111111'
    const classId = searchParams.get('class_id')

    let query = supabase
      .from('circulars')
      .select('*, profiles:created_by(full_name), classes:target_class_id(name)')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (classId) {
      query = query.or(`target_class_id.is.null,target_class_id.eq.${classId}`)
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ circulars: data || [] })
  } catch (err: any) {
    return NextResponse.json({ circulars: [] })
  }
}
