/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * lib/data/fees.ts
 * ============================================================================
 * Types, helpers, and localStorage seed for Stage 7 — Fees & Payments
 * All monetary amounts stored as INTEGER PAISE (1 INR = 100 paise)
 * ============================================================================
 */

import { SupabaseClient } from '@supabase/supabase-js'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FeeStructure {
  id: string
  school_id: string
  class_id: string
  academic_year: string
  installment_name: string
  due_date: string // YYYY-MM-DD
  amount_paise: number
}

export interface StudentFeeDue {
  id: string
  school_id: string
  student_id: string
  fee_structure_id: string
  installment_name: string
  academic_year: string
  due_date: string
  amount_due_paise: number
  amount_paid_paise: number
  late_fee_paise: number
  status: 'pending' | 'paid' | 'overdue'
}

export interface FeePayment {
  id: string
  school_id: string
  student_id: string
  student_fee_due_id: string
  amount_paise: number
  razorpay_order_id?: string | null
  razorpay_payment_id?: string | null
  status: string // captured, failed, created
  paid_at: string
  receipt_no: string
  payment_mode: string // online, cash, upi
  installment_name?: string
}

export interface FeeSummary {
  totalPaise: number
  paidPaise: number
  duePaise: number
  latePaise: number
  dues: StudentFeeDue[]
  payments: FeePayment[]
}

// ─── Paise helpers ────────────────────────────────────────────────────────────

export function paiseToRupees(paise: number): string {
  return (paise / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export function formatRupees(paise: number): string {
  return `₹${paiseToRupees(paise)}`
}

/** Compute late fee: ₹2/day for each day past due_date for pending dues */
export function computeLateFee(due: StudentFeeDue): number {
  if (due.status === 'paid') return 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDate = new Date(due.due_date + 'T23:59:59')
  if (dueDate >= today) return 0
  const daysLate = Math.floor((today.getTime() - dueDate.getTime()) / 86400000)
  return daysLate * 200 // ₹2/day = 200 paise/day
}

// ─── Local Storage seed ───────────────────────────────────────────────────────

const FEES_DUE_KEY = 'vajdhata_fee_dues_v1'
const FEES_PAYMENTS_KEY = 'vajdhata_fee_payments_v1'

const SEED_DUES: StudentFeeDue[] = [
  {
    id: '77777777-7777-7777-7777-888888888881',
    school_id: '11111111-1111-1111-1111-111111111111',
    student_id: '44444444-4444-4444-4444-444444444441',
    fee_structure_id: '77777777-7777-7777-7777-777777777771',
    installment_name: 'Term 1 (April–June)',
    academic_year: '2026-2027',
    due_date: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0], // 15 days ago → overdue
    amount_due_paise: 1800000, // ₹18,000
    amount_paid_paise: 1800000,
    late_fee_paise: 0,
    status: 'paid',
  },
  {
    id: '77777777-7777-7777-7777-888888888882',
    school_id: '11111111-1111-1111-1111-111111111111',
    student_id: '44444444-4444-4444-4444-444444444441',
    fee_structure_id: '77777777-7777-7777-7777-777777777772',
    installment_name: 'Term 2 (July–Sep)',
    academic_year: '2026-2027',
    due_date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0], // 5 days ago → overdue
    amount_due_paise: 1800000,
    amount_paid_paise: 0,
    late_fee_paise: 1000, // will be recomputed
    status: 'overdue',
  },
  {
    id: '77777777-7777-7777-7777-888888888883',
    school_id: '11111111-1111-1111-1111-111111111111',
    student_id: '44444444-4444-4444-4444-444444444441',
    fee_structure_id: '77777777-7777-7777-7777-777777777773',
    installment_name: 'Term 3 (Oct–Dec)',
    academic_year: '2026-2027',
    due_date: new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0], // future
    amount_due_paise: 1800000,
    amount_paid_paise: 0,
    late_fee_paise: 0,
    status: 'pending',
  },
  {
    id: '77777777-7777-7777-7777-888888888884',
    school_id: '11111111-1111-1111-1111-111111111111',
    student_id: '44444444-4444-4444-4444-444444444441',
    fee_structure_id: '77777777-7777-7777-7777-777777777774',
    installment_name: 'Term 4 (Jan–Mar)',
    academic_year: '2026-2027',
    due_date: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    amount_due_paise: 1800000,
    amount_paid_paise: 0,
    late_fee_paise: 0,
    status: 'pending',
  },
]

