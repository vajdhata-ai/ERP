'use client'

import * as React from 'react'
import { toast } from 'sonner'
import {
  Send, Loader2, MessageSquare, Bell, ThumbsUp, Users, Calendar,
  Star, ChevronRight, Filter, Search, Check, AlertCircle, BadgeCheck
} from 'lucide-react'
import {
  Circular, FeedbackItem, Achievement, PTMSchedule, Remark, NotificationHistoryItem,
  getLocalCirculars, saveLocalCirculars, getLocalFeedback, saveLocalFeedback,
  SEED_ACHIEVEMENTS, SEED_PTM, SEED_REMARKS, getCircularCategoryTheme
} from '@/lib/data/communication'
import { PageHeader } from '@/components/shared/page-header'
import { format, formatDistanceToNow } from 'date-fns'

type TabId = 'circular' | 'mailbox' | 'notifications' | 'feedback' | 'achievement' | 'ptm' | 'remarks'

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'circular',      label: 'Circular/News',       icon: Bell },
  { id: 'mailbox',       label: 'Mail Box',             icon: MessageSquare },
  { id: 'notifications', label: 'Notification History', icon: Bell },
  { id: 'feedback',      label: 'Feedback',             icon: ThumbsUp },
  { id: 'achievement',   label: 'Achievement',          icon: Star },
  { id: 'ptm',           label: 'PTM',                  icon: Users },
  { id: 'remarks',       label: 'Remarks',              icon: AlertCircle },
]

// ─── Circular Detail Pane ─────────────────────────────────────────────────────
function CircularDetail({ circular }: { circular: Circular | null }) {
  if (!circular) return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground p-8">
      <Bell className="h-10 w-10 opacity-30" />
      <p className="text-sm">Select a circular to read</p>
    </div>
  )
  const { bg, text, border } = getCircularCategoryTheme(circular.category)
  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-5">
      <div className="flex items-start gap-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bg} ${text} ${border}`}>
          {circular.category}
        </span>
        {circular.send_whatsapp && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800">
            📱 WhatsApp Sent
          </span>
        )}
      </div>
      <div>
        <h2 className="text-lg font-bold text-foreground leading-snug">{circular.title}</h2>
        <p className="text-xs text-muted-foreground mt-1.5">
          By {circular.created_by_name || 'School Admin'} ·{' '}
          {circular.target_class_name || 'All Classes'} ·{' '}
          {format(new Date(circular.created_at), 'd MMM yyyy, hh:mm a')}
        </p>
      </div>
      <hr className="border-border" />
      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{circular.description}</p>
    </div>
  )
}

