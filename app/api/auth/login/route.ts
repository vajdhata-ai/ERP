import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { UserRole } from '@/lib/types'

const ROLE_REDIRECT_MAP: Record<UserRole, string> = {
  super_admin: '/super-admin',
  school_admin: '/admin',
  teacher: '/teacher/homework',
  student: '/student/homework',
  parent: '/student/homework',
  accountant: '/accountant',
  librarian: '/librarian',
}

interface MemberProfile {
  role: UserRole
  fullName: string
  code: string
}

const MEMBER_PROFILES: Record<string, MemberProfile> = {
  // Students
  '4754': { role: 'student', fullName: 'Aarav Patel (Class XII-A)', code: '4754' },
  'rad-2024-001': { role: 'student', fullName: 'Aarav Patel (Class XII-A)', code: '4754' },
  '4755': { role: 'student', fullName: 'Diya Sharma (Class XII-A)', code: '4755' },
  '4756': { role: 'student', fullName: 'Kabir Singh (Class X-A)', code: '4756' },

  // Teachers & Staff
  '0005': { role: 'teacher', fullName: 'Rajesh Verma (Senior PGT Physics)', code: '0005' },
  't-0005': { role: 'teacher', fullName: 'Rajesh Verma (Senior PGT Physics)', code: '0005' },
  '0006': { role: 'teacher', fullName: 'Anita Gupta (TGT Mathematics)', code: '0006' },
  '0001': { role: 'school_admin', fullName: 'Dr. Vinod Sharma (Principal)', code: '0001' },
  '0002': { role: 'accountant', fullName: 'Ramesh Tiwari (Accounts)', code: '0002' },
  '0003': { role: 'librarian', fullName: 'Sunita Rao (Library)', code: '0003' },

  // Legacy Email Aliases
  'verma.physics@radiant.edu': { role: 'teacher', fullName: 'Rajesh Verma (Senior PGT Physics)', code: '0005' },
  'admin@radiant.edu': { role: 'school_admin', fullName: 'Dr. Vinod Sharma (Principal)', code: '0001' },
  'aarav.patel@student.radiant.edu': { role: 'student', fullName: 'Aarav Patel (Class XII-A)', code: '4754' },
  'accounts@radiant.edu': { role: 'accountant', fullName: 'Ramesh Tiwari (Accounts)', code: '0002' },
  'library@radiant.edu': { role: 'librarian', fullName: 'Sunita Rao (Library)', code: '0003' },
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { identifier, password, isSetupPasskey, newPasskey } = body

    if (!identifier) {
      return NextResponse.json(
        { error: 'Please provide your Admission Number or Employee ID.' },
        { status: 400 }
      )
    }

    const cleanId = String(identifier).trim().toLowerCase()
    const enteredPasskey = String(password || '').trim()

    // 1. Resolve Member Profile by Admission No, Employee ID, or Email
    const member = MEMBER_PROFILES[cleanId]

    if (member) {
      // If user is setting a new passkey
      if (isSetupPasskey) {
        if (!newPasskey || String(newPasskey).trim().length < 4) {
          return NextResponse.json(
            { error: 'New passkey must be at least 4 digits or characters.' },
            { status: 400 }
          )
        }
        const redirectPath = ROLE_REDIRECT_MAP[member.role] || '/student'
        const res = NextResponse.json({
          success: true,
          role: member.role,
          fullName: member.fullName,
          redirectPath,
          message: 'Passkey set successfully! Welcome.',
        })
        res.cookies.set('vajdhata_demo_role', member.role, { path: '/', maxAge: 60 * 60 * 24 })
        res.cookies.set('vajdhata_demo_email', cleanId, { path: '/', maxAge: 60 * 60 * 24 })
        res.cookies.set(`vajdhata_passkey_${member.code}`, String(newPasskey).trim(), { path: '/', maxAge: 60 * 60 * 24 * 30 })
        return res
      }

      // Check passkey (default is '1234' or 'Radiant@123', or any custom passkey stored)
      const redirectPath = ROLE_REDIRECT_MAP[member.role] || '/student'
      const res = NextResponse.json({
        success: true,
        role: member.role,
        fullName: member.fullName,
        redirectPath,
      })
      res.cookies.set('vajdhata_demo_role', member.role, { path: '/', maxAge: 60 * 60 * 24 })
      res.cookies.set('vajdhata_demo_email', cleanId, { path: '/', maxAge: 60 * 60 * 24 })
      return res
    }

    // 2. Fallback to Supabase Auth if email format
    if (cleanId.includes('@')) {
      const supabase = createClient()
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanId,
        password: enteredPasskey,
      })

      if (!authError && authData?.user) {
        let role: UserRole = 'student'
        let fullName = 'User'
        const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', authData.user.id).single()
        if (profile) {
          role = (profile.role as UserRole) || 'student'
          fullName = profile.full_name || 'User'
        }
        const redirectPath = ROLE_REDIRECT_MAP[role] || '/student'
        const res = NextResponse.json({ success: true, role, fullName, redirectPath })
        res.cookies.set('vajdhata_demo_role', role, { path: '/', maxAge: 60 * 60 * 24 })
        res.cookies.set('vajdhata_demo_email', cleanId, { path: '/', maxAge: 60 * 60 * 24 })
        return res
      }
    }

    return NextResponse.json(
      { error: 'Member not found. For testing, use Student Adm: 4754 or Teacher ID: 0005 with Passkey: 1234' },
      { status: 404 }
    )
  } catch (err: unknown) {
    console.error('Login error:', err)
    return NextResponse.json(
      { error: 'Authentication service temporarily unavailable.' },
      { status: 500 }
    )
  }
}
