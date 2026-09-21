/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/whatsapp/send-circular
 * Loops through all affected parent phone numbers and sends a WhatsApp
 * Cloud API template message. Logs each attempt to whatsapp_log table.
 *
 * Template assumed: 'school_circular'
 * Parameters: {{school_name}}, {{circular_title}}
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const body = await req.json()
    const { circular_id, school_id, title, target_class_id } = body

    const waToken = process.env.WHATSAPP_CLOUD_API_TOKEN
    const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID

    // Get school name
    let schoolName = 'Vajdhata School'
    try {
      const { data: school } = await supabase
        .from('schools')
        .select('name')
        .eq('id', school_id)
        .single()
      if (school?.name) schoolName = school.name
    } catch { /* noop */ }

    // Get target phone numbers (parents of affected students)
    let phoneNumbers: { phone: string; name: string }[] = []

    try {
      let profileQuery = supabase
        .from('profiles')
        .select('id, full_name, phone')
        .eq('school_id', school_id)
        .in('role', ['parent', 'student'])
        .not('phone', 'is', null)

      if (target_class_id) {
        // Get parent phones for students in this class
        const { data: students } = await supabase
          .from('students')
          .select('id')
          .eq('school_id', school_id)
          .eq('class_id', target_class_id)

        if (students && students.length > 0) {
          const studentIds = students.map((s: any) => s.id)
          const { data: links } = await supabase
            .from('parent_student_links')
            .select('parent_profile_id, profiles:parent_profile_id(full_name, phone)')
            .in('student_id', studentIds)
            .eq('school_id', school_id)

          phoneNumbers = (links || [])
            .filter((l: any) => l.profiles?.phone)
            .map((l: any) => ({ phone: l.profiles.phone, name: l.profiles.full_name }))
        }
      } else {
        const { data: profiles } = await profileQuery
        phoneNumbers = (profiles || [])
          .filter((p: any) => p.phone)
          .map((p: any) => ({ phone: p.phone, name: p.full_name }))
      }
    } catch (err) {
      console.warn('Phone number fetch warning:', err)
      phoneNumbers = [] // Graceful: log 0 sends
    }

    const results: any[] = []

    for (const { phone, name } of phoneNumbers) {
      const normalizedPhone = phone.replace(/\D/g, '')
      let status = 'pending'
      let waMessageId: string | null = null
      let errorMessage: string | null = null

      if (waToken && waPhoneId && waToken !== '') {
        try {
          const res = await fetch(
            `https://graph.facebook.com/v19.0/${waPhoneId}/messages`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${waToken}`,
              },
              body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: normalizedPhone,
                type: 'template',
                template: {
                  name: 'school_circular', // TODO: replace with approved template name
                  language: { code: 'en' },
                  components: [
                    {
                      type: 'body',
                      parameters: [
                        { type: 'text', text: schoolName },
                        { type: 'text', text: title },
                      ],
                    },
                  ],
                },
              }),
            }
          )
          const data = await res.json()
          if (res.ok && data.messages?.[0]?.id) {
            status = 'success'
            waMessageId = data.messages[0].id
          } else {
            status = 'failed'
            errorMessage = JSON.stringify(data?.error || 'Unknown error')
          }
        } catch (err: any) {
          status = 'failed'
          errorMessage = err?.message || 'Network error'
        }
      } else {
        // Demo/sandbox: mark as success but not actually sent
        status = 'success'
        waMessageId = `demo_${Date.now()}`
      }

      // Log the attempt
      try {
        await supabase.from('whatsapp_log').insert({
          school_id,
          recipient_phone: normalizedPhone,
          template_name: 'school_circular',
          message_body: `${schoolName}: ${title}`,
          status,
          wa_message_id: waMessageId,
          error_message: errorMessage,
        })
      } catch { /* noop */ }

      results.push({ phone: normalizedPhone, status })
    }

    return NextResponse.json({
      success: true,
      sent: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'failed').length,
      total: results.length,
      demo: !waToken || waToken === '',
    })
  } catch (err: any) {
    console.error('WhatsApp send-circular error:', err)
    return NextResponse.json({ error: err?.message || 'Failed to send WhatsApp messages' }, { status: 500 })
  }
}
