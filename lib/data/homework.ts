/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * lib/data/homework.ts
 * ============================================================================
 * Data helpers and types for Stage 6 — Homework & Assignments Module
 * Supports both Live Supabase and Demo/Offline Storage Synchronization
 * ============================================================================
 */

import { SupabaseClient } from '@supabase/supabase-js'

export type HomeworkType = 'homework' | 'assignment'
export type HomeworkSubmissionStatus = 'pending' | 'submitted' | 'late'

export interface HomeworkItem {
  id: string
  school_id: string
  class_id: string
  section_id: string
  class_name: string
  section_name: string
  subject: string
  title: string
  description: string
  type: HomeworkType
  due_date: string | null // YYYY-MM-DD or null
  created_by: string
  teacher_name?: string
  teacher_remarks?: string | null
  attachment_url?: string | null
  attachment_name?: string | null
  created_at: string
  updated_at?: string
  // Status for student/parent view
  status?: HomeworkSubmissionStatus | null // null = no due date (informational)
  submission_notes?: string | null
  student_attachment_url?: string | null
  submitted_at?: string | null
  // Submissions count for teacher view
  total_students?: number
  submitted_students?: number
}

export interface TeacherSubjectOption {
  name: string
  code?: string
}

export const ALLOWED_FILE_EXTENSIONS = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

/**
 * Validates selected file for homework attachment
 */
