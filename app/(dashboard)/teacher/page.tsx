'use client'

import * as React from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { CalendarWidget } from '@/components/shared/calendar-widget'
import { BookOpen, CheckCircle, Clock, MessageSquare, Plus, Save, Send, Users } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

const TODAY_TIMETABLE = [
  { id: 't1', period: '1st Period', time: '08:00 AM', subject: 'Mathematics', class: '10-A', attendance_done: false },
  { id: 't2', period: '3rd Period', time: '09:40 AM', subject: 'Science', class: '8-B', attendance_done: true },
  { id: 't3', period: '5th Period', time: '11:20 AM', subject: 'Mathematics', class: '9-C', attendance_done: false },
]

const HW_TEMPLATES = [
  "Complete NCERT Exercise 4.1 & 4.2",
  "Revise Chapter 5 for tomorrow's class test",
  "Write an essay on 'Global Warming'",
]

const QUICK_REMARKS = [
  "Great participation today!",
  "Needs to complete pending homework",
  "Distracted during class",
  "Excellent performance in quiz"
]

export default function TeacherDashboard() {
  const [timetable, setTimetable] = React.useState(TODAY_TIMETABLE)
  const [showHWModal, setShowHWModal] = React.useState(false)
  const [showRemarkModal, setShowRemarkModal] = React.useState(false)
  
  // Modals state
  const [selectedClass, setSelectedClass] = React.useState('')
  const [hwText, setHwText] = React.useState('')
  const [remarkText, setRemarkText] = React.useState('')
  const [studentName, setStudentName] = React.useState('')

  const handleQuickAttendance = (id: string, className: string) => {
    // In real app, this would route to /teacher/attendance?class=10-A&date=today
    // For speed tools demo, we'll just mark it done instantly if they tap the quick action
    setTimetable(prev => prev.map(p => p.id === id ? { ...p, attendance_done: true } : p))
    toast.success(`Attendance marked for ${className}`)
  }

  const handlePostHW = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success(`Homework posted to ${selectedClass}`)
    setShowHWModal(false)
    setHwText('')
  }

  const handlePostRemark = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success(`Remark saved for ${studentName}`)
    setShowRemarkModal(false)
    setRemarkText('')
    setStudentName('')
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Today's Schedule"
        subtitle="Speed tools for quick attendance, homework, and remarks."
        action={
          <div className="flex gap-2">
            <button 
              onClick={() => { setSelectedClass('10-A'); setShowHWModal(true) }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-200 transition-colors"
            >
              <BookOpen className="h-4 w-4" /> Quick HW
            </button>
            <button 
              onClick={() => { setStudentName('Aarav Sharma'); setShowRemarkModal(true) }}
              className="flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-700 rounded-lg text-sm font-bold hover:bg-rose-200 transition-colors"
            >
              <MessageSquare className="h-4 w-4" /> Quick Remark
            </button>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Column: Timetable Cards */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground ml-1">Your Periods</h3>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {timetable.map(period => (
              <div key={period.id} className="relative rounded-2xl border bg-card p-5 shadow-sm hover:border-primary/50 transition-colors group flex flex-col justify-between min-h-[160px]">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold bg-muted px-2 py-1 rounded text-muted-foreground">
                      {period.time} • {period.period}
                    </span>
                    <span className="text-sm font-black text-primary bg-primary/10 px-2 py-1 rounded">
                      {period.class}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mt-2">{period.subject}</h3>
                </div>
                
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  {period.attendance_done ? (
                    <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1.5 rounded-lg w-full justify-center">
                      <CheckCircle className="h-4 w-4" /> Attendance Done
                    </span>
                  ) : (
                    <button 
                      onClick={() => handleQuickAttendance(period.id, period.class)}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground font-bold rounded-xl active:scale-95 transition-all shadow-md shadow-primary/20"
                    >
                      <Users className="h-4 w-4" /> 1-Tap Attendance
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Empty slot placeholder to show it's a grid */}
            <div className="rounded-2xl border border-dashed bg-card/50 p-5 flex flex-col items-center justify-center text-muted-foreground min-h-[160px]">
              <Clock className="h-8 w-8 opacity-20 mb-2" />
              <p className="font-semibold text-sm">Free Period</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <CalendarWidget />
        </div>
      </div>

      {/* Quick Homework Modal */}
      {showHWModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-500" /> Post Homework
            </h3>
            <form onSubmit={handlePostHW} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Select Class</label>
                <select 
                  value={selectedClass} 
                  onChange={e => setSelectedClass(e.target.value)}
                  className="w-full p-3 border rounded-xl bg-muted/50 font-semibold"
                >
                  <option>10-A</option>
                  <option>8-B</option>
                  <option>9-C</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-end mb-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Homework Description</label>
                </div>
                <textarea 
                  rows={3} 
                  required
                  value={hwText}
                  onChange={e => setHwText(e.target.value)}
                  className="w-full p-3 border rounded-xl bg-muted/50 resize-none outline-none focus:border-indigo-500"
                  placeholder="Type homework..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Quick Templates</label>
                <div className="flex flex-wrap gap-2">
                  {HW_TEMPLATES.map((t, i) => (
                    <button 
                      key={i} type="button" 
                      onClick={() => setHwText(t)}
                      className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100 rounded-lg text-left hover:bg-indigo-100 active:scale-95 transition-all"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowHWModal(false)} className="flex-1 p-3 font-bold text-muted-foreground bg-muted rounded-xl hover:bg-muted/80">Cancel</button>
                <button type="submit" className="flex-[2] p-3 font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-2">
                  <Send className="h-4 w-4" /> Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Remark Modal */}
      {showRemarkModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-rose-500" /> Add Remark
            </h3>
            <form onSubmit={handlePostRemark} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Student Name</label>
                <input 
                  type="text" 
                  required
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  className="w-full p-3 border rounded-xl bg-muted/50 font-semibold outline-none focus:border-rose-500"
                  placeholder="e.g. Aarav Sharma"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Remark</label>
                <textarea 
                  rows={2} 
                  required
                  value={remarkText}
                  onChange={e => setRemarkText(e.target.value)}
                  className="w-full p-3 border rounded-xl bg-muted/50 resize-none outline-none focus:border-rose-500"
                  placeholder="Type remark..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Common Remarks (1-Tap)</label>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_REMARKS.map((r, i) => (
                    <button 
                      key={i} type="button" 
                      onClick={() => setRemarkText(r)}
                      className="p-2 bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-100 rounded-lg text-left hover:bg-rose-100 active:scale-95 transition-all"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowRemarkModal(false)} className="flex-1 p-3 font-bold text-muted-foreground bg-muted rounded-xl hover:bg-muted/80">Cancel</button>
                <button type="submit" className="flex-[2] p-3 font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 flex items-center justify-center gap-2">
                  <Save className="h-4 w-4" /> Save Remark
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
