/* eslint-disable @typescript-eslint/no-explicit-any */
import { SupabaseClient } from '@supabase/supabase-js'
import { format, addDays } from 'date-fns'

export interface StudentProfileData {
  id: string
  profile_id: string
  full_name: string
  avatar_url?: string | null
  is_active: boolean
  class_name: string
  section_name: string
  class_id?: string | null
  section_id?: string | null
  admission_no: string
  phone?: string | null
  date_of_birth?: string | null
  gender?: string | null
  address?: string | null
  school_id: string
  relation?: string
}

export interface CircularItem {
  id: string
  title: string
  description: string
  category: string
  target_class_id?: string | null
  created_at: string
}

export interface HomeworkItem {
  id: string
  subject: string
  title: string
  description: string
  type: string
  due_date: string
  created_at: string
  status: 'pending' | 'submitted' | 'late'
}

export interface CalendarEventItem {
  id: string
  title: string
  event_type: 'holiday' | 'event' | 'exam' | 'meeting' | 'general'
  start_date: string
  end_date: string
  description?: string | null
}

export interface AchievementRemarkItem {
  id: string
  remark_text: string
  remark_type: 'positive' | 'negative' | 'neutral'
  created_at: string
  given_by_name: string
}

export interface LinkedChild {
  id: string
  full_name: string
  admission_no: string
  class_name: string
  section_name: string
  avatar_url?: string | null
  relation: string
}

export interface StudentDashboardData {
  student: StudentProfileData
  isParent: boolean
  linkedChildren: LinkedChild[]
  circulars: CircularItem[]
  homework: HomeworkItem[]
  calendarEvents: CalendarEventItem[]
  achievements: AchievementRemarkItem[]
}

// -----------------------------------------------------------------------------
// DETERMINISTIC SEED DATA (MIRRORS supabase/seed.sql)
// -----------------------------------------------------------------------------
const SEED_SCHOOL_ID = '11111111-1111-1111-1111-111111111111'
const SEED_CLASS_XII_ID = '22222222-2222-2222-2222-222222222222'
const SEED_CLASS_X_ID = '22222222-2222-2222-2222-333333333333'
const SEED_SEC_A_XII_ID = '33333333-3333-3333-3333-333333333331'
const SEED_SEC_A_X_ID = '33333333-3333-3333-3333-333333333333'

const SEED_STUDENT_1: StudentProfileData = {
  id: '44444444-4444-4444-4444-444444444441',
  profile_id: 'e1111111-eeee-eeee-eeee-eeeeeeeeeeee',
  full_name: 'Aarav Patel',
  avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop',
  is_active: true,
  class_name: 'XII',
  section_name: 'A',
  class_id: SEED_CLASS_XII_ID,
  section_id: SEED_SEC_A_XII_ID,
  admission_no: 'RAD-2024-001',
  phone: '+919876543215',
  date_of_birth: '2008-05-14',
  gender: 'Male',
  address: 'Sector 62, Noida, UP',
  school_id: SEED_SCHOOL_ID,
  relation: 'father',
}

const SEED_STUDENT_3: StudentProfileData = {
  id: '44444444-4444-4444-4444-444444444443',
  profile_id: 'e3333333-eeee-eeee-eeee-eeeeeeeeeeee',
  full_name: 'Kabir Singh',
  avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
  is_active: true,
  class_name: 'X',
  section_name: 'A',
  class_id: SEED_CLASS_X_ID,
  section_id: SEED_SEC_A_X_ID,
  admission_no: 'RAD-2024-003',
  phone: '+919876543217',
  date_of_birth: '2010-12-05',
  gender: 'Male',
  address: 'Alpha 1, Greater Noida, UP',
  school_id: SEED_SCHOOL_ID,
  relation: 'father',
}

