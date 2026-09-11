import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { UserRole } from '@/lib/types'

// Map roles to their dedicated root landing routes
const ROLE_REDIRECT_MAP: Record<UserRole, string> = {
  super_admin: '/super-admin',
  school_admin: '/admin',
  teacher: '/teacher',
  student: '/student',
  parent: '/student',
  accountant: '/accountant',
  librarian: '/librarian',
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
    const supabase = createClient()

    // 1. Verify school existence & active status
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .select('id, name, school_code, is_active')
      .eq('school_code', normalizedSchoolCode)
      .single()

    if (schoolError || !school) {
      return NextResponse.json(
        { error: `No active school found with code '${normalizedSchoolCode}'.` },
        { status: 404 }
      )
    }

    if (!school.is_active) {
      return NextResponse.json(
        { error: 'This school account is currently deactivated. Please contact support.' },
        { status: 403 }
      )
    }

    // 2. Attempt Supabase Auth Sign In (identifier is email)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: identifier.trim(),
      password,
    })

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || 'Invalid email or password.' },
        { status: 401 }
      )
    }

    // 3. Look up user profile to enforce multi-tenant isolation
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, school_id, full_name, role, is_active')
      .eq('id', authData.user.id)
      .single()

    if (profileError || !profile) {
      // Profile missing - clean up session
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: 'User profile not found. Please contact your school administrator.' },
        { status: 403 }
      )
    }

    if (!profile.is_active) {
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: 'Your account has been deactivated. Please contact your administrator.' },
        { status: 403 }
      )
    }

    // 4. Strict Tenant Boundary Check:
    // Reject login if profile.school_id does not match the entered school_code (unless super_admin)
    if (profile.role !== 'super_admin' && profile.school_id !== school.id) {
      await supabase.auth.signOut()
      return NextResponse.json(
        {
          error: `Access Denied: This account is not registered under school '${school.name}' (${school.school_code}).`,
        },
        { status: 403 }
      )
    }

    const redirectPath = ROLE_REDIRECT_MAP[profile.role as UserRole] || '/student'

    return NextResponse.json({
      success: true,
      role: profile.role,
      fullName: profile.full_name,
      redirectPath,
    })
  } catch (err: unknown) {
    console.error('Login error:', err)
    return NextResponse.json(
      { error: 'An unexpected authentication error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
