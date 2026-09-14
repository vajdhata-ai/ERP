import {
  LayoutDashboard,
  CalendarCheck,
  MessageSquare,
  Clock,
  BookOpen,
  Laptop,
  CreditCard,
  GraduationCap,
  Calendar,
  Image,
  Library,
  Bus,
  HeartPulse,
  Users,
  UserCheck,
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  DollarSign,
  type LucideIcon,
} from 'lucide-react'
import { UserRole } from '@/lib/types'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: string
}

// Student/Parent exact groupings:
// Dashboard, My Attendance, Communication, Time Table, Homework/Assignments,
// Digital Learning, Fee, Result, School Calendar, Image Gallery,
// Transactions (Library), Transport, Infirmary.
export const STUDENT_PARENT_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/student', icon: LayoutDashboard },
  { label: 'My Attendance', href: '/student/attendance', icon: CalendarCheck },
  { label: 'Communication', href: '/student/communication', icon: MessageSquare },
  { label: 'Time Table', href: '/student/timetable', icon: Clock },
  { label: 'Homework/Assignments', href: '/student/homework', icon: BookOpen },
  { label: 'Digital Learning', href: '/student/digital-learning', icon: Laptop },
  { label: 'Fee', href: '/student/fee', icon: CreditCard },
  { label: 'Result', href: '/student/result', icon: GraduationCap },
  { label: 'School Calendar', href: '/student/calendar', icon: Calendar },
  { label: 'Image Gallery', href: '/student/gallery', icon: Image },
  { label: 'Transactions (Library)', href: '/student/transactions', icon: Library },
  { label: 'Transport', href: '/student/transport', icon: Bus },
  { label: 'Infirmary', href: '/student/infirmary', icon: HeartPulse },
]

// Teacher exact groupings:
// Dashboard, Attendance, Homework, Marks Entry, Communication, Gallery, Remarks, Time Table.
export const TEACHER_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
  { label: 'Attendance', href: '/teacher/attendance', icon: CalendarCheck },
  { label: 'Homework', href: '/teacher/homework', icon: BookOpen },
  { label: 'Marks Entry', href: '/teacher/marks-entry', icon: GraduationCap },
  { label: 'Communication', href: '/teacher/communication', icon: MessageSquare },
  { label: 'Gallery', href: '/teacher/gallery', icon: Image },
  { label: 'Remarks', href: '/teacher/remarks', icon: FileSpreadsheet },
  { label: 'Time Table', href: '/teacher/timetable', icon: Clock },
]

// School Admin exact groupings:
// Dashboard, Students, Staff, Fee Management, Risk Dashboard, Communication,
// Library, Transport, Calendar, Reports.
export const SCHOOL_ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Students', href: '/admin/students', icon: Users },
  { label: 'Staff', href: '/admin/staff', icon: UserCheck },
  { label: 'Fee Management', href: '/admin/fee-management', icon: DollarSign },
  { label: 'Risk Dashboard', href: '/admin/risk-dashboard', icon: AlertTriangle },
  { label: 'Communication', href: '/admin/communication', icon: MessageSquare },
  { label: 'Library', href: '/admin/library', icon: Library },
  { label: 'Transport', href: '/admin/transport', icon: Bus },
  { label: 'Calendar', href: '/admin/calendar', icon: Calendar },
  { label: 'Reports', href: '/admin/reports', icon: FileText },
]

// Super Admin Navigation
export const SUPER_ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/super-admin', icon: LayoutDashboard },
  { label: 'Schools Management', href: '/super-admin#schools', icon: ShieldCheck },
  { label: 'Global Audit Logs', href: '/super-admin#audit', icon: FileText },
]

// Accountant Navigation
export const ACCOUNTANT_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/accountant', icon: LayoutDashboard },
  { label: 'Fee Invoices', href: '/accountant/invoices', icon: DollarSign },
  { label: 'Transactions', href: '/accountant/transactions', icon: CreditCard },
  { label: 'Reports', href: '/accountant/reports', icon: FileSpreadsheet },
]

// Librarian Navigation
export const LIBRARIAN_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/librarian', icon: LayoutDashboard },
  { label: 'Book Catalog', href: '/librarian/catalog', icon: Library },
  { label: 'Issue & Returns', href: '/librarian/circulation', icon: BookOpen },
]

export function getNavigationForRole(role: UserRole): NavItem[] {
  switch (role) {
    case 'student':
    case 'parent':
      return STUDENT_PARENT_NAV
    case 'teacher':
      return TEACHER_NAV
    case 'school_admin':
      return SCHOOL_ADMIN_NAV
    case 'super_admin':
      return SUPER_ADMIN_NAV
    case 'accountant':
      return ACCOUNTANT_NAV
    case 'librarian':
      return LIBRARIAN_NAV
    default:
      return STUDENT_PARENT_NAV
  }
}