const SEED_CIRCULARS_ALL: CircularItem[] = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    title: 'Annual Sports Meet 2026 Announcement',
    description: 'All students and parents are hereby invited to register for athletics and track events before Friday.',
    category: 'Sports',
    target_class_id: null,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    title: 'Term 1 Assessment Date Sheet Released',
    description: 'The comprehensive timetable for upcoming mid-term theory and practical examinations has been published on the portal.',
    category: 'Academic',
    target_class_id: SEED_CLASS_XII_ID,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    title: 'Inter-School Science & Innovation Expo',
    description: 'Registrations are open for students wishing to showcase working science models and robotics projects in the auditorium.',
    category: 'Notice',
    target_class_id: null,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
]

const SEED_HOMEWORK_ITEMS: Record<string, HomeworkItem[]> = {
  [SEED_STUDENT_1.id]: [
    {
      id: '88888888-8888-8888-8888-888888888881',
      subject: 'Physics',
      title: 'Electromagnetic Induction Numerical Problems',
      description: 'Complete exercises 4.1 to 4.15 from Chapter 4 of NCERT textbook.',
      type: 'homework',
      due_date: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
      created_at: format(new Date(), 'yyyy-MM-dd'),
      status: 'pending',
    },
    {
      id: '88888888-8888-8888-8888-888888888882',
      subject: 'Mathematics',
      title: 'Definite Integrals & Properties Assignment',
      description: 'Solve the standard assignment worksheet handed out by Mrs. Anita Gupta.',
      type: 'assignment',
      due_date: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
      created_at: format(new Date(Date.now() - 86400000 * 2), 'yyyy-MM-dd'),
      status: 'submitted',
    },
  ],
  [SEED_STUDENT_3.id]: [
    {
      id: '88888888-8888-8888-8888-888888888883',
      subject: 'Social Science',
      title: 'Map Skills - Natural Resources of India',
      description: 'Locate and label all major mineral and energy resources on the outline map.',
      type: 'homework',
      due_date: format(addDays(new Date(), 4), 'yyyy-MM-dd'),
      created_at: format(new Date(), 'yyyy-MM-dd'),
      status: 'pending',
    },
  ],
}

const SEED_CALENDAR_EVENTS: CalendarEventItem[] = [
  {
    id: 'cal-1',
    title: 'Parent-Teacher Evaluation Conference',
    event_type: 'event',
    start_date: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
    end_date: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
    description: 'One-on-one session to discuss student academic progress with class educators.',
  },
  {
    id: 'cal-2',
    title: 'Annual Science Exhibition & Robotics Fair',
    event_type: 'event',
    start_date: format(addDays(new Date(), 12), 'yyyy-MM-dd'),
    end_date: format(addDays(new Date(), 13), 'yyyy-MM-dd'),
    description: 'Interactive student exhibits and live scientific project demonstrations in the school auditorium.',
  },
  {
    id: 'cal-3',
    title: 'Gandhi Jayanti Holiday',
    event_type: 'holiday',
    start_date: '2026-10-02',
    end_date: '2026-10-02',
    description: 'National holiday on occasion of Mahatma Gandhi Jayanti.',
  },
  {
    id: 'cal-4',
    title: 'Term 1 Final Assessments',
    event_type: 'exam',
    start_date: '2026-11-10',
    end_date: '2026-11-20',
    description: 'Term 1 end semester examinations for all classes.',
  },
]

const SEED_ACHIEVEMENTS: Record<string, AchievementRemarkItem[]> = {
  [SEED_STUDENT_1.id]: [
    {
      id: 'rem-1',
      remark_text: 'Awarded 1st Prize in National Physics Olympiad 2026 for stellar analytical problem solving.',
      remark_type: 'positive',
      created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
      given_by_name: 'Rajesh Verma (Senior PGT Physics)',
    },
    {
      id: 'rem-2',
      remark_text: 'Exemplary conduct, diligence, and proactive leadership during laboratory and classroom sessions.',
      remark_type: 'positive',
      created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
      given_by_name: 'Anita Gupta (TGT Mathematics)',
    },
  ],
  [SEED_STUDENT_3.id]: [], // Empty achievements for Kabir Singh to demonstrate EmptyState
}

