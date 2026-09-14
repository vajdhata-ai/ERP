// Shared TypeScript types for Vajdhata School ERP

export type UserRole =
  | 'super_admin'
  | 'school_admin'
  | 'teacher'
  | 'student'
  | 'parent'
  | 'accountant'
  | 'librarian';

// Backward compatibility alias
export type Role = UserRole;

export interface School {
  id: string;
  name: string;
  school_code: string;
  address?: string | null;
  logo_url?: string | null;
  subscription_plan: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  school_id: string | null;
  full_name: string;
  role: UserRole;
  phone?: string | null;
  avatar_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  schools?: School | null;
  class_name?: string | null;
  section_name?: string | null;
}

export interface NotificationItem {
  id: string;
  school_id: string;
  profile_id: string;
  title: string;
  body: string;
  type: string; // 'fee' | 'homework' | 'attendance' | 'transport' | 'circular' | 'system'
  is_read: boolean;
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type?: 'holiday' | 'exam' | 'event' | 'meeting' | 'general';
  description?: string;
}

