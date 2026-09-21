'use client'

import * as React from 'react'
import { Book, Clock, History, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'

// Note: this represents the student's view of their library history.
// It would fetch from the library_transactions table filtering by their ID.

export default function StudentLibraryPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="My Library" 
        subtitle="Currently issued books and transaction history." 
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Active Book Card Mock */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-sm relative overflow-hidden">
          <div className="absolute -right-6 -top-6 text-primary/10">
            <Book className="h-32 w-32" />
          </div>
          <div className="relative z-10">
            <span className="inline-flex px-2 py-0.5 rounded-md bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider mb-3">
              Currently Issued
            </span>
            <h3 className="font-bold text-lg leading-tight">Concepts of Physics - Vol 1</h3>
            <p className="text-sm text-muted-foreground mt-1">H.C. Verma</p>
            
            <div className="mt-6 pt-4 border-t border-primary/10 flex justify-between items-end">
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Due Date</p>
                <p className="text-sm font-semibold mt-0.5 flex items-center gap-1 text-amber-600">
                  <Clock className="h-3.5 w-3.5" /> 25 Oct 2026
                </p>
              </div>
              <p className="text-[10px] font-mono text-muted-foreground">ACC-PHY102</p>
            </div>
          </div>
        </div>
        
        {/* Empty State Card */}
        <div className="rounded-2xl border border-dashed p-6 flex flex-col items-center justify-center text-muted-foreground h-full min-h-[200px]">
          <Book className="h-8 w-8 opacity-20 mb-3" />
          <p className="text-sm font-medium">No other active books</p>
          <p className="text-xs mt-1">You can issue up to 3 books at a time.</p>
        </div>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-bold">Transaction History</h3>
        </div>
        <div className="p-8 text-center text-sm text-muted-foreground">
          Past returns and fine history will appear here.
        </div>
      </div>
    </div>
  )
}
