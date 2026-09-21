/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET  /api/library/books  — list books (with optional search)
 * POST /api/library/books  — add a new book
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(req.url)
    const schoolId = searchParams.get('school_id') || '11111111-1111-1111-1111-111111111111'
    const search = searchParams.get('search') || ''

    let query = supabase
      .from('library_books')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })
      .limit(100)

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,author.ilike.%${search}%,accession_no.ilike.%${search}%,subject.ilike.%${search}%`
      )
    }

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ books: data || [] })
  } catch (err: any) {
    return NextResponse.json({ books: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const body = await req.json()
    const { title, author, publisher, subject, book_type, total_copies, accession_no, school_id } = body

    if (!title || !author || !accession_no) {
      return NextResponse.json({ error: 'Title, author, and accession_no are required' }, { status: 400 })
    }

    const schoolId = school_id || '11111111-1111-1111-1111-111111111111'
    const copies = Math.max(1, parseInt(total_copies) || 1)

    try {
      const { data, error } = await supabase
        .from('library_books')
        .insert({
          school_id: schoolId,
          accession_no: accession_no.trim().toUpperCase(),
          title,
          author,
          publisher: publisher || null,
          subject: subject || null,
          book_type: book_type || 'Textbook',
          total_copies: copies,
          available_copies: copies,
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          return NextResponse.json({ error: `Accession No "${accession_no}" already exists in this school` }, { status: 409 })
        }
        throw error
      }

      return NextResponse.json({ success: true, book: data })
    } catch (err: any) {
      if (err?.code === '23505') {
        return NextResponse.json({ error: `Accession No "${accession_no}" already exists` }, { status: 409 })
      }
      throw err
    }
  } catch (err: any) {
    console.error('POST /api/library/books error:', err)
    return NextResponse.json({ error: err?.message || 'Failed to add book' }, { status: 500 })
  }
}
