'use client'

import * as React from 'react'
import { PageHeader } from '@/components/shared/page-header'
import {
  Users,
  Search,
  Filter,
  Download,
  Phone,
  Mail,
  GraduationCap,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Eye,
  Plus,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface StudentRecord {
  id: string
  admissionNo: string
  name: string
  rollNo: string
  classSection: string
  parentName: string
  phone: string
  email: string
  status: 'Active' | 'Fee Due' | 'Leave'
  attendance: string
  dues: number
}

const SAMPLE_STUDENTS: StudentRecord[] = [
  {
    id: 's1',
    admissionNo: '4754',
    name: 'Aarav Patel',
    rollNo: '12-A-01',
    classSection: 'Class 12 - Section A',
    parentName: 'Ramesh Patel',
    phone: '+91 98765 43210',
    email: 'aarav.patel@student.radiant.edu',
    status: 'Active',
    attendance: '94.2%',
    dues: 0,
  },
  {
    id: 's2',
    admissionNo: '4755',
    name: 'Diya Sharma',
    rollNo: '12-A-02',
    classSection: 'Class 12 - Section A',
    parentName: 'Sanjay Sharma',
    phone: '+91 98350 12345',
    email: 'diya.sharma@student.radiant.edu',
    status: 'Fee Due',
    attendance: '88.0%',
    dues: 18000,
  },
  {
    id: 's3',
    admissionNo: '4756',
    name: 'Kabir Singh',
    rollNo: '10-A-08',
    classSection: 'Class 10 - Section A',
    parentName: 'Gurpreet Singh',
    phone: '+91 99112 33445',
    email: 'kabir.singh@student.radiant.edu',
    status: 'Active',
    attendance: '96.5%',
    dues: 0,
  },
  {
    id: 's4',
    admissionNo: '4757',
    name: 'Ananya Verma',
    rollNo: '10-A-12',
    classSection: 'Class 10 - Section A',
    parentName: 'Dr. Manoj Verma',
    phone: '+91 97000 88221',
    email: 'ananya.v@student.radiant.edu',
    status: 'Active',
    attendance: '92.1%',
    dues: 0,
  },
  {
    id: 's5',
    admissionNo: '4758',
    name: 'Rohan Mehta',
    rollNo: '9-B-04',
    classSection: 'Class 9 - Section B',
    parentName: 'Vikram Mehta',
    phone: '+91 98110 55443',
    email: 'rohan.m@student.radiant.edu',
    status: 'Fee Due',
    attendance: '74.5%',
    dues: 12500,
  },
  {
    id: 's6',
    admissionNo: '4759',
    name: 'Sneha Kumari',
    rollNo: '8-A-15',
    classSection: 'Class 8 - Section A',
    parentName: 'Ashok Kumar',
    phone: '+91 98223 99881',
    email: 'sneha.k@student.radiant.edu',
    status: 'Active',
    attendance: '98.0%',
    dues: 0,
  },
]

export default function AdminStudentsPage() {
  const [search, setSearch] = React.useState('')
  const [classFilter, setClassFilter] = React.useState('ALL')

  const filtered = SAMPLE_STUDENTS.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.admissionNo.includes(search) ||
      s.parentName.toLowerCase().includes(search.toLowerCase())
    const matchesClass = classFilter === 'ALL' || s.classSection.includes(classFilter)
    return matchesSearch && matchesClass
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <PageHeader
            title="Students Directory"
            subtitle="View student profiles, admission records, attendance rates, and fee dues."
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.success('Exporting student roster to CSV...')}
            className="flex items-center gap-1.5 px-3.5 py-2 border rounded-xl bg-card text-xs font-semibold hover:bg-muted"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button
            onClick={() => toast.info('New Student Admission form is ready.')}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 shadow"
          >
            <Plus className="h-4 w-4" /> New Admission
          </button>
        </div>
      </div>

      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by student name, admission number, or parent..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border bg-card text-sm focus:outline-none"
          >
            <option value="ALL">All Classes</option>
            <option value="Class 12">Class 12</option>
            <option value="Class 10">Class 10</option>
            <option value="Class 9">Class 9</option>
            <option value="Class 8">Class 8</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 text-muted-foreground uppercase font-semibold border-b">
              <tr>
                <th className="py-3 px-4">Adm No.</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Class & Sec</th>
                <th className="py-3 px-4">Parent Details</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">Fee Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-muted/20">
                  <td className="py-3 px-4 font-mono font-bold text-foreground">{s.admissionNo}</td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-sm text-foreground">{s.name}</p>
                    <p className="text-[11px] text-muted-foreground">{s.rollNo}</p>
                  </td>
                  <td className="py-3 px-4 font-medium text-foreground">{s.classSection}</td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-foreground">{s.parentName}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {s.phone}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full font-bold ${
                        parseFloat(s.attendance) >= 75
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {s.attendance}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {s.dues > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-rose-700 bg-rose-100 font-bold dark:bg-rose-950 dark:text-rose-300">
                        <AlertCircle className="h-3 w-3" /> Due: ₹{s.dues.toLocaleString('en-IN')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-emerald-700 bg-emerald-100 font-bold dark:bg-emerald-950 dark:text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" /> Clear
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href="/student"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border bg-background hover:bg-muted text-xs font-semibold"
                    >
                      <Eye className="h-3.5 w-3.5" /> View Portal
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
