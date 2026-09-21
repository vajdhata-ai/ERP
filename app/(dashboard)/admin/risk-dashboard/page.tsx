'use client'

import * as React from 'react'
import { AlertTriangle, Download, MessageCircle, TrendingDown, TrendingUp, IndianRupee, BookX } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { getLocalFeeRisks, getLocalAttendanceRisks } from '@/lib/data/risk'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function AdminRiskDashboardPage() {
  const [feeRisks, setFeeRisks] = React.useState(getLocalFeeRisks())
  
  const [attendanceThreshold, setAttendanceThreshold] = React.useState(75)
  const attendanceRisks = React.useMemo(() => getLocalAttendanceRisks(attendanceThreshold), [attendanceThreshold])

  const [classFilter, setClassFilter] = React.useState('All')
  
  const filteredFees = classFilter === 'All' ? feeRisks : feeRisks.filter(f => f.class === classFilter)
  const filteredAttendance = classFilter === 'All' ? attendanceRisks : attendanceRisks.filter(a => a.class === classFilter)

  const handleSendReminder = async (studentName: string) => {
    toast.loading(`Sending WhatsApp reminder to ${studentName}'s parents...`)
    await new Promise(r => setTimeout(r, 1000))
    toast.dismiss()
    toast.success('Reminder sent successfully.')
  }

  const handleDownloadCSV = () => {
    toast.success('Downloading CSV for offline meeting...')
    // Real implementation would trigger standard blob download
  }

  // Summary stats
  const totalCollected = 1450000
  const targetFee = 2000000
  const totalAtRisk = feeRisks.length + attendanceRisks.length
  const overdueLibraryHooks = 12

  return (
    <div className="space-y-6 max-w-7xl">
      <PageHeader 
        title="Admin Risk Dashboard" 
        subtitle="Proactive warnings for fee defaults and attendance drops."
        action={
          <div className="flex items-center gap-3">
            <select 
              value={classFilter} 
              onChange={e => setClassFilter(e.target.value)}
              className="px-3 py-2 text-sm border rounded-lg bg-background font-semibold outline-none focus:ring-1 ring-primary"
            >
              <option value="All">All Classes</option>
              <option value="10-A">10-A</option>
              <option value="8-B">8-B</option>
              <option value="12-Sci">12-Sci</option>
            </select>
            <button onClick={handleDownloadCSV} className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-semibold hover:bg-secondary/80">
              <Download className="h-4 w-4" /> Download CSV
            </button>
          </div>
        }
      />

      {/* Top Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border bg-card p-4 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <IndianRupee className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Fee Collection</p>
            <p className="text-lg font-black font-mono mt-0.5 text-foreground">
              ₹{(totalCollected/100000).toFixed(2)}L <span className="text-xs text-muted-foreground font-sans">/ ₹{(targetFee/100000).toFixed(2)}L</span>
            </p>
            <div className="w-full bg-muted rounded-full h-1.5 mt-2">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(totalCollected/targetFee)*100}%` }}></div>
            </div>
          </div>
        </div>
        
        <div className="rounded-2xl border bg-card p-4 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Total At-Risk</p>
            <p className="text-xl font-black mt-0.5 text-foreground">{totalAtRisk} Students</p>
            <p className="text-xs text-rose-600 font-semibold mt-1">Requires immediate attention</p>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <BookX className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Library Overdue</p>
            <p className="text-xl font-black mt-0.5 text-foreground">{overdueLibraryHooks} Books</p>
            <p className="text-xs text-muted-foreground mt-1">Total pending returns</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Fee Default Risk Panel */}
        <div className="rounded-2xl border bg-card shadow-sm flex flex-col min-h-[400px]">
          <div className="p-4 border-b bg-rose-50/50 flex justify-between items-center">
            <h3 className="font-bold text-rose-700 flex items-center gap-2">
              <IndianRupee className="h-5 w-5" /> Fee Default Risk
            </h3>
            <span className="text-xs font-semibold text-rose-600 bg-rose-100 px-2.5 py-1 rounded-md">
              Overdue or Due &lt; 7 days
            </span>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Student</th>
                  <th className="px-4 py-3 font-semibold text-right">Amount Due</th>
                  <th className="px-4 py-3 font-semibold text-center">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredFees.map(s => (
                  <tr key={s.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <p className="font-bold">{s.student_name}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">{s.class}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-rose-600">
                      ₹{(s.amount_due / 100).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {s.days_overdue > 0 ? (
                        <div className="text-rose-700 font-bold text-xs bg-rose-50 border border-rose-200 rounded px-2 py-1 mx-auto w-max">
                          {s.days_overdue} days overdue
                        </div>
                      ) : (
                        <div className="text-amber-700 font-bold text-xs bg-amber-50 border border-amber-200 rounded px-2 py-1 mx-auto w-max">
                          Due in {Math.abs(s.days_overdue)} days
                        </div>
                      )}
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {format(new Date(s.due_date), 'dd MMM yyyy')}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => handleSendReminder(s.student_name)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 transition-colors rounded-lg text-xs font-bold border border-[#25D366]/20 shadow-sm"
                      >
                        <MessageCircle className="h-3.5 w-3.5" /> Reminder
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredFees.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                      No students at risk for fee default.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attendance Risk Panel */}
        <div className="rounded-2xl border bg-card shadow-sm flex flex-col min-h-[400px]">
          <div className="p-4 border-b bg-amber-50/50 flex justify-between items-center flex-wrap gap-2">
            <h3 className="font-bold text-amber-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Attendance Risk
            </h3>
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="text-muted-foreground text-xs">Threshold:</span>
              <input 
                type="number" 
                value={attendanceThreshold} 
                onChange={e => setAttendanceThreshold(parseInt(e.target.value) || 0)}
                className="w-16 px-2 py-1 border rounded bg-background text-center outline-none focus:ring-1 ring-amber-500 font-mono text-amber-700" 
              />
              <span className="text-muted-foreground text-xs">%</span>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Student</th>
                  <th className="px-4 py-3 font-semibold text-center">30-Day Avg</th>
                  <th className="px-4 py-3 font-semibold text-center">Trend (Prev 30 days)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredAttendance.map(s => (
                  <tr key={s.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <p className="font-bold">{s.student_name}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">{s.class}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-lg font-black font-mono text-rose-600">{s.current_percentage}%</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-3">
                        <span className="font-mono text-muted-foreground">{s.previous_percentage}%</span>
                        {s.trend === 'declining' ? (
                          <div className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-1 rounded text-xs font-bold border border-rose-100">
                            <TrendingDown className="h-3 w-3" /> Drop
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-bold border border-emerald-100">
                            <TrendingUp className="h-3 w-3" /> Up
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAttendance.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-muted-foreground">
                      No students below {attendanceThreshold}% attendance.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
