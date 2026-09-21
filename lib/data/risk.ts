// lib/data/risk.ts

export type FeeRiskStudent = {
  id: string
  student_name: string
  class: string
  amount_due: number
  due_date: string
  days_overdue: number
  parent_phone: string
}

export type AttendanceRiskStudent = {
  id: string
  student_name: string
  class: string
  current_percentage: number
  previous_percentage: number
  trend: 'improving' | 'declining' | 'stable'
}

export const DEMO_FEE_RISKS: FeeRiskStudent[] = [
  { id: 'f1', student_name: 'Rahul Verma', class: '10-A', amount_due: 45000, due_date: '2026-09-01', days_overdue: 20, parent_phone: '+919876543210' },
  { id: 'f2', student_name: 'Sneha Kapoor', class: '8-B', amount_due: 32000, due_date: '2026-09-10', days_overdue: 11, parent_phone: '+919876543211' },
  { id: 'f3', student_name: 'Vikram Singh', class: '12-Sci', amount_due: 55000, due_date: '2026-09-15', days_overdue: 6, parent_phone: '+919876543212' },
  { id: 'f4', student_name: 'Aditi Rao', class: '5-C', amount_due: 28000, due_date: '2026-09-25', days_overdue: -4, parent_phone: '+919876543213' }, // Due in next 7 days
]

export const DEMO_ATTENDANCE_RISKS: AttendanceRiskStudent[] = [
  { id: 'a1', student_name: 'Karan Mehra', class: '10-A', current_percentage: 68, previous_percentage: 75, trend: 'declining' },
  { id: 'a2', student_name: 'Neha Gupta', class: '9-C', current_percentage: 72, previous_percentage: 80, trend: 'declining' },
  { id: 'a3', student_name: 'Rohan Das', class: '11-Com', current_percentage: 74, previous_percentage: 65, trend: 'improving' },
]

export function getLocalFeeRisks() {
  return DEMO_FEE_RISKS.sort((a, b) => b.days_overdue - a.days_overdue) // Sort worst first
}

export function getLocalAttendanceRisks(threshold: number = 75) {
  return DEMO_ATTENDANCE_RISKS.filter(s => s.current_percentage < threshold)
}
