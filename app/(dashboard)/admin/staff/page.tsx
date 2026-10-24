'use client'

import * as React from 'react'
import { PageHeader } from '@/components/shared/page-header'
import {
  GraduationCap,
  Search,
  Filter,
  Download,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  Plus,
  BookOpen,
} from 'lucide-react'
import { toast } from 'sonner'

interface StaffRecord {
  id: string
  empId: string
  name: string
  designation: string
  department: string
  subjects: string
  phone: string
  email: string
  status: 'Present' | 'On Leave' | 'Late'
  experience: string
}

const SAMPLE_STAFF: StaffRecord[] = [
  {
    id: 'st1',
    empId: '0001',
    name: 'Dr. Vinod Sharma',
    designation: 'Principal & Director',
    department: 'Administration',
    subjects: 'Leadership & Policy',
    phone: '+91 98350 99881',
    email: 'admin@radiant.edu',
    status: 'Present',
    experience: '22 Years',
  },
  {
    id: 'st2',
    empId: '0005',
    name: 'Rajesh Verma',
    designation: 'Senior PGT Physics',
    department: 'Science & Senior Secondary',
    subjects: 'Physics (Class 11 & 12)',
    phone: '+91 98765 11223',
    email: 'verma.physics@radiant.edu',
    status: 'Present',
    experience: '14 Years',
  },
  {
    id: 'st3',
    empId: '0006',
    name: 'Anita Gupta',
    designation: 'TGT Mathematics',
    department: 'Mathematics',
    subjects: 'Mathematics (Class 9 & 10)',
    phone: '+91 98110 44556',
    email: 'anita.gupta@radiant.edu',
    status: 'Present',
    experience: '9 Years',
  },
  {
    id: 'st4',
    empId: '0002',
    name: 'Ramesh Tiwari',
    designation: 'Chief Accounts Officer',
    department: 'Finance & Accounts',
    subjects: 'Fee Collection & Audit',
    phone: '+91 99000 77881',
    email: 'accounts@radiant.edu',
    status: 'Present',
    experience: '11 Years',
  },
  {
    id: 'st5',
    empId: '0003',
    name: 'Sunita Rao',
    designation: 'Head Librarian',
    department: 'Library Sciences',
    subjects: 'Library & Digital Catalog',
    phone: '+91 97766 55441',
    email: 'library@radiant.edu',
    status: 'Present',
    experience: '8 Years',
  },
  {
    id: 'st6',
    empId: '0008',
    name: 'Vikram Choudhary',
    designation: 'Physical Education Instructor',
    department: 'Sports & Wellness',
    subjects: 'Athletics & Football',
    phone: '+91 98221 33440',
    email: 'vikram.sports@radiant.edu',
    status: 'On Leave',
    experience: '6 Years',
  },
]

export default function AdminStaffPage() {
  const [search, setSearch] = React.useState('')
  const [deptFilter, setDeptFilter] = React.useState('ALL')

  const filtered = SAMPLE_STAFF.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.empId.includes(search) ||
      s.subjects.toLowerCase().includes(search.toLowerCase())
    const matchesDept = deptFilter === 'ALL' || s.department.includes(deptFilter)
    return matchesSearch && matchesDept
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <PageHeader
            title="Faculty & Staff Directory"
            subtitle="Manage teaching staff, administration profiles, department assignments, and daily attendance."
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.success('Exporting staff records to CSV...')}
            className="flex items-center gap-1.5 px-3.5 py-2 border rounded-xl bg-card text-xs font-semibold hover:bg-muted"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button
            onClick={() => toast.info('Add Staff Member modal is ready.')}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 shadow"
          >
            <Plus className="h-4 w-4" /> Add Staff Member
          </button>
        </div>
      </div>

      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by faculty name, employee ID, or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border bg-card text-sm focus:outline-none"
          >
            <option value="ALL">All Departments</option>
            <option value="Administration">Administration</option>
            <option value="Science">Science</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Finance">Finance & Accounts</option>
            <option value="Library">Library</option>
            <option value="Sports">Sports & Wellness</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 text-muted-foreground uppercase font-semibold border-b">
              <tr>
                <th className="py-3 px-4">Emp ID</th>
                <th className="py-3 px-4">Faculty Name</th>
                <th className="py-3 px-4">Designation & Dept</th>
                <th className="py-3 px-4">Subjects / Focus</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Status Today</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-muted/20">
                  <td className="py-3 px-4 font-mono font-bold text-foreground">{s.empId}</td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-sm text-foreground">{s.name}</p>
                    <p className="text-[11px] text-muted-foreground">{s.experience} Exp</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-foreground">{s.designation}</p>
                    <p className="text-[11px] text-muted-foreground">{s.department}</p>
                  </td>
                  <td className="py-3 px-4 text-foreground font-medium">{s.subjects}</td>
                  <td className="py-3 px-4">
                    <p className="text-[11px] text-foreground flex items-center gap-1 font-mono">
                      <Phone className="h-3 w-3 text-muted-foreground" /> {s.phone}
                    </p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3 text-muted-foreground" /> {s.email}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    {s.status === 'Present' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-emerald-700 bg-emerald-100 font-bold dark:bg-emerald-950 dark:text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" /> Present
                      </span>
                    )}
                    {s.status === 'On Leave' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-amber-700 bg-amber-100 font-bold dark:bg-amber-950 dark:text-amber-300">
                        <Clock className="h-3 w-3" /> On Leave
                      </span>
                    )}
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
