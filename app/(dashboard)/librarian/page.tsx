'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { ScanBarcode, CheckCircle2, AlertCircle, RefreshCcw, Search, Book, Clock } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'

type ScanResult = {
  success: boolean
  action: 'issue' | 'return' | 'error' | 'need_student'
  book?: any
  transaction?: any
  message: string
}

export default function LibrarianDashboardPage() {
  const [accessionNo, setAccessionNo] = React.useState('')
  const [studentId, setStudentId] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<ScanResult | null>(null)
  
  const scanInputRef = React.useRef<HTMLInputElement>(null)
  const studentInputRef = React.useRef<HTMLInputElement>(null)

  // Focus scan input on load
  React.useEffect(() => {
    scanInputRef.current?.focus()
  }, [])

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accessionNo.trim()) return

    setLoading(true)
    setResult(null)
    
    try {
      const res = await fetch('/api/library/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accession_no: accessionNo,
          student_identifier: studentId || undefined,
          school_id: '11111111-1111-1111-1111-111111111111'
        })
      })
      const data = await res.json()
      
      setResult(data)
      
      if (data.success) {
        if (data.action === 'return' || data.action === 'issue') {
          // Success! Clear inputs for next scan
          setAccessionNo('')
          setStudentId('')
          toast.success(data.message)
          setTimeout(() => scanInputRef.current?.focus(), 100)
        }
      } else {
        if (data.action === 'need_student') {
          // Book found, needs student ID to issue
          studentInputRef.current?.focus()
          toast.info('Enter Student ID to issue book')
        } else {
          toast.error(data.message)
        }
      }
    } catch (err: any) {
      toast.error('Network error during scan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader title="Library Desk" subtitle="Scan books to issue or return." />
      
      {/* SCANNER UI */}
      <div className="rounded-2xl border bg-card shadow-lg overflow-hidden">
        <div className="bg-primary/5 p-6 border-b border-primary/10 flex items-start gap-4">
          <div className="p-3 bg-primary rounded-xl text-primary-foreground shadow-sm">
            <ScanBarcode className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Barcode Scanner</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Focus the field below and use a barcode scanner, or type manually and press Enter.
            </p>
          </div>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleScan} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Accession Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Book className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <input
                    ref={scanInputRef}
                    value={accessionNo}
                    onChange={e => setAccessionNo(e.target.value)}
                    placeholder="e.g. ACC-1001"
                    className="w-full pl-10 pr-4 py-3 border-2 rounded-xl text-lg font-mono focus:border-primary focus:ring-4 ring-primary/20 outline-none transition-all"
                    disabled={loading}
                    autoComplete="off"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Student ID (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <input
                    ref={studentInputRef}
                    value={studentId}
                    onChange={e => setStudentId(e.target.value)}
                    placeholder="Adm No. or Profile ID"
                    className="w-full pl-10 pr-4 py-3 border-2 rounded-xl text-lg font-mono focus:border-primary focus:ring-4 ring-primary/20 outline-none transition-all bg-muted/30"
                    disabled={loading}
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading || !accessionNo}
                className="w-full md:w-auto px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-sm hover:bg-primary/90 hover:shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCcw className="h-5 w-5 animate-spin" /> : <ScanBarcode className="h-5 w-5" />}
                {loading ? 'Processing...' : 'Process Scan'}
              </button>
            </div>
          </form>
        </div>
        
        {/* RESULT AREA */}
        {result && (
          <div className={`p-6 border-t ${
            result.success 
              ? result.action === 'return' ? 'bg-emerald-50 dark:bg-emerald-950/20' : 'bg-blue-50 dark:bg-blue-950/20'
              : 'bg-red-50 dark:bg-red-950/20'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-full mt-1 shrink-0 ${
                result.success ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
              }`}>
                {result.success ? <CheckCircle2 className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-lg font-bold ${result.success ? 'text-foreground' : 'text-red-700 dark:text-red-400'}`}>
                  {result.success ? (result.action === 'return' ? 'Book Returned' : 'Book Issued') : 'Scan Failed'}
                </h3>
                <p className="text-sm mt-1 text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {result.message}
                </p>
                
                {result.book && (
                  <div className="mt-4 p-4 bg-background/50 rounded-xl border grid gap-2 sm:grid-cols-2">
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground font-bold">Book Title</p>
                      <p className="text-sm font-semibold truncate" title={result.book.title}>{result.book.title}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground font-bold">Accession</p>
                      <p className="text-sm font-mono">{result.book.accession_no}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* RECENT TRANSACTIONS PREVIEW (Mock UI for now) */}
      <div className="rounded-2xl border bg-card shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Recent Desk Activity</h3>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" /> Live updating
          </span>
        </div>
        <div className="text-center p-8 text-sm text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
          Connect Supabase Realtime to stream transactions here.
        </div>
      </div>
    </div>
  )
}
