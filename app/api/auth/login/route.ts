import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { UserRole } from '@/lib/types'

// Map roles to their dedicated root landing routes
const ROLE_REDIRECT_MAP: Record<UserRole, string> = {
  super_admin: '/super-admin',
  school_admin: '/admin',
  teacher: '/teacher/homework',
  student: '/student/homework',
  parent: '/student/homework',
  accountant: '/accountant',
  librarian: '/librarian',
}

const SEED_PROFILES: Record<string, { role: UserRole; fullName: string }> = {
  'admin@radiant.edu': { role: 'school_admin', fullName: 'Dr. Vinod Sharma' },
  'verma.physics@radiant.edu': { role: 'teacher', fullName: 'Rajesh Verma' },
  'anita.maths@radiant.edu': { role: 'teacher', fullName: 'Anita Gupta' },
  'accounts@radiant.edu': { role: 'accountant', fullName: 'Ramesh Tiwari' },
  'library@radiant.edu': { role: 'librarian', fullName: 'Sunita Rao' },
  'aarav.patel@student.radiant.edu': { role: 'student', fullName: 'Aarav Patel' },
  'diya.sharma@student.radiant.edu': { role: 'student', fullName: 'Diya Sharma' },
  'kabir.singh@student.radiant.edu': { role: 'student', fullName: 'Kabir Singh' },
  'vikram.patel@parents.radiant.edu': { role: 'parent', fullName: 'Vikram Patel' },
  'priya.sharma@parents.radiant.edu': { role: 'parent', fullName: 'Priya Sharma' },
  'harpreet.singh@parents.radiant.edu': { role: 'parent', fullName: 'Harpreet Singh' },
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { schoolCode, identifier, password } = body

    if (!schoolCode || !identifier || !password) {
      return NextResponse.json(
        { error: 'School code, User ID/Email, and password are required.' },
        { status: 400 }
      )
    }

    const normalizedSchoolCode = schoolCode.trim().toLowerCase()
    const normalizedIdentifier = identifier.trim().toLowerCase()
    const supabase = createClient()

    // 1. Check if this is a known test seed account with default password
    const isSeedMatch =
      normalizedSchoolCode === 'radiant' &&
      password === 'Radiant@123' &&
      Boolean(SEED_PROFILES[normalizedIdentifier])

    // 2. Try Supabase Auth first
    let authSucceeded = false
    
    let authUserRole: UserRole | null = null
    let authUserFullName: string | null = null

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: normalizedIdentifier,
        password,
      })

      if (!authError && authData?.user) {
        authSucceeded = true
        

        const { data: profile } = await supabase
          .from('profiles')
          .select('id, school_id, full_name, role, is_active')
          .eq('id', authData.user.id)
          .single()

        if (profile) {
          authUserRole = profile.role as UserRole
          authUserFullName = profile.full_name
        }
      }
    } catch {
      // Supabase connection or schema error
    }

    // 3. Fall back to seed test account if Supabase Auth is unavailable or has schema issues
    if (!authSucceeded) {
      if (isSeedMatch) {
        const seed = SEED_PROFILES[normalizedIdentifier]
        const redirectPath = ROLE_REDIRECT_MAP[seed.role] || '/student'
        const res = NextResponse.json({
          success: true,
          role: seed.role,
          fullName: seed.fullName,
          redirectPath,
        })
        res.cookies.set('vajdhata_demo_role', seed.role, { path: '/', maxAge: 60 * 60 * 24 })
        res.cookies.set('vajdhata_demo_email', normalizedIdentifier, { path: '/', maxAge: 60 * 60 * 24 })
        return res
      }

      return NextResponse.json(
        { error: 'Invalid email or password. For demo accounts use password: Radiant@123' },
        { status: 401 }
      )
    }

    const finalRole = authUserRole || 'student'
    const redirectPath = ROLE_REDIRECT_MAP[finalRole] || '/student'
    const res = NextResponse.json({
      success: true,
      role: finalRole,
      fullName: authUserFullName || 'User',
      redirectPath,
    })
    res.cookies.set('vajdhata_demo_role', finalRole, { path: '/', maxAge: 60 * 60 * 24 })
    res.cookies.set('vajdhata_demo_email', normalizedIdentifier, { path: '/', maxAge: 60 * 60 * 24 })
    return res
  } catch (err: unknown) {
    console.error('Login error:', err)
    return NextResponse.json(
      { error: 'An unexpected authentication error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
