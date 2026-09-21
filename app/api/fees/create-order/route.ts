/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/fees/create-order
 * Creates a Razorpay order for selected fee due IDs.
 * CRITICAL: Server re-reads the actual amounts from DB — never trusts the client.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await req.json()
    const { due_ids, student_id, school_id } = body

    if (!due_ids || !Array.isArray(due_ids) || due_ids.length === 0) {
      return NextResponse.json({ error: 'No fee dues selected' }, { status: 400 })
    }

    // ── DEMO mode: Razorpay keys not configured ──────────────────────────────
    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret || keyId === '' || keySecret === '') {
      // Return a mock order so the UI can show a success demo
      const mockOrderId = `order_demo_${Date.now()}`
      return NextResponse.json({
        demo: true,
        order_id: mockOrderId,
        key_id: 'rzp_test_demo',
        amount_paise: 1800000,
        currency: 'INR',
        message: 'Demo mode: Razorpay keys not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local for live payments.',
      })
    }

    // ── Live mode: Re-read amounts from DB ────────────────────────────────────
    const { data: dues, error: duesErr } = await supabase
      .from('student_fee_dues')
      .select('id, amount_due_paise, amount_paid_paise, late_fee_paise, status')
      .in('id', due_ids)
      .eq('student_id', student_id || user?.id)
      .eq('school_id', school_id)
      .neq('status', 'paid') // Only unpaid dues

    if (duesErr || !dues || dues.length === 0) {
      return NextResponse.json({ error: 'No valid unpaid fee dues found' }, { status: 400 })
    }

    // Server-side amount computation
    const totalPaise = dues.reduce((acc: number, d: any) => {
      const remaining = d.amount_due_paise - d.amount_paid_paise
      return acc + remaining + (d.late_fee_paise || 0)
    }, 0)

    if (totalPaise <= 0) {
      return NextResponse.json({ error: 'Total amount must be greater than 0' }, { status: 400 })
    }

    // Create Razorpay order via HTTP
    const Razorpay = (await import('razorpay')).default
    const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret })

    const receiptNo = `RCPT-${Date.now()}`
    const order = await rzp.orders.create({
      amount: totalPaise,
      currency: 'INR',
      receipt: receiptNo,
      notes: {
        student_id: student_id || '',
        school_id: school_id || '',
        due_ids: due_ids.join(','),
      },
    })

    return NextResponse.json({
      order_id: order.id,
      key_id: keyId,
      amount_paise: totalPaise,
      currency: 'INR',
      receipt: receiptNo,
    })
  } catch (err: any) {
    console.error('create-order error:', err)
    return NextResponse.json(
      { error: err?.message || 'Failed to create payment order' },
      { status: 500 }
    )
  }
}
