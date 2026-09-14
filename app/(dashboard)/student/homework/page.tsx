/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

/**
 * app/(dashboard)/student/homework/page.tsx
 * ============================================================================
 * Student & Parent side — Homework & Assignments Module
 * - Matches the two-pane layout: scrollable list on the left, full detail on right
 * - Left pane: reverse-chronological list of cards, each showing a coloured icon
 *   by subject, title, an 'Attachment' chip if file exists, assigned-by teacher,
 *   created date, and computed status pill (Pending / Submitted / Late)
 * - If an item has NO due date: do not show a status pill at all (informational)
 * - Right pane: full detail of selected item — title, 'Assigned by', Description,
 *   downloadable Attachment, and any Teacher Remarks
 * - Search box and Filters (by subject and by status)
 * - Child Switcher for parent users
 * - Instant filtering strictly to current student's class and section!
 * ============================================================================
 */

import * as React from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/page-header'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { ChildSwitcher } from '@/components/student/child-switcher'
import { createClient } from '@/lib/supabase/client'
import {
  fetchStudentDashboardData,
  StudentDashboardData,
} from '@/lib/data/student-dashboard'
import {
  HomeworkItem,
  HomeworkSubmissionStatus,
  getSubjectTheme,
  computeHomeworkStatus,
  getLocalHomeworkStore,
  saveLocalHomeworkStore,
} from '@/lib/data/homework'
import {
  BookOpen,
  Calendar,
  Clock,
  Paperclip,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Download,
  User,
  ChevronRight,
  Layers,
  Info,
  CheckCircle,
  FileText,
} from 'lucide-react'

