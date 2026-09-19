'use client'

/**
 * app/(auth)/login/page.tsx
 * ============================================================================
 * Simplified, frictionless School ERP Login:
 * - Student Admission Number (e.g. 4754)
 * - Teacher / Staff Employee ID (e.g. 0005)
 * - Passkey / PIN with first-time passkey setup
 * - Fast Quick-Select chips for testing
 * ============================================================================
 */

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  GraduationCap,
  KeyRound,
  User,
  School as SchoolIcon,
  Loader2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

type PortalTab = 'student' | 'teacher'

function LoginForm() {
  const [tab, setTab] = useState<PortalTab>('student')
  const [schoolCode, setSchoolCode] = useState('radiant')
  const [identifier, setIdentifier] = useState('4754')
  const [passkey, setPasskey] = useState('1234')
  const [showPasskey, setShowPasskey] = useState(false)

  // Passkey setup state
  const [isSetupMode, setIsSetupMode] = useState(false)
  const [newPasskey, setNewPasskey] = useState('')
  const [confirmPasskey, setConfirmPasskey] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')

  const handleTabChange = (newTab: PortalTab) => {
    setTab(newTab)
    setErrorMessage(null)
    setIsSetupMode(false)
    if (newTab === 'student') {
      setIdentifier('4754')
      setPasskey('1234')
    } else {
      setIdentifier('0005')
      setPasskey('1234')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!identifier.trim()) {
      setErrorMessage(tab === 'student' ? 'Please enter your Admission Number.' : 'Please enter your Employee ID.')
      return
    }

    if (isSetupMode) {
      if (!newPasskey || newPasskey.length < 4) {
        setErrorMessage('New passkey must be at least 4 digits.')
        return
      }
      if (newPasskey !== confirmPasskey) {
        setErrorMessage('Passkeys do not match. Please re-type.')
        return
      }
    } else if (!passkey) {
      setErrorMessage('Please enter your passkey or PIN (default: 1234).')
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
          password: passkey.trim(),
          isSetupPasskey: isSetupMode,
          newPasskey: newPasskey.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrorMessage(data.error || 'Login failed. Please check your credentials.')
        setIsLoading(false)
        return
      }

      toast.success(isSetupMode ? 'Passkey set! Welcome.' : `Welcome back, ${data.fullName}!`)
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
      <div className="w-full max-w-[440px] space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            VAJDHATA ERP
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Sign in with your Admission No. or Employee ID & Passkey
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm backdrop-blur space-y-5">
          
          {/* Role Tabs */}
          <div className="flex rounded-xl bg-muted p-1 border border-border/50">
            <button
              type="button"
              onClick={() => handleTabChange('student')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                tab === 'student'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Student / Parent
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('teacher')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                tab === 'teacher'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Teacher / Staff
            </button>
          </div>

          {errorMessage && (
            <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive animate-in fade-in-50">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* School Code */}
            <div className="space-y-1.5">
              <label htmlFor="schoolCode" className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>School Code</span>
                <span className="text-[10px] text-muted-foreground font-normal">e.g. radiant</span>
              </label>
              <div className="relative">
                <SchoolIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="schoolCode"
                  type="text"
                  placeholder="radiant"
                  value={schoolCode}
                  onChange={(e) => setSchoolCode(e.target.value)}
                  className="pl-9 text-sm lowercase"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Identifier: Admission Number or Employee ID */}
            <div className="space-y-1.5">
              <label htmlFor="identifier" className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>{tab === 'student' ? 'Student Admission Number' : 'Teacher / Employee ID'}</span>
                <span className="text-[10px] text-primary font-medium">
                  {tab === 'student' ? 'e.g. 4754' : 'e.g. 0005'}
                </span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="identifier"
                  type="text"
                  placeholder={tab === 'student' ? '4754' : '0005'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="pl-9 text-sm font-mono tracking-wider font-semibold"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Passkey Input or Setup Mode */}
            {!isSetupMode ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="passkey" className="text-xs font-semibold text-foreground">
                    Passkey / PIN
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsSetupMode(true)}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    First time? Set Passkey
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="passkey"
                    type={showPasskey ? 'text' : 'password'}
                    placeholder="Enter passkey (default: 1234)"
                    value={passkey}
                    onChange={(e) => setPasskey(e.target.value)}
                    className="pl-9 pr-10 text-sm font-mono tracking-widest"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasskey(!showPasskey)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showPasskey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Default passkey for demo accounts is <span className="font-mono font-semibold text-foreground">1234</span>
                </p>
              </div>
            ) : (
              /* First Time Passkey Setup */
              <div className="space-y-3 p-3.5 rounded-xl border border-primary/30 bg-primary/5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" />
                    Set New Account Passkey
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSetupMode(false)}
                    className="text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground">
                    Choose 4-Digit Passkey / PIN
                  </label>
                  <Input
                    type="password"
                    placeholder="e.g. 5678"
                    value={newPasskey}
                    onChange={(e) => setNewPasskey(e.target.value)}
                    className="text-sm font-mono tracking-widest bg-background"
                    maxLength={10}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground">
                    Confirm Passkey
                  </label>
                  <Input
                    type="password"
                    placeholder="Re-enter passkey"
                    value={confirmPasskey}
                    onChange={(e) => setConfirmPasskey(e.target.value)}
                    className="text-sm font-mono tracking-widest bg-background"
                    maxLength={10}
                    required
                  />
                </div>
              </div>
            )}

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
              ) : isSetupMode ? (
                'Save Passkey & Sign In'
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Quick Click Demo Test Accounts */}
          <div className="pt-4 border-t border-border/60 space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground text-center">
              Quick Test Accounts (Passkey: <span className="font-mono text-foreground">1234</span>)
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setTab('teacher')
                  setIdentifier('0005')
                  setPasskey('1234')
                  setIsSetupMode(false)
                }}
                className="flex items-center justify-between p-2.5 rounded-xl border border-border/70 hover:border-primary/50 hover:bg-muted/40 transition-all text-left"
              >
                <div>
                  <span className="font-bold block text-foreground">Teacher</span>
                  <span className="text-[10px] text-muted-foreground">ID: 0005 (Physics)</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setTab('student')
                  setIdentifier('4754')
                  setPasskey('1234')
                  setIsSetupMode(false)
                }}
                className="flex items-center justify-between p-2.5 rounded-xl border border-border/70 hover:border-primary/50 hover:bg-muted/40 transition-all text-left"
              >
                <div>
                  <span className="font-bold block text-foreground">Student</span>
                  <span className="text-[10px] text-muted-foreground">Adm: 4754 (XII-A)</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setTab('teacher')
                  setIdentifier('0001')
                  setPasskey('1234')
                  setIsSetupMode(false)
                }}
                className="flex items-center justify-between p-2.5 rounded-xl border border-border/70 hover:border-primary/50 hover:bg-muted/40 transition-all text-left"
              >
                <div>
                  <span className="font-bold block text-foreground">Principal</span>
                  <span className="text-[10px] text-muted-foreground">ID: 0001 (Admin)</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setTab('teacher')
                  setIdentifier('0002')
                  setPasskey('1234')
                  setIsSetupMode(false)
                }}
                className="flex items-center justify-between p-2.5 rounded-xl border border-border/70 hover:border-primary/50 hover:bg-muted/40 transition-all text-left"
              >
                <div>
                  <span className="font-bold block text-foreground">Accountant</span>
                  <span className="text-[10px] text-muted-foreground">ID: 0002 (Fees)</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Vajdhata School ERP. All rights reserved.
        </p>

      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
