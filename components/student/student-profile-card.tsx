'use client'
/* eslint-disable @next/next/no-img-element */

import * as React from 'react'
import {
  GraduationCap,
  Calendar,
  Phone,
  Hash,
  ShieldCheck,
  ShieldAlert,
  User,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { StudentProfileData } from '@/lib/data/student-dashboard'
import { cn } from '@/lib/utils'

interface StudentProfileCardProps {
  student: StudentProfileData
  className?: string
}

export function StudentProfileCard({
  student,
  className,
}: StudentProfileCardProps) {
  // Format Date of Birth safely
  let formattedDob = 'Not Specified'
  if (student.date_of_birth) {
    try {
      formattedDob = format(parseISO(student.date_of_birth), 'dd MMMM yyyy')
    } catch {
      formattedDob = student.date_of_birth
    }
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs transition-all',
        className
      )}
    >
      {/* Subtle decorative background accent */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 h-36 w-36 rounded-full bg-primary/5 blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
        {/* Photo / Avatar */}
        <div className="relative shrink-0">
          {student.avatar_url ? (
            <img
              src={student.avatar_url}
              alt={student.full_name}
              className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover ring-2 ring-border shadow-sm"
            />
          ) : (
            <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-2 ring-border shadow-sm">
              <User className="h-10 w-10 stroke-[1.5]" />
            </div>
          )}

          {/* Active / Inactive Status Dot indicator on avatar */}
          <span
            className={cn(
              'absolute -bottom-1 -right-1 h-5 w-5 rounded-full ring-2 ring-card flex items-center justify-center',
              student.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'
            )}
            title={student.is_active ? 'Status: Active' : 'Status: Inactive'}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
          </span>
        </div>

        {/* Student Name & Core Info */}
        <div className="flex-1 min-w-0 space-y-3 w-full">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
                {student.full_name}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Radiant Public Senior Secondary School • Knowledge Park III
              </p>
            </div>

            {/* Active / Inactive Badge */}
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0',
                student.is_active
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800'
              )}
            >
              {student.is_active ? (
                <>
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  Active Student
                </>
              ) : (
                <>
                  <ShieldAlert className="h-3.5 w-3.5 text-slate-500" />
                  Inactive
                </>
              )}
            </span>
          </div>

          {/* Key Details Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border/60 text-xs">
            {/* Class & Section */}
            <div className="flex items-center gap-2.5 rounded-xl bg-muted/40 p-2.5 border border-border/40">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div className="truncate">
                <span className="block text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Class & Sec
                </span>
                <span className="font-semibold text-foreground truncate">
                  {student.class_name} - {student.section_name}
                </span>
              </div>
            </div>

            {/* Admission Number */}
            <div className="flex items-center gap-2.5 rounded-xl bg-muted/40 p-2.5 border border-border/40">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Hash className="h-4 w-4" />
              </div>
              <div className="truncate">
                <span className="block text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Admission No
                </span>
                <span className="font-semibold font-mono text-foreground truncate">
                  {student.admission_no}
                </span>
              </div>
            </div>

            {/* Mobile Number */}
            <div className="flex items-center gap-2.5 rounded-xl bg-muted/40 p-2.5 border border-border/40">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Phone className="h-4 w-4" />
              </div>
              <div className="truncate">
                <span className="block text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Mobile No
                </span>
                <span className="font-semibold text-foreground truncate">
                  {student.phone || '+91 98765 43215'}
                </span>
              </div>
            </div>

            {/* Date of Birth */}
            <div className="flex items-center gap-2.5 rounded-xl bg-muted/40 p-2.5 border border-border/40">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="truncate">
                <span className="block text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Date of Birth
                </span>
                <span className="font-semibold text-foreground truncate">
                  {formattedDob}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
