'use client'

import * as React from 'react'
import { Plus, Send, FileText, BarChart2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'

// Note: In a real app, this would use the same UI patterns as the Student Communication page,
// but with forms to *create* circulars, respond to feedback, and add remarks.
// For the sake of this stage, providing a functional stub.

export default function TeacherCommunicationPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Communication & Feedback" 
        subtitle="Publish circulars, respond to parents, and give student remarks." 
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Quick Actions */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center text-center gap-3">
          <div className="p-4 rounded-full bg-primary/10 text-primary">
            <Plus className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold">New Circular</h3>
            <p className="text-xs text-muted-foreground mt-1">Publish an announcement or news update</p>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center text-center gap-3">
          <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-600">
            <Send className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold">Student Remark</h3>
            <p className="text-xs text-muted-foreground mt-1">Add a behavioral or academic remark</p>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center text-center gap-3">
          <div className="p-4 rounded-full bg-amber-500/10 text-amber-600">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold">Parent Feedback</h3>
            <p className="text-xs text-muted-foreground mt-1">View and respond to queries</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm p-12 flex flex-col items-center justify-center text-muted-foreground bg-muted/10 border-dashed">
        <BarChart2 className="h-10 w-10 opacity-30 mb-3" />
        <h3 className="font-bold text-foreground">Communication Hub</h3>
        <p className="text-sm mt-1 max-w-md text-center">
          Full teacher interfaces for authoring circulars and replying to feedback are part of the extended roadmap. The student-facing views are fully functional.
        </p>
      </div>
    </div>
  )
}
