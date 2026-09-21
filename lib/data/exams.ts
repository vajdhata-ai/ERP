// lib/data/exams.ts
export type Exam = {
  id: string
  name: string
  academic_year: string
  exam_date: string
  is_published: boolean
}

export type SubjectMark = {
  subject_name: string
  marks_obtained: number
  max_marks: number
  grade: string
}

export const DEMO_EXAMS: Exam[] = [
  { id: 'ex-1', name: 'Term 1 / Half Yearly', academic_year: '2026-2027', exam_date: '2026-09-15', is_published: true },
  { id: 'ex-2', name: 'PT-1', academic_year: '2026-2027', exam_date: '2026-07-20', is_published: true },
]

export const DEMO_MARKS: Record<string, SubjectMark[]> = {
  'ex-1': [
    { subject_name: 'Mathematics', marks_obtained: 85, max_marks: 100, grade: 'A2' },
    { subject_name: 'Science', marks_obtained: 92, max_marks: 100, grade: 'A1' },
    { subject_name: 'English', marks_obtained: 78, max_marks: 100, grade: 'B1' },
    { subject_name: 'Social Science', marks_obtained: 88, max_marks: 100, grade: 'A2' },
    { subject_name: 'Hindi', marks_obtained: 95, max_marks: 100, grade: 'A1' },
  ],
  'ex-2': [
    { subject_name: 'Mathematics', marks_obtained: 35, max_marks: 40, grade: 'A2' },
    { subject_name: 'Science', marks_obtained: 38, max_marks: 40, grade: 'A1' },
    { subject_name: 'English', marks_obtained: 30, max_marks: 40, grade: 'B1' },
  ]
}

export const DEMO_SELF_AWARENESS = [
  { trait: 'Discipline', rating: 'Excellent' },
  { trait: 'Teamwork', rating: 'Very Good' },
  { trait: 'Communication', rating: 'Good' },
  { trait: 'Creativity', rating: 'Excellent' },
]

export function getLocalExams() {
  return DEMO_EXAMS
}

export function getLocalMarks(examId: string) {
  return DEMO_MARKS[examId] || []
}