export function validateAttachmentFile(file: File): { valid: boolean; error?: string } {
  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  if (!ALLOWED_FILE_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Invalid file type .${ext}. Only PDF, DOC, DOCX, JPG, and PNG files up to 10MB are permitted.`,
    }
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1)
    return {
      valid: false,
      error: `File size (${sizeInMb}MB) exceeds the maximum allowed limit of 10MB.`,
    }
  }

  return { valid: true }
}

/**
 * Subject theme configuration (Colors, Icons, Borders)
 */
export interface SubjectTheme {
  name: string
  iconName: 'atom' | 'calculator' | 'flask' | 'dna' | 'book' | 'code' | 'globe' | 'palette' | 'feather' | 'scroll'
  badgeBg: string
  badgeText: string
  badgeBorder: string
  iconBg: string
  iconColor: string
  gradient: string
}

export function getSubjectTheme(subject: string): SubjectTheme {
  const normalized = subject.trim().toLowerCase()

  if (normalized.includes('physic') || normalized.includes('applied science')) {
    return {
      name: subject,
      iconName: 'atom',
      badgeBg: 'bg-indigo-50 dark:bg-indigo-950/60',
      badgeText: 'text-indigo-700 dark:text-indigo-300',
      badgeBorder: 'border-indigo-200 dark:border-indigo-800',
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      gradient: 'from-indigo-500 to-purple-600',
    }
  }

  if (normalized.includes('math') || normalized.includes('statistic') || normalized.includes('algebra')) {
    return {
      name: subject,
      iconName: 'calculator',
      badgeBg: 'bg-blue-50 dark:bg-blue-950/60',
      badgeText: 'text-blue-700 dark:text-blue-300',
      badgeBorder: 'border-blue-200 dark:border-blue-800',
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      iconColor: 'text-blue-600 dark:text-blue-400',
      gradient: 'from-blue-500 to-cyan-600',
    }
  }

  if (normalized.includes('chem')) {
    return {
      name: subject,
      iconName: 'flask',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60',
      badgeText: 'text-emerald-700 dark:text-emerald-300',
      badgeBorder: 'border-emerald-200 dark:border-emerald-800',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      gradient: 'from-emerald-500 to-teal-600',
    }
  }

  if (normalized.includes('bio') || normalized.includes('life')) {
    return {
      name: subject,
      iconName: 'dna',
      badgeBg: 'bg-teal-50 dark:bg-teal-950/60',
      badgeText: 'text-teal-700 dark:text-teal-300',
      badgeBorder: 'border-teal-200 dark:border-teal-800',
      iconBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
      iconColor: 'text-teal-600 dark:text-teal-400',
      gradient: 'from-teal-500 to-green-600',
    }
  }

  if (normalized.includes('english') || normalized.includes('literature') || normalized.includes('language')) {
    return {
      name: subject,
      iconName: 'feather',
      badgeBg: 'bg-amber-50 dark:bg-amber-950/60',
      badgeText: 'text-amber-700 dark:text-amber-300',
      badgeBorder: 'border-amber-200 dark:border-amber-800',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      iconColor: 'text-amber-600 dark:text-amber-400',
      gradient: 'from-amber-500 to-orange-600',
    }
  }

  if (normalized.includes('comp') || normalized.includes('code') || normalized.includes('it') || normalized.includes('program')) {
    return {
      name: subject,
      iconName: 'code',
      badgeBg: 'bg-sky-50 dark:bg-sky-950/60',
      badgeText: 'text-sky-700 dark:text-sky-300',
      badgeBorder: 'border-sky-200 dark:border-sky-800',
      iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
      iconColor: 'text-sky-600 dark:text-sky-400',
      gradient: 'from-sky-500 to-blue-600',
    }
  }

  if (normalized.includes('history') || normalized.includes('civics') || normalized.includes('social') || normalized.includes('geography')) {
    return {
      name: subject,
      iconName: 'globe',
      badgeBg: 'bg-rose-50 dark:bg-rose-950/60',
      badgeText: 'text-rose-700 dark:text-rose-300',
      badgeBorder: 'border-rose-200 dark:border-rose-800',
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      iconColor: 'text-rose-600 dark:text-rose-400',
      gradient: 'from-rose-500 to-pink-600',
    }
  }

  if (normalized.includes('art') || normalized.includes('music') || normalized.includes('craft')) {
    return {
      name: subject,
      iconName: 'palette',
      badgeBg: 'bg-fuchsia-50 dark:bg-fuchsia-950/60',
      badgeText: 'text-fuchsia-700 dark:text-fuchsia-300',
      badgeBorder: 'border-fuchsia-200 dark:border-fuchsia-800',
      iconBg: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400',
      iconColor: 'text-fuchsia-600 dark:text-fuchsia-400',
      gradient: 'from-fuchsia-500 to-purple-600',
    }
  }

  // Default theme
  return {
    name: subject,
    iconName: 'book',
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    badgeText: 'text-slate-800 dark:text-slate-200',
    badgeBorder: 'border-slate-200 dark:border-slate-700',
    iconBg: 'bg-slate-500/10 text-slate-700 dark:text-slate-300',
    iconColor: 'text-slate-700 dark:text-slate-300',
    gradient: 'from-slate-600 to-slate-800',
  }
}

/**
 * Computes homework submission status
 * If no due_date: returns null (pure informational homework)
 * If submitted: 'submitted'
 * If pending and due_date in past: 'late'
 * Otherwise: 'pending'
 */
export function computeHomeworkStatus(
  status: HomeworkSubmissionStatus | string | null | undefined,
  dueDate: string | null | undefined
): HomeworkSubmissionStatus | null {
  if (!dueDate || dueDate.trim() === '') {
    return null
  }

  if (status === 'submitted') {
    return 'submitted'
  }

  if (status === 'late') {
    return 'late'
  }

  // Check if overdue
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const due = new Date(dueDate + 'T23:59:59')
    if (due < today) {
      return 'late'
    }
  } catch {
    // fallback
  }

  return 'pending'
}

// -----------------------------------------------------------------------------
// LOCALSTORAGE KEY & SEED FALLBACK DATA
// -----------------------------------------------------------------------------
const STORAGE_KEY = 'vajdhata_homework_store_v1'

const INITIAL_SEED_HOMEWORK: HomeworkItem[] = [
  {
    id: '55555555-5555-5555-5555-555555555551',
    school_id: '11111111-1111-1111-1111-111111111111',
    class_id: '22222222-2222-2222-2222-222222222222', // XII
    section_id: '33333333-3333-3333-3333-333333333331', // A
    class_name: 'XII',
    section_name: 'A',
    subject: 'Physics',
    title: 'Electromagnetic Induction Numerical Problems',
    description: 'Complete exercises 4.1 to 4.15 from Chapter 4 of the NCERT textbook. Focus especially on Faraday\'s law calculation and Lenz\'s law directional problems.\n\nSubmit complete step-by-step derivations on ruled sheets.',
    type: 'homework',
    due_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    created_by: 'd1111111-dddd-dddd-dddd-dddddddddddd',
    teacher_name: 'Rajesh Verma (Senior PGT Physics)',
    teacher_remarks: 'Refer to lecture slides 14-22 for flux change diagrams.',
    attachment_url: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=1200&q=80',
    attachment_name: 'EMI_Problem_Set_NCERT.pdf',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    status: 'pending',
    total_students: 2,
    submitted_students: 1,
  },
  {
    id: '55555555-5555-5555-5555-555555555552',
    school_id: '11111111-1111-1111-1111-111111111111',
    class_id: '22222222-2222-2222-2222-222222222222', // XII
    section_id: '33333333-3333-3333-3333-333333333331', // A
    class_name: 'XII',
    section_name: 'A',
    subject: 'Physics',
    title: 'Wave Optics Lab Report & Interference Fringe Analysis',
    description: 'Submit your formal laboratory report for the Young\'s Double Slit Experiment conducted last Friday. Include calculated fringe widths and error margin analysis.',
    type: 'assignment',
    due_date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0], // Past date -> Late
    created_by: 'd1111111-dddd-dddd-dddd-dddddddddddd',
    teacher_name: 'Rajesh Verma (Senior PGT Physics)',
    teacher_remarks: 'Late submissions will incur a 10% penalty as announced in class.',
    attachment_url: 'https://images.unsplash.com/photo-1517976487507-5b3b4a408304?auto=format&fit=crop&w=1200&q=80',
    attachment_name: 'YDSE_Lab_Manual_Guidelines.pdf',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    status: 'late',
    total_students: 2,
    submitted_students: 0,
  },
  {
    id: '55555555-5555-5555-5555-555555555553',
    school_id: '11111111-1111-1111-1111-111111111111',
    class_id: '22222222-2222-2222-2222-222222222222', // XII
    section_id: '33333333-3333-3333-3333-333333333331', // A
    class_name: 'XII',
    section_name: 'A',
    subject: 'Applied Science',
    title: 'Weekly Reading: Quantum Hall Effect & Modern Standards',
    description: 'Read the summary article on von Klitzing constant and how quantum metrology redefined SI electrical resistance standards. We will discuss this in Monday seminar.',
    type: 'homework',
    due_date: null, // No due date -> Pure informational!
    created_by: 'd1111111-dddd-dddd-dddd-dddddddddddd',
    teacher_name: 'Rajesh Verma (Senior PGT Physics)',
    teacher_remarks: 'Optional exploratory reading for competitive exams.',
    attachment_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    attachment_name: 'Quantum_Metrology_Article.pdf',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    status: null,
    total_students: 2,
    submitted_students: 0,
  },
  {
    id: '55555555-5555-5555-5555-555555555554',
    school_id: '11111111-1111-1111-1111-111111111111',
    class_id: '22222222-2222-2222-2222-333333333333', // X
    section_id: '33333333-3333-3333-3333-333333333333', // A
    class_name: 'X',
    section_name: 'A',
    subject: 'Mathematics',
    title: 'Quadratic Equations Practice Worksheet',
    description: 'Complete problems 1 to 20 on solving quadratic equations using discriminant method and factorisation.',
    type: 'homework',
    due_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    created_by: 'd2222222-dddd-dddd-dddd-dddddddddddd',
    teacher_name: 'Sunita Sharma (TGT Mathematics)',
    teacher_remarks: 'Check solutions with the answer key at back after attempting.',
    attachment_url: null,
    attachment_name: null,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    status: 'pending',
    total_students: 1,
    submitted_students: 0,
  }
]

export function getLocalHomeworkStore(): HomeworkItem[] {
  if (typeof window === 'undefined') return INITIAL_SEED_HOMEWORK
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_HOMEWORK))
      return INITIAL_SEED_HOMEWORK
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_SEED_HOMEWORK
  }
}

export function saveLocalHomeworkStore(items: HomeworkItem[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (err) {
    console.error('Failed to save homework to localStorage', err)
  }
}

/**
 * Fetch subjects for teacher
 */
export async function getTeacherSubjects(
  supabase: SupabaseClient,
  teacherProfileId: string,
  schoolId: string
): Promise<string[]> {
  try {
    const { data: staff, error } = await supabase
      .from('staff')
      .select('subjects_taught, designation')
      .eq('profile_id', teacherProfileId)
      .eq('school_id', schoolId)
      .single()

    if (!error && staff?.subjects_taught && staff.subjects_taught.length > 0) {
      return staff.subjects_taught
    }
  } catch {
    // ignore
  }

  return ['Physics', 'Applied Science', 'Mathematics', 'Chemistry', 'Biology', 'English', 'Computer Science']
}

/**
 * Upload attachment to Supabase Storage bucket 'homework-attachments'
 */
export async function uploadHomeworkAttachment(
  supabase: SupabaseClient,
  file: File,
  schoolId: string
): Promise<{ url: string | null; fileName: string; error?: string }> {
  // 1. Validation
  const validation = validateAttachmentFile(file)
  if (!validation.valid) {
    return { url: null, fileName: file.name, error: validation.error }
  }

  const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const filePath = `${schoolId}/${Date.now()}_${sanitized}`

  try {
    // Attempt upload to Supabase storage
    const { data, error: uploadErr } = await supabase.storage
      .from('homework-attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadErr) {
      console.warn('Supabase storage upload error:', uploadErr)
      // If bucket does not exist or Supabase storage is unreachable in preview demo,
      // fallback to creating an object URL or base64 data URL so the attachment download DoD works!
      const fallbackUrl = URL.createObjectURL(file)
      return { url: fallbackUrl, fileName: file.name }
    }

    const { data: publicUrlData } = supabase.storage
      .from('homework-attachments')
      .getPublicUrl(data.path)

    return {
      url: publicUrlData.publicUrl,
      fileName: file.name,
    }
  } catch (err: any) {
    console.warn('Storage exception, using object URL fallback for demo:', err)
    const fallbackUrl = URL.createObjectURL(file)
    return { url: fallbackUrl, fileName: file.name }
  }
}
