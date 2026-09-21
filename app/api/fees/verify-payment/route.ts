/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/fees/verify-payment
 * Verifies Razorpay payment signature and marks dues as paid.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const body = await req.json()
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      due_ids,
      student_id,
      school_id,
      amount_paise,
    } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment parameters' }, { status: 400 })
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || ''

    // ── Demo mode: no real verification ──────────────────────────────────────
    if (!keySecret || keySecret === '' || razorpay_payment_id.startsWith('pay_demo')) {
      // Simulate success in demo/test mode
      await markDuesPaid(supabase, due_ids, student_id, school_id, razorpay_order_id, razorpay_payment_id, amount_paise)
      return NextResponse.json({ success: true, demo: true })
    }

    // ── Live: Verify signature ────────────────────────────────────────────────
    const expectedSignature = createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Payment signature verification failed' }, { status: 400 })
    }

    await markDuesPaid(supabase, due_ids, student_id, school_id, razorpay_order_id, razorpay_payment_id, amount_paise)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('verify-payment error:', err)
    return NextResponse.json({ error: err?.message || 'Verification failed' }, { status: 500 })
  }
}

async function markDuesPaid(
  supabase: any,
  dueIds: string[],
  studentId: string,
  schoolId: string,
  orderId: string,
  paymentId: string,
  totalPaise: number
) {
  if (!dueIds || dueIds.length === 0) return

  try {
    // Mark each due as paid
    for (const dueId of dueIds) {
      const { data: due } = await supabase
        .from('student_fee_dues')
        .select('amount_due_paise, late_fee_paise')
        .eq('id', dueId)
        .single()

      if (due) {
        await supabase
          .from('student_fee_dues')
          .update({
            amount_paid_paise: due.amount_due_paise,
            status: 'paid',
            updated_at: new Date().toISOString(),
          })
          .eq('id', dueId)

        // Insert payment record
        const receiptNo = `RCPT-${Date.now()}-${dueId.slice(0, 8)}`
        await supabase.from('fee_payments').insert({
          school_id: schoolId,
          student_id: studentId,
          student_fee_due_id: dueId,
          amount_paise: totalPaise / dueIds.length,
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: null,
          status: 'captured',
          paid_at: new Date().toISOString(),
          receipt_no: receiptNo,
          payment_mode: 'online',
        })
      }
    }

    // Insert notification for parent
    if (studentId && schoolId) {
      await supabase.from('notifications').insert({
        school_id: schoolId,
        profile_id: studentId,
        title: 'Fee Payment Successful',
        body: `Your fee payment of ₹${(totalPaise / 100).toLocaleString('en-IN')} was captured successfully. Receipt has been generated.`,
        type: 'fee',
        is_read: false,
      })
    }
  } catch (err) {
    console.warn('markDuesPaid Supabase warning (demo fallback):', err)
  }
}
