'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, GraduationCap, Lock, Mail, School as SchoolIcon, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

function LoginForm() {
  const [schoolCode, setSchoolCode] = useState('radiant')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!schoolCode.trim()) {
      setErrorMessage('Please enter your School Code.')
      return
    }
    if (!identifier.trim()) {
      setErrorMessage('Please enter your User ID or Email.')
      return
    }
    if (!password) {
      setErrorMessage('Please enter your password.')
      return
    }

    try {
      setIsLoading(true)

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolCode: schoolCode.trim().toLowerCase(),
          identifier: identifier.trim(),
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrorMessage(data.error || 'Authentication failed. Please check your credentials.')
        setIsLoading(false)
        return
      }

      toast.success(`Welcome back, ${data.fullName}!`)
      const destination = redirectTo || data.redirectPath
      router.push(destination)
      router.refresh()
    } catch (err: unknown) {
      console.error(err)
      setErrorMessage('Unable to connect to the authentication service. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4 py-8 sm:px-6">
      {/* Container */}
      <div className="w-full max-w-[420px] space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            VAJDHATA ERP
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Sign in to your school administration & learning portal
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm backdrop-blur">
          {errorMessage && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive animate-in fade-in-50">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* School Code */}
            <div className="space-y-1.5">
              <label
                htmlFor="schoolCode"
                className="text-xs font-semibold text-foreground flex items-center justify-between"
              >
                <span>School Code</span>
                <span className="text-[10px] text-muted-foreground font-normal">e.g. radiant</span>
              </label>
              <div className="relative">
                <SchoolIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="schoolCode"
                  type="text"
                  placeholder="Enter school code"
                  value={schoolCode}
                  onChange={(e) => setSchoolCode(e.target.value)}
                  className="pl-9 text-sm lowercase"
                  autoCapitalize="none"
                  autoCorrect="off"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email / User ID */}
            <div className="space-y-1.5">
              <label
                htmlFor="identifier"
                className="text-xs font-semibold text-foreground"
              >
                User ID or Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="identifier"
                  type="email"
                  placeholder="name@school.edu"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="pl-9 text-sm"
                  autoCapitalize="none"
                  autoCorrect="off"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold text-foreground"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10 text-sm"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full mt-2 h-11 text-sm font-semibold tracking-wide"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Seed accounts quick reference */}
          <div className="mt-6 pt-4 border-t border-border/60">
            <p className="text-[11px] font-medium text-muted-foreground text-center mb-2">
              Seed Test Accounts (Password: <span className="font-mono text-foreground font-semibold">Radiant@123</span>)
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <button
                type="button"
                onClick={() => {
                  setSchoolCode('radiant')
                  setIdentifier('admin@radiant.edu')
                  setPassword('Radiant@123')
                }}
                className="text-left rounded p-1 hover:bg-accent border border-border/50 truncate"
              >
                <span className="font-semibold block">Admin</span>
                admin@radiant.edu
              </button>
              <button
                type="button"
                onClick={() => {
                  setSchoolCode('radiant')
                  setIdentifier('verma.physics@radiant.edu')
                  setPassword('Radiant@123')
                }}
                className="text-left rounded p-1 hover:bg-accent border border-border/50 truncate"
              >
                <span className="font-semibold block">Teacher</span>
                verma.physics@radiant.edu
              </button>
              <button
                type="button"
                onClick={() => {
                  setSchoolCode('radiant')
                  setIdentifier('aarav.patel@student.radiant.edu')
                  setPassword('Radiant@123')
                }}
                className="text-left rounded p-1 hover:bg-accent border border-border/50 truncate"
              >
                <span className="font-semibold block">Student</span>
                aarav.patel@student...
              </button>
              <button
                type="button"
                onClick={() => {
                  setSchoolCode('radiant')
                  setIdentifier('accounts@radiant.edu')
                  setPassword('Radiant@123')
                }}
                className="text-left rounded p-1 hover:bg-accent border border-border/50 truncate"
              >
                <span className="font-semibold block">Accountant</span>
                accounts@radiant.edu
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Protected by Supabase Row Level Security & Vajdhata Multi-Tenant Shield
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}


