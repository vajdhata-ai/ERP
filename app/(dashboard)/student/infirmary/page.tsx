'use client'

import * as React from 'react'
import { Stethoscope, Clock, FileText, Pill, LogOut } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { getLocalInfirmaryVisits } from '@/lib/data/infirmary'
import { format } from 'date-fns'

export default function StudentInfirmaryPage() {
  const visits = getLocalInfirmaryVisits()

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader 
        title="Infirmary / Health Records" 
        subtitle="Track your visits to the school nurse and medical history." 
      />

      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden flex flex-col">
        {visits.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[300px]">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Stethoscope className="h-8 w-8 opacity-40" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No data available</h3>
            <p className="mt-1">You have no recorded visits to the infirmary.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/40 border-b">
                <tr>
                  <th className="p-4 pl-6 font-semibold text-muted-foreground w-16 text-center">Sr. No</th>
                  <th className="p-4 font-semibold text-muted-foreground min-w-[200px]">Reason</th>
                  <th className="p-4 font-semibold text-muted-foreground">Medicine Name</th>
                  <th className="p-4 font-semibold text-muted-foreground">Visit / Departure Time</th>
                  <th className="p-4 pr-6 font-semibold text-muted-foreground text-center">Documents</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {visits.sort((a,b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime()).map((visit, idx) => (
                  <tr key={visit.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 pl-6 text-center font-mono text-muted-foreground">{idx + 1}</td>
                    <td className="p-4">
                      <p className="font-semibold text-foreground">{visit.reason}</p>
                      <p className="text-[11px] text-muted-foreground mt-1 font-medium">Checked by {visit.checked_by_name}</p>
                    </td>
                    <td className="p-4">
                      {visit.medicine_given ? (
                        <span className="flex items-center gap-1.5 text-foreground font-medium bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-md w-fit text-xs">
                          <Pill className="h-3 w-3" /> {visit.medicine_given}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4 font-mono text-xs space-y-1">
                      <div className="flex items-center gap-2 text-emerald-700">
                        <Clock className="h-3.5 w-3.5" /> 
                        {format(new Date(visit.visit_date), 'dd MMM yy, h:mm a')}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <LogOut className="h-3.5 w-3.5" />
                        {visit.departure_date ? format(new Date(visit.departure_date), 'dd MMM yy, h:mm a') : 'In Infirmary'}
                      </div>
                    </td>
                    <td className="p-4 pr-6 text-center">
                      {visit.prescription_url ? (
                        <a 
                          href={visit.prescription_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex p-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors"
                          title="View Prescription"
                        >
                          <FileText className="h-4 w-4" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground/30">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