// ─── Remark Sentiment ─────────────────────────────────────────────────────────
function RemarkBadge({ type }: { type: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    positive: { cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', label: '👍 Positive' },
    neutral:  { cls: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',            label: '📝 Neutral' },
    negative: { cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',                 label: '⚠️ Concern' },
  }
  const { cls, label } = map[type] || map.neutral
  return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{label}</span>
}

export default function StudentCommunicationPage() {
  const [activeTab, setActiveTab] = React.useState<TabId>('circular')
  const [circulars, setCirculars] = React.useState<Circular[]>([])
  const [feedbackItems, setFeedbackItems] = React.useState<FeedbackItem[]>([])
  const [selectedCircularId, setSelectedCircularId] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [filterCategory, setFilterCategory] = React.useState('ALL')
  const [loading, setLoading] = React.useState(true)

  // Feedback form
  const [fbSubject, setFbSubject] = React.useState('')
  const [fbMessage, setFbMessage] = React.useState('')
  const [fbCategory, setFbCategory] = React.useState<FeedbackItem['category']>('General')
  const [fbSubmitting, setFbSubmitting] = React.useState(false)

  React.useEffect(() => {
    const loaded = getLocalCirculars()
    setCirculars(loaded)
    if (loaded.length > 0) setSelectedCircularId(loaded[0].id)
    setFeedbackItems(getLocalFeedback())
    setLoading(false)
  }, [])

  // Mark circular as read when selected
  const handleSelectCircular = (id: string) => {
    setSelectedCircularId(id)
    setCirculars(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, is_read: true } : c)
      saveLocalCirculars(updated)
      return updated
    })
  }

  const selectedCircular = circulars.find(c => c.id === selectedCircularId) || null

  const filteredCirculars = circulars.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'ALL' || c.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const unreadCount = circulars.filter(c => !c.is_read).length

  // Submit feedback
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fbSubject.trim() || !fbMessage.trim()) { toast.warning('Please fill in all fields.'); return }
    setFbSubmitting(true)
    await new Promise(r => setTimeout(r, 800))
    const newFb: FeedbackItem = {
      id: crypto.randomUUID(),
      school_id: '11111111-1111-1111-1111-111111111111',
      profile_id: 'f1111111-ffff-ffff-ffff-ffffffffffff',
      subject: fbSubject,
      message: fbMessage,
      category: fbCategory,
      status: 'open',
      admin_reply: null,
      created_at: new Date().toISOString(),
    }
    setFeedbackItems(prev => {
      const updated = [newFb, ...prev]
      saveLocalFeedback(updated)
      return updated
    })
    setFbSubject(''); setFbMessage('')
    toast.success('Feedback submitted successfully!')
    setFbSubmitting(false)
  }

  const demoNotifications: NotificationHistoryItem[] = [
    { id: '1', school_id: '', profile_id: '', title: '📢 Annual Sports Day', body: 'All students report to ground by 7:30 AM on Oct 15th.', type: 'circular', is_read: false, created_at: new Date(Date.now() - 2*86400000).toISOString() },
    { id: '2', school_id: '', profile_id: '', title: '📚 Homework Posted', body: 'New Physics homework posted: Electromagnetic Induction. Due in 3 days.', type: 'homework', is_read: true, created_at: new Date(Date.now() - 4*86400000).toISOString() },
    { id: '3', school_id: '', profile_id: '', title: '💰 Fee Payment Reminder', body: 'Term 2 fee of ₹18,000 is overdue. Please clear immediately.', type: 'fee', is_read: true, created_at: new Date(Date.now() - 5*86400000).toISOString() },
  ]

  if (loading) return (
    <div className="space-y-6">
      <PageHeader title="Communication" subtitle="Loading…" />
      <div className="h-64 rounded-2xl bg-muted animate-pulse" />
    </div>
  )

  return (
    <div className="space-y-5">
      <PageHeader title="Communication" subtitle="Circulars, messages, feedback, and school updates." />

      {/* Tab Bar */}
      <div className="flex gap-0.5 bg-muted rounded-xl p-1 overflow-x-auto no-scrollbar">
        {TABS.map(tab => {
          const isActive = activeTab === tab.id
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all
                ${isActive ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
              {tab.id === 'circular' && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Circular/News Tab ── */}
      {activeTab === 'circular' && (
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden flex" style={{ minHeight: 480 }}>
          {/* Left: List */}
          <div className="w-72 shrink-0 border-r flex flex-col">
            <div className="p-3 border-b space-y-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search…"
                  className="w-full pl-8 pr-3 py-2 text-xs border rounded-lg bg-background focus:ring-1 ring-primary outline-none" />
              </div>
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                className="w-full px-2.5 py-2 text-xs border rounded-lg bg-background focus:ring-1 ring-primary outline-none">
                <option value="ALL">All Categories</option>
                {['General', 'Urgent', 'Event', 'Holiday', 'Exam'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 overflow-y-auto divide-y">
              {filteredCirculars.length === 0 && (
                <div className="p-6 text-center text-xs text-muted-foreground">No circulars found.</div>
              )}
              {filteredCirculars.map(c => {
                const { text, bg } = getCircularCategoryTheme(c.category)
                return (
                  <button key={c.id} onClick={() => handleSelectCircular(c.id)}
                    className={`w-full text-left p-3 transition-colors hover:bg-accent
                      ${selectedCircularId === c.id ? 'bg-primary/5 border-l-2 border-primary' : ''}`}>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wide ${text}`}>{c.category}</span>
                      {!c.is_read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                    </div>
                    <p className={`text-xs font-semibold leading-tight ${!c.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {c.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>
          {/* Right: Detail */}
          <CircularDetail circular={selectedCircular} />
        </div>
      )}

      {/* ── Notification History Tab ── */}
      {activeTab === 'notifications' && (
        <div className="rounded-2xl border bg-card shadow-sm divide-y overflow-hidden">
          {demoNotifications.map(n => (
            <div key={n.id} className={`flex gap-3 p-4 items-start transition-colors hover:bg-accent/40
              ${!n.is_read ? 'bg-primary/5' : ''}`}>
              <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${!n.is_read ? 'bg-primary' : 'bg-muted'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })} · {n.type}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Mail Box Tab ── */}
      {activeTab === 'mailbox' && (
        <div className="rounded-2xl border bg-card shadow-sm p-8 flex flex-col items-center justify-center gap-3 text-muted-foreground" style={{ minHeight: 320 }}>
          <MessageSquare className="h-10 w-10 opacity-30" />
          <p className="text-sm font-medium">Direct messages from teachers will appear here.</p>
          <p className="text-xs">No messages yet.</p>
        </div>
      )}

      {/* ── Feedback Tab ── */}
      {activeTab === 'feedback' && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Submit form */}
          <div className="rounded-2xl border bg-card shadow-sm p-5">
            <h3 className="text-sm font-semibold mb-4">Submit Feedback / Query</h3>
            <form onSubmit={handleSubmitFeedback} className="space-y-3">
              <select value={fbCategory} onChange={e => setFbCategory(e.target.value as FeedbackItem['category'])}
                className="w-full px-3 py-2 text-sm border rounded-xl bg-background focus:ring-1 ring-primary outline-none">
                {['General', 'Complaint', 'Suggestion', 'Query'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input value={fbSubject} onChange={e => setFbSubject(e.target.value)}
                placeholder="Subject"
                className="w-full px-3 py-2 text-sm border rounded-xl bg-background focus:ring-1 ring-primary outline-none" />
              <textarea value={fbMessage} onChange={e => setFbMessage(e.target.value)}
                placeholder="Describe your feedback or query in detail…"
                rows={5}
                className="w-full px-3 py-2 text-sm border rounded-xl bg-background focus:ring-1 ring-primary outline-none resize-none" />
              <button type="submit" disabled={fbSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all w-full justify-center">
                {fbSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {fbSubmitting ? 'Submitting…' : 'Submit Feedback'}
              </button>
            </form>
          </div>
          {/* Previous feedback */}
          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-sm font-semibold">Previous Submissions</h3>
            </div>
            <div className="divide-y">
              {feedbackItems.length === 0 && (
                <div className="p-6 text-center text-xs text-muted-foreground">No submissions yet.</div>
              )}
              {feedbackItems.map(fb => (
                <div key={fb.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold">{fb.subject}</p>
                    <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full
                      ${fb.status === 'resolved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : fb.status === 'in_review' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
                      {fb.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{fb.message}</p>
                  {fb.admin_reply && (
                    <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-wide mb-1">Admin Reply</p>
                      <p className="text-xs">{fb.admin_reply}</p>
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(fb.created_at), { addSuffix: true })} · {fb.category}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Achievement Tab ── */}
      {activeTab === 'achievement' && (
        <div className="grid gap-4 sm:grid-cols-2">
          {SEED_ACHIEVEMENTS.map(a => (
            <div key={a.id} className="rounded-2xl border bg-card shadow-sm p-5 flex gap-4 items-start">
              <div className={`p-2.5 rounded-xl shrink-0
                ${a.category === 'Academic' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300'
                  : a.category === 'Sports' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300'}`}>
                <Star className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{a.category}</span>
                <p className="text-sm font-bold mt-0.5">{a.title}</p>
                {a.description && <p className="text-xs text-muted-foreground mt-1">{a.description}</p>}
                <p className="text-[10px] text-muted-foreground mt-2">
                  {format(new Date(a.awarded_on), 'd MMM yyyy')} · By {a.awarded_by_name}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── PTM Tab ── */}
      {activeTab === 'ptm' && (
        <div className="space-y-4">
          {SEED_PTM.map(ptm => (
            <div key={ptm.id} className="rounded-2xl border bg-card shadow-sm p-5 flex gap-4 items-start">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">{ptm.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {format(new Date(ptm.scheduled_at), 'EEEE, d MMMM yyyy · hh:mm a')}
                </p>
                {ptm.venue && <p className="text-xs text-muted-foreground mt-0.5">📍 {ptm.venue}</p>}
                {ptm.description && <p className="text-xs text-foreground mt-2">{ptm.description}</p>}
                {ptm.target_class_name && (
                  <p className="text-[10px] text-muted-foreground mt-2 font-medium">For: {ptm.target_class_name}</p>
                )}
              </div>
              {new Date(ptm.scheduled_at) > new Date() && (
                <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">Upcoming</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Remarks Tab ── */}
      {activeTab === 'remarks' && (
        <div className="space-y-3">
          {SEED_REMARKS.map(r => (
            <div key={r.id} className={`rounded-2xl border bg-card shadow-sm p-5
              ${r.remark_type === 'positive' ? 'border-l-4 border-emerald-500'
                : r.remark_type === 'negative' ? 'border-l-4 border-red-500'
                : 'border-l-4 border-slate-300'}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground">By {r.given_by_name}</p>
                <RemarkBadge type={r.remark_type} />
              </div>
              <p className="text-sm text-foreground">{r.remark_text}</p>
              <p className="text-[10px] text-muted-foreground mt-2">
                {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
