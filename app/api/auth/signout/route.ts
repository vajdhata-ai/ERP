import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    await supabase.auth.signOut()
  } catch {
    // ignore
  }

  const url = new URL(request.url)
  const res = NextResponse.redirect(new URL('/login', url.origin), {
    status: 303,
  })
  res.cookies.delete('vajdhata_demo_role')
  res.cookies.delete('vajdhata_demo_email')
  return res
}

export async function GET(request: Request) {
  try {
    const supabase = createClient()
    await supabase.auth.signOut()
  } catch {
    // ignore
  }

  const url = new URL(request.url)
  const res = NextResponse.redirect(new URL('/login', url.origin), {
    status: 303,
  })
  res.cookies.delete('vajdhata_demo_role')
  res.cookies.delete('vajdhata_demo_email')
  return res
}
