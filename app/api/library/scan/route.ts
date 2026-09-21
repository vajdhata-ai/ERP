/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/library/scan
 * Handles barcode scan — issues or returns a book.
 * Body: { accession_no, student_identifier, school_id }
 * If book has no active transaction → issue to student
 * If book has active transaction  → return it + calculate fine
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const body = await req.json()
    const { accession_no, student_identifier, school_id } = body

    if (!accession_no) {
      return NextResponse.json({ error: 'Accession number is required' }, { status: 400 })
    }

    const schoolId = school_id || '11111111-1111-1111-1111-111111111111'
    const normalizedAccession = accession_no.trim().toUpperCase()

    // 1. Look up book
    const { data: book, error: bookErr } = await supabase
      .from('library_books')
      .select('*')
      .eq('school_id', schoolId)
      .eq('accession_no', normalizedAccession)
      .single()

    if (bookErr || !book) {
      return NextResponse.json({
        success: false,
        action: 'error',
        message: `Book with accession number "${normalizedAccession}" not found in catalog.`,
        isError: true,
      }, { status: 404 })
    }

    // 2. Check for active transaction
    const { data: activeTx } = await supabase
      .from('library_transactions')
      .select('*, students(admission_no, profiles(full_name))')
      .eq('book_id', book.id)
      .eq('school_id', schoolId)
      .is('returned_at', null)
      .order('issued_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (activeTx) {
      // ── RETURN FLOW ──────────────────────────────────────────────────────
      const now = new Date().toISOString()
      const dueAt = new Date(activeTx.due_at)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      dueAt.setHours(0, 0, 0, 0)

      let finePaise = 0
      let newStatus: 'returned' | 'overdue' = 'returned'

      if (today > dueAt) {
        const daysLate = Math.floor((today.getTime() - dueAt.getTime()) / 86400000)
        finePaise = daysLate * 200 // ₹2/day
        newStatus = 'returned'
      }

      // Update transaction
      const { data: updatedTx, error: updateErr } = await supabase
        .from('library_transactions')
        .update({
          returned_at: now,
          status: newStatus,
          fine_paise: finePaise,
          updated_at: now,
        })
        .eq('id', activeTx.id)
        .select()
        .single()

      if (updateErr) throw updateErr

      // Increment available_copies
      await supabase
        .from('library_books')
        .update({ available_copies: book.available_copies + 1, updated_at: now })
        .eq('id', book.id)

      const studentName = (activeTx.students as any)?.profiles?.full_name || 'Student'

      return NextResponse.json({
        success: true,
        action: 'return',
        book: { ...book, available_copies: book.available_copies + 1 },
        transaction: updatedTx,
        message: finePaise > 0
          ? `✅ Returned: "${book.title}" from ${studentName}. Fine: ₹${finePaise / 100} (${Math.floor(finePaise / 200)} days late)`
          : `✅ Returned: "${book.title}" from ${studentName}. No fine.`,
      })
    } else {
      // ── ISSUE FLOW ───────────────────────────────────────────────────────
      if (book.available_copies <= 0) {
        return NextResponse.json({
          success: false,
          action: 'error',
          message: `❌ No copies available for "${book.title}". All ${book.total_copies} copies are currently issued.`,
          isError: true,
        })
      }

      if (!student_identifier) {
        return NextResponse.json({
          success: false,
          action: 'need_student',
          book,
          message: `Book "${book.title}" found. Please enter student ID or admission number to issue.`,
        })
      }

      // Look up student by admission_no or profile ID
      const { data: student, error: studentErr } = await supabase
        .from('students')
        .select('id, admission_no, profiles(full_name)')
        .eq('school_id', schoolId)
        .or(`admission_no.eq.${student_identifier},profile_id.eq.${student_identifier}`)
        .maybeSingle()

      if (studentErr || !student) {
        return NextResponse.json({
          success: false,
          action: 'error',
          message: `❌ Student "${student_identifier}" not found. Please check the admission number.`,
          isError: true,
        })
      }

      const now = new Date()
      const dueAt = new Date(now.getTime() + 14 * 86400000) // 14 days default

      const { data: newTx, error: txErr } = await supabase
        .from('library_transactions')
        .insert({
          school_id: schoolId,
          book_id: book.id,
          student_id: student.id,
          issued_at: now.toISOString(),
          due_at: dueAt.toISOString(),
          status: 'issued',
          fine_paise: 0,
        })
        .select()
        .single()

      if (txErr) throw txErr

      // Decrement available_copies
      await supabase
        .from('library_books')
        .update({ available_copies: book.available_copies - 1, updated_at: now.toISOString() })
        .eq('id', book.id)

      const studentName = (student.profiles as any)?.full_name || student_identifier

      return NextResponse.json({
        success: true,
        action: 'issue',
        book: { ...book, available_copies: book.available_copies - 1 },
        transaction: { ...newTx, book_title: book.title, student_name: studentName },
        message: `✅ Issued: "${book.title}" to ${studentName}. Due: ${dueAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`,
      })
    }
  } catch (err: any) {
    console.error('Library scan error:', err)
    return NextResponse.json({
      success: false,
      action: 'error',
      message: `Server error: ${err?.message || 'Unknown error'}`,
      isError: true,
    }, { status: 500 })
  }
}
