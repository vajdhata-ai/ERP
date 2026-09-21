/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * lib/data/library.ts
 * ============================================================================
 * Types, helpers, and localStorage seed for Stage 9 — Library Module
 * ============================================================================
 */

import { SupabaseClient } from '@supabase/supabase-js'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LibraryBook {
  id: string
  school_id: string
  accession_no: string // Barcode value
  title: string
  author: string
  publisher?: string | null
  subject?: string | null
  book_type: string // Textbook, Fiction, Reference, etc.
  total_copies: number
  available_copies: number
  created_at: string
}

export interface LibraryTransaction {
  id: string
  school_id: string
  book_id: string
  book_title?: string
  book_accession_no?: string
  student_id: string
  student_name?: string
  admission_no?: string
  issued_at: string
  due_at: string
  returned_at: string | null
  status: 'issued' | 'returned' | 'overdue'
  fine_paise: number // ₹2/day overdue
  sr_no?: number
}

export type ScanAction = 'issue' | 'return'

export interface ScanResult {
  success: boolean
  action: ScanAction
  book?: LibraryBook
  transaction?: LibraryTransaction
  message: string
  isError?: boolean
}

// ─── Fine calculation ─────────────────────────────────────────────────────────

/** Rs 2/day overdue fine */
export function computeLibraryFine(dueAt: string, returnedAt?: string | null): number {
  const today = returnedAt ? new Date(returnedAt) : new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueAt)
  due.setHours(0, 0, 0, 0)
  if (due >= today) return 0
  const days = Math.floor((today.getTime() - due.getTime()) / 86400000)
  return days * 200 // 200 paise per day = ₹2/day
}

export function isOverdue(dueAt: string, returnedAt?: string | null): boolean {
  if (returnedAt) return false
  return new Date(dueAt) < new Date()
}

// ─── LocalStorage seed ────────────────────────────────────────────────────────

const BOOKS_KEY = 'vajdhata_library_books_v1'
const TRANSACTIONS_KEY = 'vajdhata_library_transactions_v1'

export const SEED_BOOKS: LibraryBook[] = [
  {
    id: 'aaaaaaaa-bbbb-cccc-dddd-111111111111',
    school_id: '11111111-1111-1111-1111-111111111111',
    accession_no: 'PHY001',
    title: 'Concepts of Physics Vol 1',
    author: 'H.C. Verma',
    publisher: 'Bharati Bhawan',
    subject: 'Physics',
    book_type: 'Textbook',
    total_copies: 5,
    available_copies: 4,
    created_at: new Date(Date.now() - 100 * 86400000).toISOString(),
  },
  {
    id: 'aaaaaaaa-bbbb-cccc-dddd-222222222222',
    school_id: '11111111-1111-1111-1111-111111111111',
    accession_no: 'MATH001',
    title: 'R.D. Sharma Mathematics Class XII',
    author: 'R.D. Sharma',
    publisher: 'Dhanpat Rai',
    subject: 'Mathematics',
    book_type: 'Textbook',
    total_copies: 3,
    available_copies: 3,
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
  {
    id: 'aaaaaaaa-bbbb-cccc-dddd-333333333333',
    school_id: '11111111-1111-1111-1111-111111111111',
    accession_no: 'ENG001',
    title: 'Wings of Fire',
    author: 'A.P.J. Abdul Kalam',
    publisher: 'Universities Press',
    subject: 'English',
    book_type: 'Fiction',
    total_copies: 2,
    available_copies: 1,
    created_at: new Date(Date.now() - 80 * 86400000).toISOString(),
  },
  {
    id: 'aaaaaaaa-bbbb-cccc-dddd-444444444444',
    school_id: '11111111-1111-1111-1111-111111111111',
    accession_no: 'CHEM001',
    title: 'NCERT Chemistry Part I Class XII',
    author: 'NCERT',
    publisher: 'NCERT',
    subject: 'Chemistry',
    book_type: 'Textbook',
    total_copies: 8,
    available_copies: 7,
    created_at: new Date(Date.now() - 70 * 86400000).toISOString(),
  },
  {
    id: 'aaaaaaaa-bbbb-cccc-dddd-555555555555',
    school_id: '11111111-1111-1111-1111-111111111111',
    accession_no: 'BIO001',
    title: 'NCERT Biology Class XII',
    author: 'NCERT',
    publisher: 'NCERT',
    subject: 'Biology',
    book_type: 'Textbook',
    total_copies: 6,
    available_copies: 5,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
]

export const SEED_TRANSACTIONS: LibraryTransaction[] = [
  {
    id: 'tx-0001-0000-0000-0000-000000000001',
    school_id: '11111111-1111-1111-1111-111111111111',
    book_id: 'aaaaaaaa-bbbb-cccc-dddd-111111111111',
    book_title: 'Concepts of Physics Vol 1',
    book_accession_no: 'PHY001',
    student_id: '44444444-4444-4444-4444-444444444441',
    student_name: 'Aarav Patel',
    admission_no: '4754',
    issued_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    due_at: new Date(Date.now() - 6 * 86400000).toISOString(), // overdue
    returned_at: null,
    status: 'overdue',
    fine_paise: 0, // will be computed on render
    sr_no: 1,
  },
  {
    id: 'tx-0001-0000-0000-0000-000000000002',
    school_id: '11111111-1111-1111-1111-111111111111',
    book_id: 'aaaaaaaa-bbbb-cccc-dddd-333333333333',
    book_title: 'Wings of Fire',
    book_accession_no: 'ENG001',
    student_id: '44444444-4444-4444-4444-444444444441',
    student_name: 'Aarav Patel',
    admission_no: '4754',
    issued_at: new Date(Date.now() - 50 * 86400000).toISOString(),
    due_at: new Date(Date.now() - 36 * 86400000).toISOString(),
    returned_at: new Date(Date.now() - 38 * 86400000).toISOString(),
    status: 'returned',
    fine_paise: 0,
    sr_no: 2,
  },
]

export function getLocalBooks(): LibraryBook[] {
  if (typeof window === 'undefined') return SEED_BOOKS
  try {
    const raw = localStorage.getItem(BOOKS_KEY)
    if (!raw) { localStorage.setItem(BOOKS_KEY, JSON.stringify(SEED_BOOKS)); return SEED_BOOKS }
    return JSON.parse(raw)
  } catch { return SEED_BOOKS }
}

export function saveLocalBooks(books: LibraryBook[]): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(BOOKS_KEY, JSON.stringify(books)) } catch { /* noop */ }
}

