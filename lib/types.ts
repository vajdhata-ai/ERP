// Shared TypeScript types for Vajdhata School ERP
// Will be populated in Stage 1 and later stages
export type Role = 'admin' | 'teacher' | 'student' | 'librarian' | 'accountant';

export interface UserProfile {
  id: string;
  school_id: string;
  role: Role;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  created_at: string;
}
