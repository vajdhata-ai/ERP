'use client'

import * as React from 'react'
import { Stethoscope, Clock, CheckCircle2, User, FileText, Send } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { getLocalInfirmaryVisits, saveLocalInfirmaryVisits, InfirmaryVisit } from '@/lib/data/infirmary'
import { toast } from 'sonner'
import { format } from 'date-fns'

const STUDENTS = [
  { id: 'stu-1', name: 'Aarav Sharma', class: '10-A' },
  { id: 'stu-2', name: 'Priya Patel', class: '8-B' },
  { id: 'stu-3', name: 'Rohan Singh', class: '12-Sci' },
]

export default function NurseDashboardPage() {
  const [visits, setVisits] = React.useState(getLocalInfirmaryVisits())
  
  const [formData, setFormData] = React.useState({
    studentId: '',
    reason: '',
    medicineGiven: '',
    hasPrescription: false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.studentId || !formData.reason) {
      toast.error('Student and Reason are required')
      return
    }

    const newVisit: InfirmaryVisit = {
      id: crypto.randomUUID(),
      visit_date: new Date().toISOString(),
      departure_date: new Date(Date.now() + 30 * 60000).toISOString(), // Mock departure in 30 mins
      reason: formData.reason,
      medicine_given: formData.medicineGiven || null,
      prescription_url: formData.hasPrescription ? 'https://example.com/mock-prescription.pdf' : null,
      checked_by_name: 'Nurse Anita' // Mock logged-in staff
    }

    const updated = [newVisit, ...visits]
    setVisits(updated)
    saveLocalInfirmaryVisits(updated)
    
    // Simulate notification creation per specs
    toast.success('Visit logged. Notification sent to parents.')
    
    setFormData({
      studentId: '',
      reason: '',
      medicineGiven: '',
      hasPrescription: false
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Infirmary" 
        subtitle="Log student health visits and automatically notify parents." 
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Log Visit Form */}
        <div className="lg:col-span-1 rounded-2xl border bg-card shadow-sm p-6 h-fit">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl">
              <Stethoscope className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg">Log New Visit</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Student *</label>
              <select 
                required
                value={formData.studentId}
                onChange={e => setFormData(p => ({...p, studentId: e.target.value}))}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:ring-2 ring-rose-500/20 outline-none font-medium"
              >
                <option value="">Select Student...</option>
                {STUDENTS.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.class})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Reason / Symptoms *</label>
              <textarea 
                required
                rows={2}
                value={formData.reason}
                onChange={e => setFormData(p => ({...p, reason: e.target.value}))}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:ring-2 ring-rose-500/20 outline-none resize-none"
                placeholder="e.g. Headache, scraped knee..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Medicine Given</label>
              <input 
                value={formData.medicineGiven}
                onChange={e => setFormData(p => ({...p, medicineGiven: e.target.value}))}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:ring-2 ring-rose-500/20 outline-none"
                placeholder="e.g. Paracetamol 500mg"
              />
            </div>
            
            <div className="flex items-center gap-2 pt-1">
              <input 
                type="checkbox" 
                id="rx"
                checked={formData.hasPrescription}
                onChange={e => setFormData(p => ({...p, hasPrescription: e.target.checked}))}
                className="rounded border-gray-300 text-rose-600 focus:ring-rose-600"
              />
              <label htmlFor="rx" className="text-sm font-medium">Attach Prescription File (Mock)</label>
            </div>

            <button type="submit" className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-bold shadow-md shadow-rose-600/20 transition-colors flex items-center justify-center gap-2 mt-4">
              <Send className="h-4 w-4" /> Save & Notify Parents
            </button>
          </form>
        </div>

        {/* Recent Logs Table */}
        <div className="lg:col-span-2 rounded-2xl border bg-card shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
            <h3 className="font-bold text-sm uppercase tracking-wide text-muted-foreground">Recent Visits</h3>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-muted/40">
                <tr>
                  <th className="p-4 pl-6 font-semibold text-muted-foreground">Date / Time</th>
                  <th className="p-4 font-semibold text-muted-foreground">Student</th>
                  <th className="p-4 font-semibold text-muted-foreground">Reason</th>
                  <th className="p-4 font-semibold text-muted-foreground">Medicine</th>
                  <th className="p-4 font-semibold text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {visits.map((visit) => (
                  <tr key={visit.id} className="hover:bg-muted/30">
                    <td className="p-4 pl-6">
                      <div className="font-semibold">{format(new Date(visit.visit_date), 'dd MMM yyyy')}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" /> {format(new Date(visit.visit_date), 'h:mm a')}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {/* Mocking student name since we didn't save ID in demo data for this table specifically */}
                        Student {visit.id.substring(4,6)}
                      </div>
                    </td>
                    <td className="p-4 max-w-[200px] truncate" title={visit.reason}>
                      {visit.reason}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {visit.medicine_given || '-'}
                    </td>
                    <td className="p-4">
                      {visit.departure_date ? (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold uppercase rounded-md flex items-center gap-1 w-fit">
                          <CheckCircle2 className="h-3 w-3" /> Discharged
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold uppercase rounded-md">
                          In Infirmary
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {visits.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No visits recorded yet.
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
