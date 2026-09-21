'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Check, Edit2, FileText, Plus, Save, Share, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { getLocalExams } from '@/lib/data/exams'

// Mock Data for Mark Entry
const MOCK_STUDENTS = [
  { id: 'stu-1', name: 'Aarav Sharma', roll: '101' },
  { id: 'stu-2', name: 'Priya Patel', roll: '102' },
  { id: 'stu-3', name: 'Rohan Singh', roll: '103' },
  { id: 'stu-4', name: 'Ananya Gupta', roll: '104' },
]

export default function TeacherExamsPage() {
  const [exams, setExams] = React.useState(getLocalExams())
  const [selectedExam, setSelectedExam] = React.useState<string>('')
  const [selectedSubject, setSelectedSubject] = React.useState<string>('Mathematics')
  const [maxMarks, setMaxMarks] = React.useState(100)
  
  // local state for marks: Record<studentId, marksObtained>
  const [marks, setMarks] = React.useState<Record<string, string>>({
    'stu-1': '85', 'stu-2': '92', 'stu-3': '78', 'stu-4': '88'
  })
  
  const [isPublishing, setIsPublishing] = React.useState(false)

  const handleMarkChange = (studentId: string, value: string) => {
    // allow typing floats but validate on blur
    setMarks(prev => ({ ...prev, [studentId]: value }))
  }

  const handleMarkBlur = (studentId: string) => {
    let val = parseFloat(marks[studentId])
    if (isNaN(val)) val = 0
    if (val < 0) val = 0
    if (val > maxMarks) val = maxMarks
    
    setMarks(prev => ({ ...prev, [studentId]: val.toString() }))
    // In real app: save to DB on blur here
  }

  const handlePublish = async () => {
    if (!selectedExam) return
    setIsPublishing(true)
    
    // Simulate API delay for PDF generation
    await new Promise(r => setTimeout(r, 1500))
    
    setExams(prev => prev.map(e => e.id === selectedExam ? { ...e, is_published: true } : e))
    toast.success('Results published successfully! Report cards generated.')
    setIsPublishing(false)
  }

  const currentExam = exams.find(e => e.id === selectedExam)

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader 
        title="Exams & Marks Entry" 
        subtitle="Create exams, enter marks spreadsheet-style, and publish report cards."
        action={
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" /> New Exam
          </button>
        }
      />

      <div className="grid gap-6 md:grid-cols-4">
        
        {/* Sidebar: Select Exam */}
        <div className="rounded-2xl border bg-card shadow-sm p-4 h-fit space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wide text-muted-foreground">Select Exam</h3>
          <div className="space-y-2">
            {exams.map(ex => (
              <button
                key={ex.id}
                onClick={() => setSelectedExam(ex.id)}
                className={`w-full text-left p-3 rounded-xl transition-all ${selectedExam === ex.id ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-muted bg-background border'}`}
              >
                <p className="font-semibold text-sm">{ex.name}</p>
                <div className="flex items-center justify-between mt-1 text-xs opacity-80">
                  <span>{ex.academic_year}</span>
                  {ex.is_published && <span className="flex items-center gap-1"><Check className="h-3 w-3" /> Published</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Area: Marks Entry */}
        <div className="md:col-span-3 rounded-2xl border bg-card shadow-sm flex flex-col min-h-[500px]">
          {!selectedExam ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <Edit2 className="h-10 w-10 opacity-30 mb-4" />
              <p>Select an exam from the sidebar to enter marks.</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-4 border-b bg-muted/20 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <select 
                    value={selectedSubject} 
                    onChange={e => setSelectedSubject(e.target.value)}
                    className="px-3 py-2 text-sm border rounded-lg bg-background font-semibold outline-none focus:ring-2 ring-primary/20"
                  >
                    <option>Mathematics</option>
                    <option>Science</option>
                    <option>English</option>
                  </select>
                  
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-muted-foreground">Max Marks:</label>
                    <input 
                      type="number" 
                      value={maxMarks} 
                      onChange={e => setMaxMarks(parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 text-sm border rounded bg-background text-center outline-none focus:ring-2 ring-primary/20"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground flex items-center gap-1 mr-2">
                    <Save className="h-3 w-3" /> Saves automatically
                  </span>
                  
                  {!currentExam?.is_published ? (
                    <button 
                      onClick={handlePublish}
                      disabled={isPublishing}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share className="h-4 w-4" />}
                      {isPublishing ? 'Publishing...' : 'Publish Results'}
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-bold flex items-center gap-1">
                      <Check className="h-4 w-4" /> Published
                    </span>
                  )}
                </div>
              </div>

              {/* Spreadsheet Grid */}
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="p-3 pl-6 font-semibold text-muted-foreground w-16">Roll</th>
                      <th className="p-3 font-semibold text-muted-foreground">Student Name</th>
                      <th className="p-3 font-semibold text-muted-foreground w-40 text-center">Marks Obtained</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {MOCK_STUDENTS.map(stu => (
                      <tr key={stu.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="p-3 pl-6 text-muted-foreground font-mono">{stu.roll}</td>
                        <td className="p-3 font-semibold">{stu.name}</td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={marks[stu.id] || ''}
                            onChange={e => handleMarkChange(stu.id, e.target.value)}
                            onBlur={() => handleMarkBlur(stu.id)}
                            disabled={currentExam?.is_published}
                            className={`w-full px-3 py-2 border rounded-lg text-center font-mono font-bold outline-none transition-all
                              ${currentExam?.is_published 
                                ? 'bg-muted text-muted-foreground border-transparent' 
                                : 'bg-background focus:border-primary focus:ring-2 ring-primary/20 group-hover:border-primary/50'}`}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
