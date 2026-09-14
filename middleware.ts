import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { UserRole } from '@/lib/types'

// Allowed roles for each protected dashboard section
const ROUTE_ROLE_PERMISSIONS: Record<string, UserRole[]> = {
  '/super-admin': ['super_admin'],
  '/admin': ['school_admin', 'super_admin'],
  '/teacher': ['teacher', 'school_admin', 'super_admin'],
  '/student': ['student', 'parent', 'school_admin', 'super_admin'],
  '/accountant': ['accountant', 'school_admin', 'super_admin'],
  '/librarian': ['librarian', 'school_admin', 'super_admin'],
  // /profile is accessible to any authenticated user regardless of role
  '/profile': ['super_admin', 'school_admin', 'teacher', 'student', 'parent', 'accountant', 'librarian'],
}

// Default home page for each role
const ROLE_HOME_MAP: Record<UserRole, string> = {
  super_admin: '/super-admin',
  school_admin: '/admin',
  teacher: '/teacher',
  student: '/student',
  parent: '/student',
  accountant: '/accountant',
  librarian: '/librarian',
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Instantiate Supabase client for middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Verify active session with getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthPage = pathname.startsWith('/login') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password')

  // Find if current path is a protected dashboard route
  const protectedPrefix = Object.keys(ROUTE_ROLE_PERMISSIONS).find(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  // 1. Unauthenticated user trying to access protected route -> Redirect to /login
  if (protectedPrefix && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 2. Authenticated user handling
  if (user) {
    // Read the user's role and school from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, school_id, is_active')
      .eq('id', user.id)
      .single()

    const userRole = (profile?.role as UserRole) || 'student'
    const homeUrl = ROLE_HOME_MAP[userRole] || '/student'

    // If active user navigates to auth page (/login), send to their home
    if (isAuthPage && !pathname.startsWith('/reset-password')) {
      return NextResponse.redirect(new URL(homeUrl, request.url))
    }

    // RBAC Check for protected dashboard sections
    if (protectedPrefix) {
      const allowedRoles = ROUTE_ROLE_PERMISSIONS[protectedPrefix]
      if (allowedRoles && !allowedRoles.includes(userRole)) {
        // Redirect back to user's assigned dashboard home with unauthorized query param
        const redirectUrl = new URL(homeUrl, request.url)
        redirectUrl.searchParams.set('unauthorized', 'true')
        return NextResponse.redirect(redirectUrl)
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder & static assets
     * - api routes (handled directly)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
