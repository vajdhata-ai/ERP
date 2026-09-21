'use client'

import * as React from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { Building2, Upload, Key, CheckCircle, ArrowRight, Loader2, Copy } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function NewSchoolOnboardingPage() {
  const [step, setStep] = React.useState<1 | 2>(1)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [credentials, setCredentials] = React.useState<{ email: string, pass: string } | null>(null)
  
  const [formData, setFormData] = React.useState({
    schoolName: '',
    address: '',
    schoolCode: '',
  })
  
  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate Supabase API call to create tenant and initial admin
    await new Promise(r => setTimeout(r, 1500))
    
    // Generate secure password
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$'
    const randomPass = Array.from({length: 12}, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    
    const adminEmail = `admin@${formData.schoolCode.toLowerCase()}.edu.in`
    
    setCredentials({ email: adminEmail, pass: randomPass })
    setIsSubmitting(false)
    setStep(2)
    toast.success('School tenant created successfully!')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-8">
      <PageHeader 
        title="Onboard New School" 
        subtitle="Provision a new tenant and generate initial admin credentials." 
      />

      <div className="bg-card border rounded-3xl p-8 shadow-sm">
        {step === 1 && (
          <form onSubmit={handleNext} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-14 w-14 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                <Building2 className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold">School Details</h3>
                <p className="text-sm text-muted-foreground">This info will appear on fee receipts and report cards.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">School Name *</label>
                <input 
                  required
                  value={formData.schoolName}
                  onChange={e => setFormData(p => ({...p, schoolName: e.target.value}))}
                  className="w-full px-4 py-3 text-sm border rounded-xl bg-background focus:ring-2 ring-primary/20 outline-none font-semibold transition-all"
                  placeholder="e.g. Radiant International School"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">School Code *</label>
                  <input 
                    required
                    value={formData.schoolCode}
                    onChange={e => setFormData(p => ({...p, schoolCode: e.target.value.toUpperCase()}))}
                    className="w-full px-4 py-3 text-sm border rounded-xl bg-background focus:ring-2 ring-primary/20 outline-none font-mono font-bold uppercase transition-all"
                    placeholder="e.g. RIS"
                  />
                  <p className="text-[10px] text-muted-foreground">Used as URL slug: erp.com/ris</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Logo Upload</label>
                  <div className="w-full px-4 py-3 text-sm border border-dashed rounded-xl bg-muted/30 hover:bg-muted/50 cursor-pointer flex items-center justify-center gap-2 text-muted-foreground transition-all">
                    <Upload className="h-4 w-4" /> Choose File
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Complete Address *</label>
                <textarea 
                  required
                  rows={2}
                  value={formData.address}
                  onChange={e => setFormData(p => ({...p, address: e.target.value}))}
                  className="w-full px-4 py-3 text-sm border rounded-xl bg-background focus:ring-2 ring-primary/20 outline-none resize-none transition-all"
                  placeholder="Street, City, State, PIN"
                />
              </div>
            </div>

            <div className="pt-6 border-t flex justify-end">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-md hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Provisioning Tenant...</>
                ) : (
                  <>Create School <ArrowRight className="h-5 w-5" /></>
                )}
              </button>
            </div>
          </form>
        )}

        {step === 2 && credentials && (
          <div className="space-y-8 animate-in zoom-in-95 duration-500 flex flex-col items-center text-center">
            <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-inner shadow-emerald-200">
              <CheckCircle className="h-10 w-10" />
            </div>
            
            <div>
              <h2 className="text-2xl font-black mb-2">{formData.schoolName} is Live!</h2>
              <p className="text-muted-foreground">
                The isolated tenant environment has been created. Use the credentials below to log in as the school admin.
              </p>
            </div>

            <div className="w-full max-w-sm bg-amber-50 border border-amber-200 rounded-2xl p-6 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Key className="h-24 w-24" />
              </div>
              
              <div className="relative z-10 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-amber-800">Admin Email</label>
                  <div className="flex items-center gap-2">
                    <p className="font-mono font-bold text-amber-950">{credentials.email}</p>
                    <button onClick={() => copyToClipboard(credentials.email)} className="p-1 hover:bg-amber-200 rounded text-amber-700">
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-amber-800">One-Time Password</label>
                  <div className="flex items-center gap-2">
                    <p className="font-mono font-bold text-amber-950 text-lg bg-white/50 px-2 py-0.5 rounded">{credentials.pass}</p>
                    <button onClick={() => copyToClipboard(credentials.pass)} className="p-1 hover:bg-amber-200 rounded text-amber-700">
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                
                <p className="text-xs text-amber-700 font-medium leading-tight">
                  <span className="font-bold">Important:</span> Hand these securely to the school administrator. They will be forced to change this password on their first login.
                </p>
              </div>
            </div>

            <Link href="/" className="px-6 py-3 font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors">
              Return to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
