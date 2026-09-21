/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * lib/data/communication.ts
 * ============================================================================
 * Types, helpers, and localStorage seed for Stage 8 — Communication
 * ============================================================================
 */

export type CircularCategory = 'General' | 'Urgent' | 'Event' | 'Holiday' | 'Exam'

export interface Circular {
  id: string
  school_id: string
  title: string
  description: string
  category: CircularCategory
  target_class_id: string | null   // null = whole school
  target_class_name?: string | null
  target_section_id?: string | null
  created_by: string
  created_by_name?: string
  send_whatsapp: boolean
  created_at: string
  is_read?: boolean
}

export interface FeedbackItem {
  id: string
  school_id: string
  profile_id: string
  subject: string
  message: string
  category: 'General' | 'Complaint' | 'Suggestion' | 'Query'
  status: 'open' | 'in_review' | 'resolved'
  admin_reply?: string | null
  replied_at?: string | null
  created_at: string
}

export interface Achievement {
  id: string
  school_id: string
  student_id: string
  student_name?: string
  title: string
  description?: string | null
  category: 'Academic' | 'Sports' | 'Cultural' | 'Co-curricular'
  awarded_on: string
  awarded_by_name?: string
  created_at: string
}

export interface PTMSchedule {
  id: string
  school_id: string
  title: string
  scheduled_at: string
  venue?: string | null
  description?: string | null
  target_class_name?: string | null
  created_at: string
}

export interface Remark {
  id: string
  school_id: string
  student_id: string
  given_by_name?: string
  remark_text: string
  remark_type: 'positive' | 'neutral' | 'negative'
  created_at: string
}

export interface NotificationHistoryItem {
  id: string
  school_id: string
  profile_id: string
  title: string
  body: string
  type: string
  is_read: boolean
  created_at: string
}

// ─── LocalStorage seed ────────────────────────────────────────────────────────

const CIRCULARS_KEY = 'vajdhata_circulars_v1'
const FEEDBACK_KEY = 'vajdhata_feedback_v1'

const SEED_CIRCULARS: Circular[] = [
  {
    id: 'circ-0001-0000-0000-0000-000000000001',
    school_id: '11111111-1111-1111-1111-111111111111',
    title: 'Annual Sports Day — 15 October 2026',
    description: 'All students of Classes IX–XII are requested to report on the school ground by 7:30 AM on October 15th for the Annual Sports Day event. Sports kits are mandatory. Parents and guardians are warmly invited to attend.',
    category: 'Event',
    target_class_id: null,
    target_class_name: 'All Classes',
    created_by: 'b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    created_by_name: 'Rajesh Verma',
    send_whatsapp: true,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    is_read: false,
  },
  {
    id: 'circ-0001-0000-0000-0000-000000000002',
    school_id: '11111111-1111-1111-1111-111111111111',
    title: 'Half-Yearly Examination Schedule Released',
    description: 'The Half-Yearly Examination for all classes will commence from November 3rd, 2026. Students are advised to download the timetable from the portal and prepare accordingly. No extensions will be granted.',
    category: 'Exam',
    target_class_id: '22222222-2222-2222-2222-222222222222',
    target_class_name: 'Class XII',
    created_by: 'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    created_by_name: 'Dr. Vinod Sharma (Principal)',
    send_whatsapp: true,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    is_read: false,
  },
  {
    id: 'circ-0001-0000-0000-0000-000000000003',
    school_id: '11111111-1111-1111-1111-111111111111',
    title: 'Gandhi Jayanti Holiday — 2 October',
    description: 'The school will remain closed on 2nd October 2026 on account of Gandhi Jayanti. Classes will resume normally on 3rd October.',
    category: 'Holiday',
    target_class_id: null,
    target_class_name: 'All Classes',
    created_by: 'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    created_by_name: 'Dr. Vinod Sharma (Principal)',
    send_whatsapp: false,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    is_read: true,
  },
]

