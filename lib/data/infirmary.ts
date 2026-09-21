// lib/data/infirmary.ts
export type InfirmaryVisit = {
  id: string
  visit_date: string
  departure_date: string | null
  reason: string
  medicine_given: string | null
  prescription_url: string | null
  checked_by_name: string
}

export const DEMO_VISITS: InfirmaryVisit[] = [
  {
    id: 'inf-1',
    visit_date: new Date(Date.now() - 5 * 86400000).toISOString(),
    departure_date: new Date(Date.now() - 5 * 86400000 + 3600000).toISOString(),
    reason: 'Mild fever and headache',
    medicine_given: 'Paracetamol 500mg',
    prescription_url: null,
    checked_by_name: 'Nurse Anita',
  },
  {
    id: 'inf-2',
    visit_date: new Date(Date.now() - 40 * 86400000).toISOString(),
    departure_date: new Date(Date.now() - 40 * 86400000 + 1800000).toISOString(),
    reason: 'Scraped knee during sports',
    medicine_given: 'Antiseptic cream and bandage',
    prescription_url: null,
    checked_by_name: 'Nurse Anita',
  }
]

export function getLocalInfirmaryVisits() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('erp_infirmary_visits')
    if (saved) return JSON.parse(saved) as InfirmaryVisit[]
    localStorage.setItem('erp_infirmary_visits', JSON.stringify(DEMO_VISITS))
  }
  return DEMO_VISITS
}

export function saveLocalInfirmaryVisits(visits: InfirmaryVisit[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('erp_infirmary_visits', JSON.stringify(visits))
  }
}
