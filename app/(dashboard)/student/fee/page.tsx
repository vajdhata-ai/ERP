'use client'

import * as React from 'react'
import { toast } from 'sonner'
import {
  CreditCard, CheckCircle2, AlertCircle, Clock, Download,
  TrendingUp, Receipt, Banknote, AlertTriangle,
} from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import {
  StudentFeeDue, FeePayment,
  getLocalFeeDues, saveLocalFeeDues, getLocalFeePayments, saveLocalFeePayments,
  computeLateFee, formatRupees, paiseToRupees, computeFeeSummary,
} from '@/lib/data/fees'
import { PageHeader } from '@/components/shared/page-header'
import { format } from 'date-fns'

declare global {
  interface Window { Razorpay: any }
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, icon: Icon, colorClass, subtext,
}: {
  label: string; value: string; icon: React.ElementType; colorClass: string; subtext?: string
}) {
  return (
    <div className={`rounded-2xl border p-5 bg-card shadow-sm flex gap-4 items-start`}>
      <div className={`p-2.5 rounded-xl ${colorClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
        {subtext && <p className="text-xs text-muted-foreground mt-0.5">{subtext}</p>}
      </div>
    </div>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: 'paid' | 'overdue' | 'pending' }) {
  const map = {
    paid:    { cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', label: 'Paid', Icon: CheckCircle2 },
    overdue: { cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300', label: 'Overdue', Icon: AlertCircle },
    pending: { cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', label: 'Pending', Icon: Clock },
  }
  const { cls, label, Icon } = map[status] || map.pending
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      <Icon className="h-3 w-3" /> {label}
    </span>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FeePage() {
  const [dues, setDues] = React.useState<StudentFeeDue[]>([])
  const [payments, setPayments] = React.useState<FeePayment[]>([])
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [paying, setPaying] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [activeTab, setActiveTab] = React.useState<'dues' | 'history'>('dues')

  // ── Load data ───────────────────────────────────────────────────────────────
  React.useEffect(() => {
    const rawDues = getLocalFeeDues()
    // Recompute late fees on load
    const updated = rawDues.map(d => ({
      ...d,
      late_fee_paise: computeLateFee(d),
      status: (() => {
        if (d.status === 'paid') return 'paid'
        const today = new Date(); today.setHours(0, 0, 0, 0)
        const due = new Date(d.due_date + 'T23:59:59')
        if (due < today) return 'overdue'
        return 'pending'
      })() as 'paid' | 'overdue' | 'pending',
    }))
    setDues(updated)
    setPayments(getLocalFeePayments())
    setLoading(false)
  }, [])

  const summary = React.useMemo(() => computeFeeSummary(dues), [dues])

  // Donut chart data
  const chartData = [
    { name: 'Paid', value: summary.paidPaise / 100, color: '#10b981' },
    { name: 'Pending', value: (summary.duePaise - summary.latePaise) / 100, color: '#f59e0b' },
    { name: 'Late Fee', value: summary.latePaise / 100, color: '#ef4444' },
  ].filter(d => d.value > 0)

  // Selected unpaid dues
  const selectedDues = dues.filter(d => selectedIds.has(d.id) && d.status !== 'paid')
  const selectedTotalPaise = selectedDues.reduce((acc, d) => {
    const remaining = d.amount_due_paise - d.amount_paid_paise
    return acc + remaining + computeLateFee(d)
  }, 0)

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // ── Razorpay Payment ─────────────────────────────────────────────────────────
  const handlePayNow = async () => {
    if (selectedDues.length === 0) { toast.warning('Please select at least one unpaid installment.'); return }
    setPaying(true)

    try {
      // 1. Create order
      const orderRes = await fetch('/api/fees/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          due_ids: selectedDues.map(d => d.id),
          student_id: '44444444-4444-4444-4444-444444444441',
          school_id: '11111111-1111-1111-1111-111111111111',
        }),
      })
      const orderData = await orderRes.json()

      if (!orderRes.ok) { toast.error(orderData.error || 'Failed to create order'); setPaying(false); return }

      // Demo mode
      if (orderData.demo) {
        toast.info('Demo mode: Simulating successful payment...')
        await new Promise(r => setTimeout(r, 1200))
        markPaidLocally()
        toast.success('Payment successful! (Demo)')
        setPaying(false)
        return
      }

      // 2. Load Razorpay SDK if needed
      if (!window.Razorpay) {
        await new Promise<void>((res, rej) => {
          const s = document.createElement('script')
          s.src = 'https://checkout.razorpay.com/v1/checkout.js'
          s.onload = () => res()
          s.onerror = () => rej(new Error('Failed to load Razorpay'))
          document.head.appendChild(s)
        })
      }

      // 3. Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: orderData.key_id,
        amount: orderData.amount_paise,
        currency: 'INR',
        name: 'Vajdhata School ERP',
        description: selectedDues.map(d => d.installment_name).join(', '),
        order_id: orderData.order_id,
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/fees/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...response,
                due_ids: selectedDues.map(d => d.id),
                student_id: '44444444-4444-4444-4444-444444444441',
                school_id: '11111111-1111-1111-1111-111111111111',
                amount_paise: selectedTotalPaise,
              }),
            })
            const verifyData = await verifyRes.json()
            if (verifyData.success) {
              markPaidLocally()
              toast.success('Payment verified! Fee marked as paid.')
            } else {
              toast.error('Payment verification failed. Please contact admin.')
            }
          } catch {
            toast.error('Verification error. Please contact support.')
          }
          setPaying(false)
        },
        modal: { ondismiss: () => setPaying(false) },
        theme: { color: '#4f46e5' },
      })
      rzp.open()
    } catch (err: any) {
      toast.error(err?.message || 'Payment failed')
      setPaying(false)
    }
  }

  function markPaidLocally() {
    const now = new Date().toISOString()
    const receiptNo = `RCPT-DEMO-${Date.now()}`
    setDues(prev => {
      const updated = prev.map(d =>
        selectedIds.has(d.id)
          ? { ...d, status: 'paid' as const, amount_paid_paise: d.amount_due_paise, late_fee_paise: 0 }
          : d
      )
      saveLocalFeeDues(updated)
      return updated
    })
    const newPayments: FeePayment[] = selectedDues.map(d => ({
      id: crypto.randomUUID(),
      school_id: '11111111-1111-1111-1111-111111111111',
      student_id: '44444444-4444-4444-4444-444444444441',
      student_fee_due_id: d.id,
      amount_paise: d.amount_due_paise + computeLateFee(d),
      razorpay_order_id: `order_demo_${Date.now()}`,
      razorpay_payment_id: `pay_demo_${Date.now()}`,
      status: 'captured',
      paid_at: now,
      receipt_no: receiptNo,
      payment_mode: 'online',
      installment_name: d.installment_name,
    }))
    setPayments(prev => {
      const updated = [...newPayments, ...prev]
      saveLocalFeePayments(updated)
      return updated
    })
    setSelectedIds(new Set())
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Fee" subtitle="Loading your fee information..." />
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee"
        subtitle={`Academic Year ${dues[0]?.academic_year || '2026-2027'} · All amounts in Indian Rupees`}
      />

      {/* ── KPI Cards ── */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <KpiCard label="Total Fee" value={formatRupees(summary.totalPaise)} icon={Banknote}
          colorClass="bg-primary/10 text-primary" subtext="Annual" />
        <KpiCard label="Paid" value={formatRupees(summary.paidPaise)} icon={CheckCircle2}
          colorClass="bg-emerald-500/10 text-emerald-600" subtext="Cleared" />
        <KpiCard label="Due" value={formatRupees(summary.duePaise)} icon={Clock}
          colorClass="bg-amber-500/10 text-amber-600" subtext="Pending" />
        <KpiCard label="Late Fee" value={formatRupees(summary.latePaise)} icon={AlertTriangle}
          colorClass="bg-red-500/10 text-red-600" subtext="Accumulated" />
      </div>

      {/* ── Chart + Summary ── */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Fee Breakdown</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                  paddingAngle={3} dataKey="value" stroke="none">
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
              All fees paid ✓
            </div>
          )}
        </div>

        {/* Pay Now Panel */}
        <div className="rounded-2xl border bg-card p-5 shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Quick Pay</h3>
          {dues.filter(d => d.status !== 'paid').length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
              <p className="text-sm font-semibold">All fees paid! No pending dues.</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">Select installments below to pay now.</p>
              <div className="flex-1 space-y-2">
                {dues.filter(d => d.status !== 'paid').map(d => {
                  const late = computeLateFee(d)
                  const total = d.amount_due_paise - d.amount_paid_paise + late
                  return (
                    <label key={d.id}
                      className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-colors
                        ${selectedIds.has(d.id) ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'}`}>
                      <input type="checkbox" className="h-4 w-4 accent-primary"
                        checked={selectedIds.has(d.id)}
                        onChange={() => toggleSelect(d.id)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{d.installment_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Due: {format(new Date(d.due_date), 'd MMM yyyy')}
                          {late > 0 && <span className="text-red-500 ml-1">(+₹{late/100} late)</span>}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-primary shrink-0">{formatRupees(total)}</p>
                    </label>
                  )
                })}
              </div>
              <div className="pt-2 border-t flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Selected Total</p>
                  <p className="text-xl font-bold text-primary">{formatRupees(selectedTotalPaise)}</p>
                </div>
                <button
                  onClick={handlePayNow}
                  disabled={paying || selectedDues.length === 0}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold
                    hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  <CreditCard className="h-4 w-4" />
                  {paying ? 'Processing…' : 'Pay Now'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Tabs: All Dues | Payment History ── */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="flex border-b">
          {(['dues', 'history'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-semibold transition-colors
                ${activeTab === tab ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'}`}>
              {tab === 'dues' ? 'All Installments' : 'Payment History'}
            </button>
          ))}
        </div>

        {/* All Installments */}
        {activeTab === 'dues' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left p-3 font-medium text-muted-foreground pl-5">Installment</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Due Date</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Amount</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Late Fee</th>
                  <th className="text-right p-3 font-medium text-muted-foreground pr-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {dues.map((d, i) => (
                  <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 pl-5 font-medium">{d.installment_name}</td>
                    <td className="p-3 text-muted-foreground">{format(new Date(d.due_date), 'd MMM yyyy')}</td>
                    <td className="p-3 text-right font-mono">{formatRupees(d.amount_due_paise)}</td>
                    <td className="p-3 text-right font-mono text-red-600">
                      {computeLateFee(d) > 0 ? formatRupees(computeLateFee(d)) : '—'}
                    </td>
                    <td className="p-3 text-right pr-5">
                      <StatusBadge status={d.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Payment History */}
        {activeTab === 'history' && (
          <div className="overflow-x-auto">
            {payments.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">No payment history yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left p-3 pl-5 font-medium text-muted-foreground">Receipt No</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Installment</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Amount</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Mode</th>
                    <th className="text-right p-3 pr-5 font-medium text-muted-foreground">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {payments.map(p => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 pl-5 font-mono text-xs">{p.receipt_no}</td>
                      <td className="p-3 text-muted-foreground">{p.installment_name || 'Fee Payment'}</td>
                      <td className="p-3 text-muted-foreground">{format(new Date(p.paid_at), 'd MMM yyyy')}</td>
                      <td className="p-3 text-right font-mono font-semibold text-emerald-600">{formatRupees(p.amount_paise)}</td>
                      <td className="p-3 text-right">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs capitalize">
                          {p.payment_mode}
                        </span>
                      </td>
                      <td className="p-3 pr-5 text-right">
                        <button
                          onClick={() => toast.info(`Receipt ${p.receipt_no} — PDF generation requires backend setup.`)}
                          className="inline-flex items-center gap-1 text-primary hover:underline text-xs"
                        >
                          <Download className="h-3 w-3" /> PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
