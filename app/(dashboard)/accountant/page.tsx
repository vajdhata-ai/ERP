'use client'

import * as React from 'react'
import { Banknote, Wallet, Receipt, ArrowUpRight, TrendingUp, Download } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

export default function AccountantDashboardPage() {
  const chartData = [
    { name: 'Collected', value: 4500000, color: '#10b981' },
    { name: 'Pending', value: 1200000, color: '#f59e0b' },
    { name: 'Overdue', value: 350000, color: '#ef4444' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Accounts Overview" subtitle="Fee collection status, recent transactions, and revenue metrics." />

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <div className="rounded-2xl border bg-card shadow-sm p-5 flex gap-4 items-start">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Total Demand</p>
            <p className="text-xl font-bold mt-0.5">₹60.5L</p>
          </div>
        </div>
        <div className="rounded-2xl border bg-card shadow-sm p-5 flex gap-4 items-start">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
            <Banknote className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Collected</p>
            <p className="text-xl font-bold mt-0.5">₹45.0L</p>
          </div>
        </div>
        <div className="rounded-2xl border bg-card shadow-sm p-5 flex gap-4 items-start">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Pending</p>
            <p className="text-xl font-bold mt-0.5">₹12.0L</p>
          </div>
        </div>
        <div className="rounded-2xl border bg-card shadow-sm p-5 flex gap-4 items-start">
          <div className="p-2.5 rounded-xl bg-red-500/10 text-red-600">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Overdue</p>
            <p className="text-xl font-bold mt-0.5">₹3.5L</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border bg-card shadow-sm p-6 flex flex-col">
          <h3 className="font-bold mb-4">Collection Status</h3>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                  {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(val: number) => `₹${(val/100000).toFixed(1)}L`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2 text-xs">
            {chartData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 rounded-2xl border bg-card shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-bold">Recent Transactions</h3>
            <button className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
              View All <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs">
                <tr>
                  <th className="text-left font-medium text-muted-foreground p-3 pl-5">Date</th>
                  <th className="text-left font-medium text-muted-foreground p-3">Student</th>
                  <th className="text-left font-medium text-muted-foreground p-3">Receipt</th>
                  <th className="text-right font-medium text-muted-foreground p-3">Amount</th>
                  <th className="text-right font-medium text-muted-foreground p-3 pr-5">Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[1,2,3,4,5].map(i => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="p-3 pl-5 text-muted-foreground">Today, 10:4{i} AM</td>
                    <td className="p-3 font-medium">Student Name {i}</td>
                    <td className="p-3 font-mono text-xs">RCPT-100{i}</td>
                    <td className="p-3 text-right font-semibold text-emerald-600">₹18,000</td>
                    <td className="p-3 pr-5 text-right"><span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] uppercase font-bold tracking-wide">Online</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