export function getLocalTransactions(): LibraryTransaction[] {
  if (typeof window === 'undefined') return SEED_TRANSACTIONS
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY)
    if (!raw) { localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(SEED_TRANSACTIONS)); return SEED_TRANSACTIONS }
    return JSON.parse(raw)
  } catch { return SEED_TRANSACTIONS }
}

export function saveLocalTransactions(txns: LibraryTransaction[]): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txns)) } catch { /* noop */ }
}

// ─── Supabase helpers ─────────────────────────────────────────────────────────

export async function fetchBookByAccessionNo(
  supabase: SupabaseClient,
  accessionNo: string,
  schoolId: string
): Promise<LibraryBook | null> {
  try {
    const { data, error } = await supabase
      .from('library_books')
      .select('*')
      .eq('school_id', schoolId)
      .eq('accession_no', accessionNo.trim().toUpperCase())
      .single()

    if (error || !data) return null
    return data as LibraryBook
  } catch {
    // Fallback to seed data
    return getLocalBooks().find(
      b => b.accession_no.toUpperCase() === accessionNo.trim().toUpperCase()
    ) || null
  }
}

export async function fetchActiveTransactionForBook(
  supabase: SupabaseClient,
  bookId: string,
  schoolId: string
): Promise<LibraryTransaction | null> {
  try {
    const { data, error } = await supabase
      .from('library_transactions')
      .select('*, library_books(title, accession_no), students(admission_no, profiles(full_name))')
      .eq('book_id', bookId)
      .eq('school_id', schoolId)
      .is('returned_at', null)
      .order('issued_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) return null
    return data as any
  } catch {
    return getLocalTransactions().find(
      t => t.book_id === bookId && !t.returned_at
    ) || null
  }
}

/** Generate next accession number: school prefix + sequential */
export function generateNextAccessionNo(existingBooks: LibraryBook[], prefix = ''): string {
  const nums = existingBooks
    .map(b => {
      const match = b.accession_no.replace(prefix, '').match(/\d+/)
      return match ? parseInt(match[0], 10) : 0
    })
    .filter(n => !isNaN(n))
  const max = nums.length > 0 ? Math.max(...nums) : 0
  const next = max + 1
  return `${prefix}${String(next).padStart(3, '0')}`
}