const SEED_FEEDBACK: FeedbackItem[] = [
  {
    id: 'fb-0001-0000-0000-0000-000000000001',
    school_id: '11111111-1111-1111-1111-111111111111',
    profile_id: 'f1111111-ffff-ffff-ffff-ffffffffffff',
    subject: 'Request for extra Physics coaching',
    message: 'Our child is struggling with Electromagnetic Induction. Could the school arrange extra coaching sessions for students who need additional help before the half-yearly examinations?',
    category: 'Query',
    status: 'resolved',
    admin_reply: 'Thank you for reaching out. We have scheduled extra Physics doubt-clearing sessions every Saturday from 10 AM–12 PM starting next week.',
    replied_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
]

export const SEED_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-0001-0000-0000-0000-000000000001',
    school_id: '11111111-1111-1111-1111-111111111111',
    student_id: '44444444-4444-4444-4444-444444444441',
    student_name: 'Aarav Patel',
    title: '1st Place — Inter-School Science Olympiad',
    description: 'Awarded first place in the district-level Inter-School Science Olympiad for the Physics section. Score: 98/100.',
    category: 'Academic',
    awarded_on: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
    awarded_by_name: 'Rajesh Verma',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'ach-0001-0000-0000-0000-000000000002',
    school_id: '11111111-1111-1111-1111-111111111111',
    student_id: '44444444-4444-4444-4444-444444444441',
    student_name: 'Aarav Patel',
    title: 'Best Speaker — Annual Debate Competition',
    description: 'Won the "Best Speaker" trophy at the annual inter-class debate competition on the topic of AI in Education.',
    category: 'Co-curricular',
    awarded_on: new Date(Date.now() - 20 * 86400000).toISOString().split('T')[0],
    awarded_by_name: 'Dr. Vinod Sharma',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
]

export const SEED_PTM: PTMSchedule[] = [
  {
    id: 'ptm-0001-0000-0000-0000-000000000001',
    school_id: '11111111-1111-1111-1111-111111111111',
    title: 'Half-Yearly PTM — Class XII',
    scheduled_at: new Date(Date.now() + 7 * 86400000).toISOString(),
    venue: 'School Auditorium, Ground Floor',
    description: 'Parents are requested to meet their respective class teachers to discuss the half-yearly performance and attendance records. Time slots: 9 AM–1 PM.',
    target_class_name: 'Class XII',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
]

export const SEED_REMARKS: Remark[] = [
  {
    id: 'rem-0001-0000-0000-0000-000000000001',
    school_id: '11111111-1111-1111-1111-111111111111',
    student_id: '44444444-4444-4444-4444-444444444441',
    given_by_name: 'Rajesh Verma',
    remark_text: 'Excellent performance in Physics practicals this week. Aarav demonstrated exceptional understanding of electromagnetic concepts and helped peers with lab work.',
    remark_type: 'positive',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'rem-0001-0000-0000-0000-000000000002',
    school_id: '11111111-1111-1111-1111-111111111111',
    student_id: '44444444-4444-4444-4444-444444444441',
    given_by_name: 'Sunita Sharma',
    remark_text: 'Please submit the pending Mathematics worksheet from last week. The assignment was due on Monday.',
    remark_type: 'neutral',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
]

export function getLocalCirculars(): Circular[] {
  if (typeof window === 'undefined') return SEED_CIRCULARS
  try {
    const raw = localStorage.getItem(CIRCULARS_KEY)
    if (!raw) { localStorage.setItem(CIRCULARS_KEY, JSON.stringify(SEED_CIRCULARS)); return SEED_CIRCULARS }
    return JSON.parse(raw)
  } catch { return SEED_CIRCULARS }
}

export function saveLocalCirculars(circulars: Circular[]): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(CIRCULARS_KEY, JSON.stringify(circulars)) } catch { /* noop */ }
}

export function getLocalFeedback(): FeedbackItem[] {
  if (typeof window === 'undefined') return SEED_FEEDBACK
  try {
    const raw = localStorage.getItem(FEEDBACK_KEY)
    if (!raw) { localStorage.setItem(FEEDBACK_KEY, JSON.stringify(SEED_FEEDBACK)); return SEED_FEEDBACK }
    return JSON.parse(raw)
  } catch { return SEED_FEEDBACK }
}

export function saveLocalFeedback(items: FeedbackItem[]): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(FEEDBACK_KEY, JSON.stringify(items)) } catch { /* noop */ }
}

/** Map category to colours */
export function getCircularCategoryTheme(category: string): { bg: string; text: string; border: string } {
  switch (category) {
    case 'Urgent':   return { bg: 'bg-red-50 dark:bg-red-950/40',    text: 'text-red-700 dark:text-red-300',    border: 'border-red-200 dark:border-red-800' }
    case 'Exam':     return { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800' }
    case 'Event':    return { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' }
    case 'Holiday':  return { bg: 'bg-amber-50 dark:bg-amber-950/40',  text: 'text-amber-700 dark:text-amber-300',  border: 'border-amber-200 dark:border-amber-800' }
    default:         return { bg: 'bg-slate-100 dark:bg-slate-800',   text: 'text-slate-700 dark:text-slate-300',   border: 'border-slate-200 dark:border-slate-700' }
  }
}
