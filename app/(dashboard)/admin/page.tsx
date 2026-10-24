'use client'

import * as React from 'react'
import { PageHeader } from '@/components/shared/page-header'
import {
  Users,
  GraduationCap,
  IndianRupee,
  CalendarCheck,
  TrendingUp,
  AlertCircle,
  Bell,
  Bus,
  BookOpen,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import Link from 'next/link'
import { CalendarWidget } from '@/components/shared/calendar-widget'

export default function AdminDashboardPage() {
  const kpis = [
    {
      label: 'Total Students',
      value: '1,420',
      change: '+48 this term',
      icon: Users,
      color: 'bg-blue-500/10 text-blue-600',
    },
    {
      label: 'Staff Present Today',
      value: '68 / 72',
      change: '94.4% turnout',
      icon: GraduationCap,
      color: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      label: 'Fee Collection (Oct)',
      value: '₹34.8 L',
      change: '82% of target',
      icon: IndianRupee,
      color: 'bg-amber-500/10 text-amber-600',
    },
    {
      label: 'Student Attendance',
      value: '91.8%',
      change: 'Today (Live)',
      icon: CalendarCheck,
      color: 'bg-purple-500/10 text-purple-600',
    },
  ]

  const recentCirculars = [
    {
      id: '1',
      title: 'Diwali Break & Reporting Dates 2026',
      target: 'Whole School',
      date: 'Today, 09:30 AM',
      tag: 'Holiday',
    },
    {
      id: '2',
      title: 'Parent-Teacher Meeting for Class 10 & 12',
      target: 'Class 10, Class 12',
      date: 'Yesterday',
      tag: 'Urgent',
    },
    {
      id: '3',
      title: 'Inter-School Football Championship Patna',
      target: 'Sports Contingent',
      date: '21 Oct 2026',
      tag: 'Event',
    },
  ]

  const liveAlerts = [
    {
      id: 'a1',
      title: 'Route 4 (Boring Road) Running 15 Mins Late',
      type: 'transport',
      icon: Bus,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200',
    },
    {
      id: 'a2',
      title: '18 Students flagged with <75% attendance threshold',
      type: 'risk',
      icon: AlertCircle,
      color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200',
    },
    {
      id: 'a3',
      title: 'Q3 Fee Reminder dispatched to 142 parent WhatsApp numbers',
      type: 'fee',
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              Patna Central Campus
            </span>
            <span className="text-xs text-muted-foreground">Academic Year 2026-27</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl mt-1">
            Vajdhata International School — Admin Desk
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome back, Dr. Vinod Sharma (Principal & Director). Live operations overview.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/communication"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow hover:bg-primary/90 transition-all"
          >
            <Bell className="h-4 w-4" /> Publish Notice
          </Link>
          <Link
            href="/admin/risk-dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border bg-card text-foreground text-sm font-semibold hover:bg-muted transition-all"
          >
            <TrendingUp className="h-4 w-4 text-rose-500" /> Risk Dashboard
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon
          return (
            <div key={idx} className="rounded-2xl border bg-card p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {kpi.label}
                </span>
                <div className={`p-2 rounded-xl ${kpi.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-foreground">{kpi.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{kpi.change}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Live Operational Alerts */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Live System Notifications & Health
          </h2>
          <span className="text-xs text-muted-foreground">Auto-synced</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {liveAlerts.map((alert) => {
            const Icon = alert.icon
            return (
              <div
                key={alert.id}
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${alert.color}`}
              >
                <Icon className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{alert.title}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Grid: Management Shortcuts & Recent Circulars */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Quick Module Navigator */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground">ERP Core Modules</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Link
                href="/admin/students"
                className="p-4 rounded-xl border bg-background hover:bg-muted/40 transition-colors flex flex-col gap-1.5 group"
              >
                <div className="flex items-center justify-between text-blue-600">
                  <Users className="h-5 w-5" />
                  <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="font-bold text-sm text-foreground">Students Directory</p>
                <p className="text-xs text-muted-foreground">1,420 Enrolled</p>
              </Link>

              <Link
                href="/admin/staff"
                className="p-4 rounded-xl border bg-background hover:bg-muted/40 transition-colors flex flex-col gap-1.5 group"
              >
                <div className="flex items-center justify-between text-emerald-600">
                  <GraduationCap className="h-5 w-5" />
                  <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="font-bold text-sm text-foreground">Faculty & Staff</p>
                <p className="text-xs text-muted-foreground">72 Teaching / Admin</p>
              </Link>

              <Link
                href="/accountant"
                className="p-4 rounded-xl border bg-background hover:bg-muted/40 transition-colors flex flex-col gap-1.5 group"
              >
                <div className="flex items-center justify-between text-amber-600">
                  <IndianRupee className="h-5 w-5" />
                  <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="font-bold text-sm text-foreground">Fee Collection</p>
                <p className="text-xs text-muted-foreground">Razorpay + Dues</p>
              </Link>

              <Link
                href="/admin/communication"
                className="p-4 rounded-xl border bg-background hover:bg-muted/40 transition-colors flex flex-col gap-1.5 group"
              >
                <div className="flex items-center justify-between text-primary">
                  <Bell className="h-5 w-5" />
                  <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="font-bold text-sm text-foreground">Circulars & WhatsApp</p>
                <p className="text-xs text-muted-foreground">Broadcast Center</p>
              </Link>

              <Link
                href="/librarian"
                className="p-4 rounded-xl border bg-background hover:bg-muted/40 transition-colors flex flex-col gap-1.5 group"
              >
                <div className="flex items-center justify-between text-indigo-600">
                  <BookOpen className="h-5 w-5" />
                  <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="font-bold text-sm text-foreground">Central Library</p>
                <p className="text-xs text-muted-foreground">Catalog & Barcodes</p>
              </Link>

              <Link
                href="/student/transport"
                className="p-4 rounded-xl border bg-background hover:bg-muted/40 transition-colors flex flex-col gap-1.5 group"
              >
                <div className="flex items-center justify-between text-cyan-600">
                  <Bus className="h-5 w-5" />
                  <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="font-bold text-sm text-foreground">Fleet & Transport</p>
                <p className="text-xs text-muted-foreground">GPS Tracking</p>
              </Link>
            </div>
          </div>

          {/* Active Notices */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Recent School Circulars</h3>
              <Link
                href="/admin/communication"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Manage All →
              </Link>
            </div>
            <div className="divide-y divide-border">
              {recentCirculars.map((c) => (
                <div key={c.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground">
                        {c.tag}
                      </span>
                      <p className="text-sm font-semibold text-foreground">{c.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Target: {c.target} • {c.date}
                    </p>
                  </div>
                  <Link
                    href="/admin/communication"
                    className="text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: School Calendar */}
        <div className="space-y-6">
          <CalendarWidget />
        </div>
      </div>
    </div>
  )
}
