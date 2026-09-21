/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/fees/webhook
 * Razorpay webhook safety net — handles payment.captured events
 * even if the browser closes before verify-payment callback fires.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-razorpay-signature') || ''
    const secret = process.env.RAZORPAY_KEY_SECRET || ''

    // In demo mode, just acknowledge
    if (!secret || secret === '') {
      return NextResponse.json({ received: true, demo: true })
    }

    // Verify webhook signature
    const expected = createHmac('sha256', secret).update(body).digest('hex')
    if (expected !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)
    const supabase = createClient()

    if (event.event === 'payment.captured') {
      const payment = event.payload?.payment?.entity
      if (payment) {
        const { notes } = payment
        const dueIds: string[] = notes?.due_ids ? notes.due_ids.split(',') : []
        const studentId = notes?.student_id || ''
        const schoolId = notes?.school_id || ''

        if (dueIds.length > 0) {
          for (const dueId of dueIds) {
            await supabase
              .from('student_fee_dues')
              .update({ status: 'paid', amount_paid_paise: payment.amount, updated_at: new Date().toISOString() })
              .eq('id', dueId)
              .neq('status', 'paid') // idempotent
          }

          // Insert payment record idempotently
          await supabase.from('fee_payments').upsert({
            school_id: schoolId,
            student_id: studentId,
            student_fee_due_id: dueIds[0],
            amount_paise: payment.amount,
            razorpay_order_id: payment.order_id,
            razorpay_payment_id: payment.id,
            status: 'captured',
            paid_at: new Date().toISOString(),
            receipt_no: `RCPT-WH-${payment.id}`,
            payment_mode: 'online',
          }, { onConflict: 'school_id,receipt_no', ignoreDuplicates: true })
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