// -----------------------------------------------------------------------------
// LIVE SUPABASE FETCHING FUNCTION
// -----------------------------------------------------------------------------
export async function fetchStudentDashboardData(
  supabase: SupabaseClient,
  preferredStudentId?: string | null
): Promise<StudentDashboardData> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    let activeStudent: StudentProfileData | null = null
    let isParent = false
    let linkedChildren: LinkedChild[] = []

    if (user) {
      // 1. Fetch user's profile
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id, full_name, role, phone, avatar_url, is_active, school_id')
        .eq('id', user.id)
        .single()

      if (userProfile?.role === 'parent') {
        isParent = true

        // Fetch all linked children for this parent
        const { data: links } = await supabase
          .from('parent_student_links')
          .select(`
            student_id,
            relation,
            students:student_id (
              id,
              profile_id,
              admission_no,
              class_id,
              section_id,
              date_of_birth,
              gender,
              address,
              school_id,
              classes:class_id(id, name),
              sections:section_id(id, name),
              profiles:profile_id(full_name, phone, avatar_url, is_active)
            )
          `)
          .eq('parent_profile_id', user.id)

        if (links && links.length > 0) {
          linkedChildren = links.map((l: any) => {
            const rawS = l.students
            const s: any = Array.isArray(rawS) ? rawS[0] : rawS
            const p: any = Array.isArray(s?.profiles) ? s?.profiles[0] : s?.profiles
            const c: any = Array.isArray(s?.classes) ? s?.classes[0] : s?.classes
            const sec: any = Array.isArray(s?.sections) ? s?.sections[0] : s?.sections

            return {
              id: s?.id,
              full_name: p?.full_name || 'Student',
              admission_no: s?.admission_no || '',
              class_name: c?.name || 'N/A',
              section_name: sec?.name || 'N/A',
              avatar_url: p?.avatar_url || null,
              relation: l.relation || 'Parent',
            }
          })

          // Choose active child based on preferredStudentId or default to first
          const targetLink: any =
            (preferredStudentId
              ? links.find((l: any) => l.student_id === preferredStudentId)
              : null) || links[0]

          const rawStudent = targetLink?.students
          const targetStudent: any = Array.isArray(rawStudent) ? rawStudent[0] : rawStudent
          if (targetStudent) {
            const targetProfile: any = Array.isArray(targetStudent.profiles)
              ? targetStudent.profiles[0]
              : targetStudent.profiles
            const targetClass: any = Array.isArray(targetStudent.classes)
              ? targetStudent.classes[0]
              : targetStudent.classes
            const targetSection: any = Array.isArray(targetStudent.sections)
              ? targetStudent.sections[0]
              : targetStudent.sections

            activeStudent = {
              id: targetStudent.id,
              profile_id: targetStudent.profile_id,
              full_name: targetProfile?.full_name || 'Student',
              avatar_url: targetProfile?.avatar_url || null,
              is_active: targetProfile?.is_active ?? true,
              class_name: targetClass?.name || 'N/A',
              section_name: targetSection?.name || 'N/A',
              class_id: targetStudent.class_id,
              section_id: targetStudent.section_id,
              admission_no: targetStudent.admission_no,
              phone: targetProfile?.phone || null,
              date_of_birth: targetStudent.date_of_birth || null,
              gender: targetStudent.gender || null,
              address: targetStudent.address || null,
              school_id: targetStudent.school_id,
              relation: targetLink.relation,
            }
          }
        }
      } else {
        // User is student (or admin/teacher previewing)
        const { data: studentRecord } = await supabase
          .from('students')
          .select(`
            id,
            profile_id,
            admission_no,
            class_id,
            section_id,
            date_of_birth,
            gender,
            address,
            school_id,
            classes:class_id(id, name),
            sections:section_id(id, name),
            profiles:profile_id(full_name, phone, avatar_url, is_active)
          `)
          .eq('profile_id', user.id)
          .single()

        if (studentRecord) {
          const sr: any = studentRecord
          const p = Array.isArray(sr.profiles) ? sr.profiles[0] : sr.profiles
          const c = Array.isArray(sr.classes) ? sr.classes[0] : sr.classes
          const sec = Array.isArray(sr.sections) ? sr.sections[0] : sr.sections

          activeStudent = {
            id: sr.id,
            profile_id: sr.profile_id,
            full_name: p?.full_name || userProfile?.full_name || 'Student',
            avatar_url: p?.avatar_url || null,
            is_active: p?.is_active ?? true,
            class_name: c?.name || 'N/A',
            section_name: sec?.name || 'N/A',
            class_id: sr.class_id,
            section_id: sr.section_id,
            admission_no: sr.admission_no,
            phone: p?.phone || null,
            date_of_birth: sr.date_of_birth || null,
            gender: sr.gender || null,
            address: sr.address || null,
            school_id: sr.school_id,
          }
        }
      }
    }

    // If activeStudent could not be resolved from auth session, fallback to seeded student
    if (!activeStudent) {
      if (preferredStudentId === SEED_STUDENT_3.id) {
        activeStudent = SEED_STUDENT_3
      } else {
        activeStudent = SEED_STUDENT_1
      }
    }

    // Default linked children fallback for parent demo if session is simulated or empty
    if (linkedChildren.length === 0 && (isParent || preferredStudentId === SEED_STUDENT_3.id)) {
      linkedChildren = [
        {
          id: SEED_STUDENT_1.id,
          full_name: SEED_STUDENT_1.full_name,
          admission_no: SEED_STUDENT_1.admission_no,
          class_name: SEED_STUDENT_1.class_name,
          section_name: SEED_STUDENT_1.section_name,
          avatar_url: SEED_STUDENT_1.avatar_url,
          relation: 'father',
        },
        {
          id: SEED_STUDENT_3.id,
          full_name: SEED_STUDENT_3.full_name,
          admission_no: SEED_STUDENT_3.admission_no,
          class_name: SEED_STUDENT_3.class_name,
          section_name: SEED_STUDENT_3.section_name,
          avatar_url: SEED_STUDENT_3.avatar_url,
          relation: 'father',
        },
      ]
    }

    // 2. Fetch Circulars (Targeted at school-wide OR this specific class)
    let circulars: CircularItem[] = []
    try {
      let query = supabase
        .from('circulars')
        .select('id, title, description, category, target_class_id, created_at')
        .order('created_at', { ascending: false })
        .limit(3)

      if (activeStudent.class_id) {
        query = query.or(`target_class_id.is.null,target_class_id.eq.${activeStudent.class_id}`)
      } else {
        query = query.is('target_class_id', null)
      }

      const { data: circData, error: circError } = await query

      if (!circError && circData && circData.length > 0) {
        circulars = circData as CircularItem[]
      } else {
        // Fallback filter
        circulars = SEED_CIRCULARS_ALL.filter(
          (c) => !c.target_class_id || c.target_class_id === activeStudent?.class_id
        ).slice(0, 3)
      }
    } catch {
      circulars = SEED_CIRCULARS_ALL.filter(
        (c) => !c.target_class_id || c.target_class_id === activeStudent?.class_id
      ).slice(0, 3)
    }

    // 3. Fetch Homework & Status
    let homework: HomeworkItem[] = []
    try {
      if (activeStudent.class_id) {
        const { data: hwData, error: hwError } = await supabase
          .from('homework')
          .select(`
            id,
            subject,
            title,
            description,
            type,
            due_date,
            created_at,
            homework_status(status, student_id)
          `)
          .eq('class_id', activeStudent.class_id)
          .order('due_date', { ascending: false })
          .limit(5)

        if (!hwError && hwData && hwData.length > 0) {
          homework = hwData.map((h: any) => {
            const statusList = Array.isArray(h.homework_status) ? h.homework_status : []
            const studentStatus = statusList.find(
              (s: any) => s.student_id === activeStudent?.id
            )
            return {
              id: h.id,
              subject: h.subject,
              title: h.title,
              description: h.description,
              type: h.type,
              due_date: h.due_date,
              created_at: h.created_at,
              status: (studentStatus?.status as 'pending' | 'submitted' | 'late') || 'pending',
            }
          })
        } else {
          homework = SEED_HOMEWORK_ITEMS[activeStudent.id] || []
        }
      } else {
        homework = SEED_HOMEWORK_ITEMS[activeStudent.id] || []
      }
    } catch {
      homework = SEED_HOMEWORK_ITEMS[activeStudent.id] || []
    }

    // 4. Fetch Calendar Events (Next 30 days)
    let calendarEvents: CalendarEventItem[] = []
    try {
      const todayStr = format(new Date(), 'yyyy-MM-dd')
      const thirtyDaysAheadStr = format(addDays(new Date(), 30), 'yyyy-MM-dd')

      const { data: calData, error: calError } = await supabase
        .from('calendar_events')
        .select('id, title, event_type, start_date, end_date, description')
        .gte('end_date', todayStr)
        .lte('start_date', thirtyDaysAheadStr)
        .order('start_date', { ascending: true })

      if (!calError && calData && calData.length > 0) {
        calendarEvents = calData as CalendarEventItem[]
      } else {
        calendarEvents = SEED_CALENDAR_EVENTS
      }
    } catch {
      calendarEvents = SEED_CALENDAR_EVENTS
    }

    // 5. Fetch Achievements / Remarks
    let achievements: AchievementRemarkItem[] = []
    try {
      const { data: remData, error: remError } = await supabase
        .from('remarks')
        .select(`
          id,
          remark_text,
          remark_type,
          created_at,
          profiles:given_by(full_name)
        `)
        .eq('student_id', activeStudent.id)
        .order('created_at', { ascending: false })

      if (!remError && remData && remData.length > 0) {
        achievements = remData.map((r: any) => {
          const prof = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles
          return {
            id: r.id,
            remark_text: r.remark_text,
            remark_type: r.remark_type,
            created_at: r.created_at,
            given_by_name: prof?.full_name || 'Class Teacher',
          }
        })
      } else {
        achievements = SEED_ACHIEVEMENTS[activeStudent.id] || []
      }
    } catch {
      achievements = SEED_ACHIEVEMENTS[activeStudent.id] || []
    }

    return {
      student: activeStudent,
      isParent,
      linkedChildren,
      circulars,
      homework,
      calendarEvents,
      achievements,
    }
  } catch (err) {
    console.error('fetchStudentDashboardData failed, using fallback:', err)
    const activeStudent = preferredStudentId === SEED_STUDENT_3.id ? SEED_STUDENT_3 : SEED_STUDENT_1

    return {
      student: activeStudent,
      isParent: true,
      linkedChildren: [
        {
          id: SEED_STUDENT_1.id,
          full_name: SEED_STUDENT_1.full_name,
          admission_no: SEED_STUDENT_1.admission_no,
          class_name: SEED_STUDENT_1.class_name,
          section_name: SEED_STUDENT_1.section_name,
          avatar_url: SEED_STUDENT_1.avatar_url,
          relation: 'father',
        },
        {
          id: SEED_STUDENT_3.id,
          full_name: SEED_STUDENT_3.full_name,
          admission_no: SEED_STUDENT_3.admission_no,
          class_name: SEED_STUDENT_3.class_name,
          section_name: SEED_STUDENT_3.section_name,
          avatar_url: SEED_STUDENT_3.avatar_url,
          relation: 'father',
        },
      ],
      circulars: SEED_CIRCULARS_ALL.filter(
        (c) => !c.target_class_id || c.target_class_id === activeStudent.class_id
      ).slice(0, 3),
      homework: SEED_HOMEWORK_ITEMS[activeStudent.id] || [],
      calendarEvents: SEED_CALENDAR_EVENTS,
      achievements: SEED_ACHIEVEMENTS[activeStudent.id] || [],
    }
  }
}
