'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, GraduationCap, Mail, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    const supabase = createClient()

    if (!email.trim()) {
      setErrorMessage('Please enter your registered email address.')
      return
    }

    try {
      setIsLoading(true)
      const redirectUrl = `${window.location.origin}/reset-password`

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      })

      if (error) {
        setErrorMessage(error.message || 'Failed to send password reset email.')
        setIsLoading(false)
        return
      }

      setIsSent(true)
      setIsLoading(false)
    } catch (err: unknown) {
      console.error(err)
      setErrorMessage('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4 py-8 sm:px-6">
      <div className="w-full max-w-[420px] space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Reset Password
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Enter your registered email address to receive recovery instructions
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm backdrop-blur">
          {isSent ? (
            <div className="space-y-4 text-center animate-in fade-in-50">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-foreground">Email Dispatched</h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                If an account matches <span className="font-semibold text-foreground">{email}</span>, you will receive a password reset link shortly.
              </p>
              <div className="pt-3">
                <Link href="/login">
                  <Button variant="outline" className="w-full gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              {errorMessage && (
                <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive animate-in fade-in-50">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span className="font-medium">{errorMessage}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-semibold text-foreground"
                >
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@school.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 text-sm"
                    autoCapitalize="none"
                    autoCorrect="off"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-sm font-semibold tracking-wide"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
