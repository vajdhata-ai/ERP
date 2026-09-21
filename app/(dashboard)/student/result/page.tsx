'use client'

import * as React from 'react'
import { FileText, Download, Award, TrendingUp, Sparkles, BookOpen } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { getLocalExams, getLocalMarks, DEMO_SELF_AWARENESS } from '@/lib/data/exams'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'

export default function StudentResultPage() {
  const allExams = getLocalExams()
  // Only show published exams to students
  const publishedExams = allExams.filter(e => e.is_published)
  
  const [selectedExamId, setSelectedExamId] = React.useState<string>(publishedExams[0]?.id || '')
  const [activeTab, setActiveTab] = React.useState<'progress' | 'subjects' | 'self'>('progress')

  const marks = getLocalMarks(selectedExamId)
  
  // Calculate total percentage for chart
  const totalObtained = marks.reduce((sum, m) => sum + m.marks_obtained, 0)
  const totalMax = marks.reduce((sum, m) => sum + m.max_marks, 0)
  const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : 0

  const chartData = marks.map(m => ({
    name: m.subject_name.substring(0, 3).toUpperCase(),
    full: m.subject_name,
    marks: m.marks_obtained,
    max: m.max_marks,
    percent: (m.marks_obtained / m.max_marks) * 100
  }))

  if (publishedExams.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Results" subtitle="Academic performance & report cards." />
        <div className="h-64 rounded-2xl border border-dashed flex flex-col items-center justify-center text-muted-foreground">
          <Award className="h-12 w-12 opacity-20 mb-4" />
          <p className="font-semibold">No results published yet.</p>
          <p className="text-sm mt-1">Your report cards will appear here once teachers publish them.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Results & Report Cards" 
        subtitle="Track your academic progress and download official report cards." 
      />

      <div className="flex border-b bg-muted/20 rounded-t-2xl px-4 pt-2 gap-4">
        {(['progress', 'subjects', 'self'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 text-sm font-semibold border-b-2 transition-colors capitalize ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
          >
            {tab === 'progress' ? 'Progress Report' : tab === 'subjects' ? 'Subjects Mark' : 'Self Awareness'}
          </button>
        ))}
      </div>

      {activeTab === 'progress' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {publishedExams.map(ex => (
            <div key={ex.id} className="rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl">
                    <FileText className="h-6 w-6" />
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase rounded-md">
                    {ex.academic_year}
                  </span>
                </div>
                <h3 className="text-lg font-bold">{ex.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Published: {new Date(ex.exam_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </p>
              </div>
              <button 
                className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 border-2 border-primary/20 text-primary font-bold rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                onClick={() => alert('PDF generation simulated. In production, opens the Supabase Storage URL.')}
              >
                <Download className="h-4 w-4" /> Download PDF
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'subjects' && (
        <div className="space-y-6">
          <div className="flex gap-2 mb-2 overflow-x-auto no-scrollbar pb-2">
            {publishedExams.map(ex => (
              <button 
                key={ex.id} 
                onClick={() => setSelectedExamId(ex.id)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors border ${selectedExamId === ex.id ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-card text-muted-foreground hover:bg-muted'}`}
              >
                {ex.name}
              </button>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-2xl border bg-card shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="p-4 pl-6 text-left font-medium text-muted-foreground">Subject</th>
                    <th className="p-4 text-right font-medium text-muted-foreground">Marks Obtained</th>
                    <th className="p-4 text-right font-medium text-muted-foreground">Max Marks</th>
                    <th className="p-4 pr-6 text-center font-medium text-muted-foreground w-20">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {marks.map((m, i) => (
                    <tr key={i} className="hover:bg-muted/30">
                      <td className="p-4 pl-6 font-semibold flex items-center gap-3">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        {m.subject_name}
                      </td>
                      <td className="p-4 text-right font-mono font-bold">{m.marks_obtained}</td>
                      <td className="p-4 text-right font-mono text-muted-foreground">{m.max_marks}</td>
                      <td className="p-4 pr-6">
                        <div className="mx-auto w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                          {m.grade}
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-muted/10 font-bold border-t-2">
                    <td className="p-4 pl-6 uppercase text-primary tracking-wide text-xs">Total</td>
                    <td className="p-4 text-right font-mono text-lg">{totalObtained}</td>
                    <td className="p-4 text-right font-mono text-muted-foreground">{totalMax}</td>
                    <td className="p-4 pr-6 text-center font-mono text-primary text-lg">{percentage}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="rounded-2xl border bg-card shadow-sm p-6 flex flex-col">
              <h3 className="font-bold flex items-center gap-2 mb-6">
                <TrendingUp className="h-5 w-5 text-primary" /> Performance Overview
              </h3>
              <div className="flex-1 min-h-[250px] -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} domain={[0, 100]} />
                    <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="percent" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.percent >= 90 ? '#10b981' : entry.percent >= 75 ? '#3b82f6' : entry.percent >= 40 ? '#f59e0b' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'self' && (
        <div className="max-w-2xl rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-r from-indigo-500/10 to-transparent flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-indigo-500" />
            <div>
              <h3 className="font-bold">Co-Scholastic Assessment</h3>
              <p className="text-sm text-muted-foreground mt-1">Qualitative ratings for life skills and behavior.</p>
            </div>
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y">
              {DEMO_SELF_AWARENESS.map((item, i) => (
                <tr key={i} className="hover:bg-muted/30">
                  <td className="p-4 pl-6 font-semibold">{item.trait}</td>
                  <td className="p-4 pr-6 text-right">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold uppercase tracking-wide border border-indigo-100">
                      {item.rating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
