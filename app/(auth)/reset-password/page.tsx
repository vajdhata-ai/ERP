'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, GraduationCap, Lock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const router = useRouter()
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    const supabase = createClient()

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    try {
      setIsLoading(true)

      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) {
        setErrorMessage(error.message || 'Failed to reset password.')
        setIsLoading(false)
        return
      }

      setIsSuccess(true)
      setIsLoading(false)
      toast.success('Password updated successfully!')

      setTimeout(() => {
        router.push('/login')
      }, 2000)
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
            Update Password
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Choose a secure new password for your account
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm backdrop-blur">
          {isSuccess ? (
            <div className="space-y-4 text-center animate-in fade-in-50">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-foreground">Password Reset Complete</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Your password has been changed. Redirecting you to login...
              </p>
              <div className="pt-2">
                <Link href="/login">
                  <Button className="w-full">Sign In Now</Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {errorMessage && (
                <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive animate-in fade-in-50">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span className="font-medium">{errorMessage}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold text-foreground"
                >
                  New Password
                </label>
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
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="text-xs font-semibold text-foreground"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9 text-sm"
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
                    Updating Password...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