const SEED_PAYMENTS: FeePayment[] = [
  {
    id: 'pay-0001-0000-0000-0000-000000000001',
    school_id: '11111111-1111-1111-1111-111111111111',
    student_id: '44444444-4444-4444-4444-444444444441',
    student_fee_due_id: '77777777-7777-7777-7777-888888888881',
    amount_paise: 1800000,
    razorpay_order_id: 'order_demo_001',
    razorpay_payment_id: 'pay_demo_001',
    status: 'captured',
    paid_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    receipt_no: 'RCPT-2027-0001',
    payment_mode: 'online',
    installment_name: 'Term 1 (April–June)',
  },
]

export function getLocalFeeDues(): StudentFeeDue[] {
  if (typeof window === 'undefined') return SEED_DUES
  try {
    const raw = localStorage.getItem(FEES_DUE_KEY)
    if (!raw) {
      localStorage.setItem(FEES_DUE_KEY, JSON.stringify(SEED_DUES))
      return SEED_DUES
    }
    return JSON.parse(raw)
  } catch {
    return SEED_DUES
  }
}

export function saveLocalFeeDues(dues: StudentFeeDue[]): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(FEES_DUE_KEY, JSON.stringify(dues)) } catch { /* noop */ }
}

export function getLocalFeePayments(): FeePayment[] {
  if (typeof window === 'undefined') return SEED_PAYMENTS
  try {
    const raw = localStorage.getItem(FEES_PAYMENTS_KEY)
    if (!raw) {
      localStorage.setItem(FEES_PAYMENTS_KEY, JSON.stringify(SEED_PAYMENTS))
      return SEED_PAYMENTS
    }
    return JSON.parse(raw)
  } catch {
    return SEED_PAYMENTS
  }
}

export function saveLocalFeePayments(payments: FeePayment[]): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(FEES_PAYMENTS_KEY, JSON.stringify(payments)) } catch { /* noop */ }
}

// ─── Supabase helpers ─────────────────────────────────────────────────────────

export async function fetchStudentFees(
  supabase: SupabaseClient,
  studentId: string,
  schoolId: string
): Promise<{ dues: StudentFeeDue[]; payments: FeePayment[] }> {
  try {
    const [duesRes, paymentsRes] = await Promise.all([
      supabase
        .from('student_fee_dues')
        .select(`
          id, school_id, student_id, fee_structure_id,
          amount_due_paise, amount_paid_paise, late_fee_paise, status,
          fee_structures(installment_name, academic_year, due_date, amount_paise)
        `)
        .eq('student_id', studentId)
        .eq('school_id', schoolId)
        .order('created_at', { ascending: true }),
      supabase
        .from('fee_payments')
        .select('*')
        .eq('student_id', studentId)
        .eq('school_id', schoolId)
        .order('paid_at', { ascending: false }),
    ])

    const dues: StudentFeeDue[] = (duesRes.data || []).map((d: any) => {
      const fs = Array.isArray(d.fee_structures) ? d.fee_structures[0] : d.fee_structures
      return {
        id: d.id,
        school_id: d.school_id,
        student_id: d.student_id,
        fee_structure_id: d.fee_structure_id,
        installment_name: fs?.installment_name || 'Installment',
        academic_year: fs?.academic_year || '2026-2027',
        due_date: fs?.due_date || new Date().toISOString().split('T')[0],
        amount_due_paise: d.amount_due_paise,
        amount_paid_paise: d.amount_paid_paise,
        late_fee_paise: d.late_fee_paise,
        status: d.status,
      }
    })

    const payments: FeePayment[] = (paymentsRes.data || []).map((p: any) => ({
      ...p,
    }))

    return { dues, payments }
  } catch {
    return { dues: getLocalFeeDues(), payments: getLocalFeePayments() }
  }
}

export function computeFeeSummary(dues: StudentFeeDue[]): {
  totalPaise: number
  paidPaise: number
  duePaise: number
  latePaise: number
} {
  let totalPaise = 0
  let paidPaise = 0
  let duePaise = 0
  let latePaise = 0

  for (const due of dues) {
    totalPaise += due.amount_due_paise
    paidPaise += due.amount_paid_paise
    const lf = computeLateFee(due)
    if (due.status !== 'paid') {
      duePaise += due.amount_due_paise - due.amount_paid_paise
      latePaise += lf
    }
  }

  return { totalPaise, paidPaise, duePaise, latePaise }
}
