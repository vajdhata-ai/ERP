-- ============================================================================
-- VAJDHATA SCHOOL ERP — STAGE 7/8/9 EXTRA TABLES
-- Migration: 20260921000005_stage789_extras.sql
-- ============================================================================

-- ─── Stage 8 extras ───────────────────────────────────────────────────────────

-- WhatsApp send log (every send attempt logged here)
CREATE TABLE IF NOT EXISTS public.whatsapp_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    recipient_phone TEXT NOT NULL,
    template_name TEXT NOT NULL,
    message_body TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, success, failed
    wa_message_id TEXT,
    error_message TEXT,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
CREATE INDEX IF NOT EXISTS idx_whatsapp_log_school_id ON public.whatsapp_log(school_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_log_status ON public.whatsapp_log(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_log_sent_at ON public.whatsapp_log(sent_at DESC);

-- Parent/student feedback to school
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General', -- General, Complaint, Suggestion, Query
    status TEXT NOT NULL DEFAULT 'open',       -- open, in_review, resolved
    admin_reply TEXT,
    replied_by UUID REFERENCES public.profiles(id),
    replied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
CREATE INDEX IF NOT EXISTS idx_feedback_school_id ON public.feedback(school_id);
CREATE INDEX IF NOT EXISTS idx_feedback_profile_id ON public.feedback(profile_id);

-- Student achievements (posted by teacher/admin)
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'Academic', -- Academic, Sports, Cultural, Co-curricular
    awarded_on DATE NOT NULL DEFAULT CURRENT_DATE,
    awarded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
CREATE INDEX IF NOT EXISTS idx_achievements_school_id ON public.achievements(school_id);
CREATE INDEX IF NOT EXISTS idx_achievements_student_id ON public.achievements(student_id);

-- PTM (Parent-Teacher Meeting) schedules
CREATE TABLE IF NOT EXISTS public.ptm_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    venue TEXT,
    description TEXT,
    target_class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL, -- NULL = all classes
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
CREATE INDEX IF NOT EXISTS idx_ptm_schedules_school_id ON public.ptm_schedules(school_id);
CREATE INDEX IF NOT EXISTS idx_ptm_schedules_scheduled_at ON public.ptm_schedules(scheduled_at);

-- ─── Stage 7 extras ───────────────────────────────────────────────────────────

-- Add target_section_id to circulars for per-section targeting
ALTER TABLE public.circulars ADD COLUMN IF NOT EXISTS target_section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL;

-- RLS policies for new tables (enable RLS but allow service_role full access)
ALTER TABLE public.whatsapp_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ptm_schedules ENABLE ROW LEVEL SECURITY;

-- whatsapp_log: only school_admin/teacher can read, service_role writes
DROP POLICY IF EXISTS "whatsapp_log_school_select" ON public.whatsapp_log;
CREATE POLICY "whatsapp_log_school_select" ON public.whatsapp_log
    FOR SELECT TO authenticated
    USING (
        school_id IN (
            SELECT school_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- feedback: owner or school staff can read
DROP POLICY IF EXISTS "feedback_owner_select" ON public.feedback;
CREATE POLICY "feedback_owner_select" ON public.feedback
    FOR SELECT TO authenticated
    USING (
        profile_id = auth.uid() OR
        school_id IN (
            SELECT school_id FROM public.profiles
            WHERE id = auth.uid() AND role IN ('school_admin','super_admin','teacher')
        )
    );

DROP POLICY IF EXISTS "feedback_owner_insert" ON public.feedback;
CREATE POLICY "feedback_owner_insert" ON public.feedback
    FOR INSERT TO authenticated
    WITH CHECK (profile_id = auth.uid());

-- achievements: readable by student/parent of that student
DROP POLICY IF EXISTS "achievements_student_select" ON public.achievements;
CREATE POLICY "achievements_student_select" ON public.achievements
    FOR SELECT TO authenticated
    USING (
        school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid())
    );

-- ptm_schedules: readable by all authenticated in same school
DROP POLICY IF EXISTS "ptm_schedules_school_select" ON public.ptm_schedules;
CREATE POLICY "ptm_schedules_school_select" ON public.ptm_schedules
    FOR SELECT TO authenticated
    USING (
        school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid())
    );

-- Seed: Add a few library books if not present
INSERT INTO public.library_books (id, school_id, accession_no, title, author, publisher, subject, book_type, total_copies, available_copies)
VALUES
    ('aaaaaaaa-bbbb-cccc-dddd-111111111111', '11111111-1111-1111-1111-111111111111', 'PHY001', 'Concepts of Physics Vol 1', 'H.C. Verma', 'Bharati Bhawan', 'Physics', 'Textbook', 5, 4),
    ('aaaaaaaa-bbbb-cccc-dddd-222222222222', '11111111-1111-1111-1111-111111111111', 'MATH001', 'R.D. Sharma Mathematics Class XII', 'R.D. Sharma', 'Dhanpat Rai', 'Mathematics', 'Textbook', 3, 3),
    ('aaaaaaaa-bbbb-cccc-dddd-333333333333', '11111111-1111-1111-1111-111111111111', 'ENG001', 'Wings of Fire (Autobiography)', 'A.P.J. Abdul Kalam', 'Universities Press', 'English', 'Fiction', 2, 2),
    ('aaaaaaaa-bbbb-cccc-dddd-444444444444', '11111111-1111-1111-1111-111111111111', 'CHEM001', 'NCERT Chemistry Part I Class XII', 'NCERT', 'NCERT', 'Chemistry', 'Textbook', 8, 7),
    ('aaaaaaaa-bbbb-cccc-dddd-555555555555', '11111111-1111-1111-1111-111111111111', 'BIO001', 'NCERT Biology Class XII', 'NCERT', 'NCERT', 'Biology', 'Textbook', 6, 5)
ON CONFLICT (school_id, accession_no) DO NOTHING;