export default function StudentHomeworkPage() {
  const supabase = React.useMemo(() => createClient(), [])

  const [dashboardData, setDashboardData] = React.useState<StudentDashboardData | null>(null)
  const [selectedChildId, setSelectedChildId] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)

  // Homework items for this student's class & section
  const [items, setItems] = React.useState<HomeworkItem[]>([])
  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(null)

  // Search and Filters
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedSubject, setSelectedSubject] = React.useState<string>('ALL')
  const [selectedStatus, setSelectedStatus] = React.useState<string>('ALL')

  // Submission action state
  const [markingSubmitted, setMarkingSubmitted] = React.useState(false)

  // 1. Load active student / child data
  const loadData = React.useCallback(async (childId?: string | null) => {
    setLoading(true)
    try {
      const data = await fetchStudentDashboardData(supabase, childId || selectedChildId)
      setDashboardData(data)

      if (data.isParent && data.linkedChildren.length > 0 && !childId && !selectedChildId) {
        setSelectedChildId(data.student.id)
      }

      // Load all homework items from localStorage store (which synchronizes with teacher posts)
      const allHomework = getLocalHomeworkStore()

      // FILTER STRICTLY to this student's class and section!
      // If student has class_id and section_id, filter by that.
      const studentClassId = data.student.class_id
      const studentSectionId = data.student.section_id

      let classHomework = allHomework.filter((h) => {
        if (studentClassId && h.class_id) {
          if (studentSectionId && h.section_id) {
            return h.class_id === studentClassId && h.section_id === studentSectionId
          }
          return h.class_id === studentClassId
        }
        // Fallback by class name match if UUID missing in demo
        if (data.student.class_name) {
          return h.class_name.toLowerCase() === data.student.class_name.toLowerCase()
        }
        return true
      })

      // Sort reverse-chronologically by created_at
      classHomework = classHomework.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

      setItems(classHomework)

      // Auto-select first item if none selected or if previously selected item not in new list
      if (classHomework.length > 0) {
        setSelectedItemId((prev) => {
          if (prev && classHomework.some((item) => item.id === prev)) {
            return prev
          }
          return classHomework[0].id
        })
      } else {
        setSelectedItemId(null)
      }
    } catch (err) {
      console.error('Failed to load homework for student:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase, selectedChildId])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  // Handle Child Switcher for Parents
  const handleSelectChild = (childId: string) => {
    setSelectedChildId(childId)
    loadData(childId)
  }

  // Filtered Homework items
  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      // Compute status for filtering
      const effectiveStatus = computeHomeworkStatus(item.status, item.due_date)

      // Search filter
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.teacher_name && item.teacher_name.toLowerCase().includes(searchQuery.toLowerCase()))

      // Subject filter
      const matchesSubject =
        selectedSubject === 'ALL' || item.subject === selectedSubject

      // Status filter
      let matchesStatus = true
      if (selectedStatus === 'ALL') {
        matchesStatus = true
      } else if (selectedStatus === 'NO_DUE_DATE') {
        matchesStatus = item.due_date === null
      } else {
        matchesStatus = effectiveStatus === selectedStatus
      }

      return matchesSearch && matchesSubject && matchesStatus
    })
  }, [items, searchQuery, selectedSubject, selectedStatus])

  // Currently selected homework item
  const selectedItem = React.useMemo(() => {
    return items.find((item) => item.id === selectedItemId) || null
  }, [items, selectedItemId])

  // Toggle Submission Status (Student can mark as submitted)
  const handleToggleSubmission = async (homeworkId: string) => {
    const item = items.find((h) => h.id === homeworkId)
    if (!item) return

    const newStatus: HomeworkSubmissionStatus =
      item.status === 'submitted' ? 'pending' : 'submitted'

    setMarkingSubmitted(true)
    try {
      const currentList = getLocalHomeworkStore()
      const updatedList = currentList.map((h) => {
        if (h.id === homeworkId) {
          return {
            ...h,
            status: newStatus,
            submitted_at: newStatus === 'submitted' ? new Date().toISOString() : null,
          }
        }
        return h
      })

      saveLocalHomeworkStore(updatedList)
      setItems((prev) =>
        prev.map((h) => (h.id === homeworkId ? { ...h, status: newStatus } : h))
      )

      // Try updating in Supabase if student session exists
      if (dashboardData?.student?.id) {
        try {
          await supabase
            .from('homework_status')
            .upsert({
              school_id: dashboardData.student.school_id,
              homework_id: homeworkId,
              student_id: dashboardData.student.id,
              status: newStatus,
              submitted_at: newStatus === 'submitted' ? new Date().toISOString() : null,
            }, { onConflict: 'homework_id,student_id' })
        } catch {
          // ignore offline
        }
      }

      toast.success(
        newStatus === 'submitted'
          ? 'Assignment marked as submitted!'
          : 'Assignment marked as pending.'
      )
    } catch {
      toast.error('Could not update submission status')
    } finally {
      setMarkingSubmitted(false)
    }
  }

  // Available subjects for filter dropdown
  const uniqueSubjects = React.useMemo(() => {
    return Array.from(new Set(items.map((i) => i.subject)))
  }, [items])

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <PageHeader
          title="Homework & Assignments"
          subtitle="View homework, study materials, and submit your assignments."
        />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <LoadingSkeleton className="h-12 rounded-xl" />
            <LoadingSkeleton className="h-32 rounded-2xl" />
            <LoadingSkeleton className="h-32 rounded-2xl" />
            <LoadingSkeleton className="h-32 rounded-2xl" />
          </div>
          <div className="lg:col-span-7">
            <LoadingSkeleton className="h-[520px] rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <PageHeader
        title="Homework & Assignments"
        subtitle={
          dashboardData?.isParent
            ? `Viewing homework tasks and deadlines for ${dashboardData.student.full_name} (Class ${dashboardData.student.class_name}-${dashboardData.student.section_name})`
            : `Class ${dashboardData?.student.class_name}-${dashboardData?.student.section_name} coursework, task sheets, and submission deadlines`
        }
        actions={
          dashboardData?.isParent && dashboardData.linkedChildren.length > 1 ? (
            <ChildSwitcher
              childrenList={dashboardData.linkedChildren}
              activeChildId={selectedChildId || dashboardData.student.id}
              onSelectChild={handleSelectChild}
            />
          ) : undefined
        }
      />

      {/* Main Two-Pane Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* =================================================================== */}
        {/* LEFT PANE: Scrollable List of Homework Cards (5 cols on lg)         */}
        {/* =================================================================== */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Search & Filters Card */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search homework, subject, teacher..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-2xs"
              />
            </div>

            {/* Subject Filter & Status Filter Row */}
            <div className="flex items-center gap-2">
              {/* Subject Dropdown */}
              <div className="relative flex-1">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-border bg-background px-3 py-1.5 pr-7 text-xs font-semibold text-foreground shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="ALL">All Subjects</option>
                  {uniqueSubjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronRight className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 rotate-90 text-muted-foreground" />
              </div>

              {/* Status Filter Dropdown */}
              <div className="relative flex-1">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-border bg-background px-3 py-1.5 pr-7 text-xs font-semibold text-foreground shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="ALL">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="submitted">Submitted</option>
                  <option value="late">Late</option>
                  <option value="NO_DUE_DATE">No Deadline (Info)</option>
                </select>
                <ChevronRight className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 rotate-90 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* List of Cards */}
          <div className="space-y-2.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {filteredItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center space-y-2">
                <Layers className="h-8 w-8 mx-auto text-muted-foreground stroke-[1.5]" />
                <p className="text-sm font-bold text-foreground">No homework found</p>
                <p className="text-xs text-muted-foreground">
                  {searchQuery || selectedSubject !== 'ALL' || selectedStatus !== 'ALL'
                    ? 'No assignments match your search or filter.'
                    : 'No assignments posted for your class yet.'}
                </p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const isSelected = item.id === selectedItemId
                const theme = getSubjectTheme(item.subject)
                const computedStatus = computeHomeworkStatus(item.status, item.due_date)

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    className={`rounded-2xl border p-4 cursor-pointer transition-all flex flex-col justify-between space-y-2.5 text-left ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30'
                        : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30 shadow-2xs'
                    }`}
                  >
                    {/* Header: Coloured Icon, Subject, Status Pill */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Coloured icon by subject */}
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${theme.iconBg}`}
                        >
                          <BookOpen className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border inline-block truncate ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}
                          >
                            {item.subject}
                          </span>
                          <p className="text-[11px] text-muted-foreground capitalize font-medium mt-0.5">
                            {item.type}
                          </p>
                        </div>
                      </div>

                      {/* Status pill (Pending / Submitted / Late) — OMIT IF NO DUE DATE! */}
                      {computedStatus !== null ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 border ${
                            computedStatus === 'submitted'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                              : computedStatus === 'late'
                              ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800'
                              : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
                          }`}
                        >
                          {computedStatus === 'submitted' && <CheckCircle2 className="h-3 w-3" />}
                          {computedStatus === 'late' && <Clock3 className="h-3 w-3" />}
                          {computedStatus === 'pending' && <Clock className="h-3 w-3" />}
                          {computedStatus}
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-muted-foreground/80 px-2 py-0.5 bg-muted rounded-md shrink-0">
                          Info
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h4
                      className={`text-sm font-bold tracking-tight line-clamp-2 ${
                        isSelected ? 'text-primary' : 'text-foreground'
                      }`}
                    >
                      {item.title}
                    </h4>

                    {/* Chips & Metadata row */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50 text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-2 truncate">
                        {/* Assigned-by teacher name */}
                        <span className="truncate">
                          By {item.teacher_name ? item.teacher_name.split('(')[0].trim() : 'Teacher'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Attachment chip if file exists */}
                        {item.attachment_url && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted text-foreground text-[10px] font-semibold border border-border">
                            <Paperclip className="h-2.5 w-2.5 text-primary" />
                            Attachment
                          </span>
                        )}

                        {/* Created date */}
                        <span>
                          {new Date(item.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* =================================================================== */}
        {/* RIGHT PANE: Full Detail of the Selected Item (7 cols on lg)         */}
        {/* =================================================================== */}
        <div className="lg:col-span-7">
          {selectedItem ? (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
              
              {/* Header: Subject, Type, Status Pill */}
              <div className="flex items-center justify-between gap-3 flex-wrap pb-4 border-b border-border">
                <div className="flex items-center gap-2 flex-wrap">
                  {(() => {
                    const theme = getSubjectTheme(selectedItem.subject)
                    return (
                      <span
                        className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-xl border ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}
                      >
                        {selectedItem.subject}
                      </span>
                    )
                  })()}
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-muted text-muted-foreground capitalize">
                    {selectedItem.type}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-primary/10 text-primary">
                    Class {selectedItem.class_name} - {selectedItem.section_name}
                  </span>
                </div>

                {/* Computed Status pill */}
                {(() => {
                  const computedStatus = computeHomeworkStatus(selectedItem.status, selectedItem.due_date)
                  if (computedStatus === null) {
                    return (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
                        <Info className="h-3.5 w-3.5" />
                        Informational (No Deadline)
                      </span>
                    )
                  }
                  return (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                        computedStatus === 'submitted'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                          : computedStatus === 'late'
                          ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800'
                          : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
                      }`}
                    >
                      {computedStatus === 'submitted' && <CheckCircle2 className="h-3.5 w-3.5" />}
                      {computedStatus === 'late' && <Clock3 className="h-3.5 w-3.5" />}
                      {computedStatus === 'pending' && <Clock className="h-3.5 w-3.5" />}
                      {computedStatus}
                    </span>
                  )
                })()}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight leading-snug">
                  {selectedItem.title}
                </h2>

                {/* Meta details: Assigned By & Deadlines */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/60">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase">
                        Assigned By
                      </p>
                      <p className="text-xs font-bold text-foreground truncate">
                        {selectedItem.teacher_name || 'Subject Teacher'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/60">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase">
                        {selectedItem.due_date ? 'Submission Due Date' : 'Assigned On'}
                      </p>
                      <p className="text-xs font-bold text-foreground">
                        {selectedItem.due_date
                          ? new Date(selectedItem.due_date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })
                          : new Date(selectedItem.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Instructions & Description
                </h3>
                <div className="p-4 rounded-xl border border-border/80 bg-background/50 leading-relaxed text-sm text-foreground whitespace-pre-line shadow-2xs font-normal">
                  {selectedItem.description}
                </div>
              </div>

              {/* Teacher Remarks (if any) */}
              {selectedItem.teacher_remarks && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Teacher Remarks
                  </h3>
                  <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed font-medium">
                      {selectedItem.teacher_remarks}
                    </p>
                  </div>
                </div>
              )}

              {/* Downloadable Attachment Section */}
              {selectedItem.attachment_url && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Downloadable Attachment
                  </h3>
                  <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">
                          {selectedItem.attachment_name || 'Homework_Attachment_Document'}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Reference reading / practice sheet
                        </p>
                      </div>
                    </div>

                    <a
                      href={selectedItem.attachment_url}
                      download={selectedItem.attachment_name || 'homework_attachment'}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all shadow-xs shrink-0 active:scale-95"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download File</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Submission Action Bar */}
              {selectedItem.due_date && (
                <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-muted-foreground">
                    {selectedItem.status === 'submitted' ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                        <CheckCircle className="h-4 w-4" />
                        You have submitted this assignment.
                      </span>
                    ) : (
                      <span>Keep track of your homework progress by marking tasks when done.</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleToggleSubmission(selectedItem.id)}
                    disabled={markingSubmitted}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-sm active:scale-95 ${
                      selectedItem.status === 'submitted'
                        ? 'bg-muted text-foreground border border-border hover:bg-muted/80'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      {selectedItem.status === 'submitted'
                        ? 'Mark as Not Completed'
                        : 'Mark as Completed / Submitted'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
              <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/60 stroke-[1.5]" />
              <h3 className="text-base font-bold text-foreground">Select an item to view</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Choose a homework or assignment from the list on the left to read full instructions,
                download attachments, and update submission status.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
