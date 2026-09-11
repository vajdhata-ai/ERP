-- ============================================================================
-- VAJDHATA SCHOOL ERP - STAGE 1: MULTI-TENANT DATABASE SCHEMA
-- Migration: 20260911000001_initial_schema.sql
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- CUSTOM TYPES & ENUMS
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'super_admin',
        'school_admin',
        'teacher',
        'student',
        'parent',
        'accountant',
        'librarian'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE attendance_status AS ENUM (
        'present',
        'absent',
        'leave',
        'on_duty'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE homework_type AS ENUM (
        'homework',
        'assignment'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE homework_submission_status AS ENUM (
        'pending',
        'submitted',
        'late'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE fee_due_status AS ENUM (
        'pending',
        'paid',
        'overdue'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE remark_sentiment AS ENUM (
        'positive',
        'negative',
        'neutral'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE library_tx_status AS ENUM (
        'issued',
        'returned',
        'overdue'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE calendar_event_type AS ENUM (
        'holiday',
        'event',
        'exam'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE family_relation AS ENUM (
        'father',
        'mother',
        'guardian'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 1. TENANCY & IDENTITY
-- ============================================================================

-- 1.1 Schools (Root Tenant Table)
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    school_code TEXT NOT NULL UNIQUE,
    address TEXT,
    logo_url TEXT,
    subscription_plan TEXT NOT NULL DEFAULT 'standard',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT chk_school_code_lowercase CHECK (school_code = lower(school_code))
);

CREATE INDEX IF NOT EXISTS idx_schools_code ON public.schools(school_code);

-- 1.2 Profiles (Linked 1:1 to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_profiles_school_id ON public.profiles(school_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 1.3 Classes
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. 'XII', 'X', '1'
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT uq_class_school_name UNIQUE (school_id, name)
);

CREATE INDEX IF NOT EXISTS idx_classes_school_id ON public.classes(school_id);

-- 1.4 Sections
CREATE TABLE IF NOT EXISTS public.sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. 'A', 'B'
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT uq_section_class_name UNIQUE (class_id, name)
);

CREATE INDEX IF NOT EXISTS idx_sections_school_id ON public.sections(school_id);
CREATE INDEX IF NOT EXISTS idx_sections_class_id ON public.sections(class_id);

-- 1.5 Students
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    admission_no TEXT NOT NULL,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL,
    date_of_birth DATE,
    gender TEXT,
    address TEXT,
    admission_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT uq_student_admission_no UNIQUE (school_id, admission_no)
);

CREATE INDEX IF NOT EXISTS idx_students_school_id ON public.students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_class_section ON public.students(class_id, section_id);
CREATE INDEX IF NOT EXISTS idx_students_profile_id ON public.students(profile_id);

-- 1.6 Parent-Student Links
CREATE TABLE IF NOT EXISTS public.parent_student_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    parent_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    relation family_relation NOT NULL DEFAULT 'guardian',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT uq_parent_student UNIQUE (parent_profile_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_psl_school_id ON public.parent_student_links(school_id);
CREATE INDEX IF NOT EXISTS idx_psl_parent ON public.parent_student_links(parent_profile_id);
CREATE INDEX IF NOT EXISTS idx_psl_student ON public.parent_student_links(student_id);

-- 1.7 Staff
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    designation TEXT NOT NULL,
    subjects_taught TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_staff_school_id ON public.staff(school_id);
CREATE INDEX IF NOT EXISTS idx_staff_profile_id ON public.staff(profile_id);

-- ============================================================================
-- 2. ATTENDANCE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status attendance_status NOT NULL DEFAULT 'present',
    marked_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    remark TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT uq_attendance_student_date UNIQUE (student_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_school_id ON public.attendance_records(school_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON public.attendance_records(student_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_school_date ON public.attendance_records(school_id, date);

-- ============================================================================
-- 3. HOMEWORK & ASSIGNMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.homework (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type homework_type NOT NULL DEFAULT 'homework',
    due_date DATE NOT NULL,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    attachment_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_homework_school_id ON public.homework(school_id);
CREATE INDEX IF NOT EXISTS idx_homework_class_section ON public.homework(class_id, section_id);
CREATE INDEX IF NOT EXISTS idx_homework_due_date ON public.homework(due_date);

CREATE TABLE IF NOT EXISTS public.homework_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    homework_id UUID NOT NULL REFERENCES public.homework(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    status homework_submission_status NOT NULL DEFAULT 'pending',
    submission_notes TEXT,
    attachment_url TEXT,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT uq_homework_student UNIQUE (homework_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_homework_status_school_id ON public.homework_status(school_id);
CREATE INDEX IF NOT EXISTS idx_homework_status_student ON public.homework_status(student_id);

-- ============================================================================
-- 4. FEES & PAYMENTS (MONEY STORED AS INTEGER PAISE)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.fee_structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    academic_year TEXT NOT NULL, -- e.g. '2026-2027'
    installment_name TEXT NOT NULL, -- e.g. 'Term 1 / April-June'
    due_date DATE NOT NULL,
    amount_paise BIGINT NOT NULL CHECK (amount_paise >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT uq_fee_structure_class_install UNIQUE (school_id, class_id, academic_year, installment_name)
);

CREATE INDEX IF NOT EXISTS idx_fee_structures_school_id ON public.fee_structures(school_id);
CREATE INDEX IF NOT EXISTS idx_fee_structures_class ON public.fee_structures(class_id);

CREATE TABLE IF NOT EXISTS public.student_fee_dues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    fee_structure_id UUID NOT NULL REFERENCES public.fee_structures(id) ON DELETE RESTRICT,
    amount_due_paise BIGINT NOT NULL CHECK (amount_due_paise >= 0),
    amount_paid_paise BIGINT NOT NULL DEFAULT 0 CHECK (amount_paid_paise >= 0),
    late_fee_paise BIGINT NOT NULL DEFAULT 0 CHECK (late_fee_paise >= 0),
    status fee_due_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT uq_student_fee_due UNIQUE (student_id, fee_structure_id)
);

CREATE INDEX IF NOT EXISTS idx_student_fee_dues_school_id ON public.student_fee_dues(school_id);
CREATE INDEX IF NOT EXISTS idx_student_fee_dues_student ON public.student_fee_dues(student_id);
CREATE INDEX IF NOT EXISTS idx_student_fee_dues_status ON public.student_fee_dues(status);

CREATE TABLE IF NOT EXISTS public.fee_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    student_fee_due_id UUID NOT NULL REFERENCES public.student_fee_dues(id) ON DELETE RESTRICT,
    amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    status TEXT NOT NULL DEFAULT 'captured', -- created, authorized, captured, failed
    paid_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    receipt_no TEXT NOT NULL,
    payment_mode TEXT DEFAULT 'online', -- online, cash, cheque, upi
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT uq_receipt_no_school UNIQUE (school_id, receipt_no)
);

CREATE INDEX IF NOT EXISTS idx_fee_payments_school_id ON public.fee_payments(school_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_student ON public.fee_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_order ON public.fee_payments(razorpay_order_id);

-- ============================================================================
-- 5. COMMUNICATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.circulars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    target_class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL, -- NULL = whole school
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    send_whatsapp BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_circulars_school_id ON public.circulars(school_id);
CREATE INDEX IF NOT EXISTS idx_circulars_target_class ON public.circulars(target_class_id);

CREATE TABLE IF NOT EXISTS public.circular_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    circular_id UUID NOT NULL REFERENCES public.circulars(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT uq_circular_student_read UNIQUE (circular_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_circular_reads_school_id ON public.circular_reads(school_id);
CREATE INDEX IF NOT EXISTS idx_circular_reads_student ON public.circular_reads(student_id);

CREATE TABLE IF NOT EXISTS public.remarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    given_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    remark_text TEXT NOT NULL,
    remark_type remark_sentiment NOT NULL DEFAULT 'neutral',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_remarks_school_id ON public.remarks(school_id);
CREATE INDEX IF NOT EXISTS idx_remarks_student ON public.remarks(student_id);

-- ============================================================================
-- 6. LIBRARY
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.library_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    accession_no TEXT NOT NULL, -- Barcode / Unique accession number within school
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    publisher TEXT,
    subject TEXT,
    book_type TEXT DEFAULT 'General',
    total_copies INTEGER NOT NULL DEFAULT 1 CHECK (total_copies >= 0),
    available_copies INTEGER NOT NULL DEFAULT 1 CHECK (available_copies >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT uq_book_accession_school UNIQUE (school_id, accession_no),
    CONSTRAINT chk_copies CHECK (available_copies <= total_copies)
);

CREATE INDEX IF NOT EXISTS idx_library_books_school_id ON public.library_books(school_id);
CREATE INDEX IF NOT EXISTS idx_library_books_accession ON public.library_books(school_id, accession_no);

CREATE TABLE IF NOT EXISTS public.library_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES public.library_books(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    due_at TIMESTAMPTZ NOT NULL,
    returned_at TIMESTAMPTZ,
    status library_tx_status NOT NULL DEFAULT 'issued',
    fine_paise BIGINT NOT NULL DEFAULT 0 CHECK (fine_paise >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_library_tx_school_id ON public.library_transactions(school_id);
CREATE INDEX IF NOT EXISTS idx_library_tx_student ON public.library_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_library_tx_status ON public.library_transactions(status);

-- ============================================================================
-- 7. TRANSPORT
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.transport_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    route_name TEXT NOT NULL,
    vehicle_no TEXT NOT NULL,
    driver_name TEXT NOT NULL,
    driver_phone TEXT NOT NULL,
    conductor_name TEXT,
    conductor_phone TEXT,
    incharge_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT uq_route_vehicle_school UNIQUE (school_id, vehicle_no)
);

CREATE INDEX IF NOT EXISTS idx_transport_routes_school_id ON public.transport_routes(school_id);

CREATE TABLE IF NOT EXISTS public.transport_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    route_id UUID NOT NULL REFERENCES public.transport_routes(id) ON DELETE CASCADE,
    stop_name TEXT NOT NULL,
    sequence_no INTEGER NOT NULL,
    scheduled_time TIME NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT uq_route_stop_sequence UNIQUE (route_id, sequence_no)
);

CREATE INDEX IF NOT EXISTS idx_transport_stops_school_id ON public.transport_stops(school_id);
CREATE INDEX IF NOT EXISTS idx_transport_stops_route ON public.transport_stops(route_id);

CREATE TABLE IF NOT EXISTS public.student_transport (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL UNIQUE REFERENCES public.students(id) ON DELETE CASCADE,
    route_id UUID NOT NULL REFERENCES public.transport_routes(id) ON DELETE RESTRICT,
    pickup_stop_id UUID REFERENCES public.transport_stops(id) ON DELETE RESTRICT,
    drop_stop_id UUID REFERENCES public.transport_stops(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_student_transport_school_id ON public.student_transport(school_id);
CREATE INDEX IF NOT EXISTS idx_student_transport_route ON public.student_transport(route_id);

-- Live Bus Location (updated every 10-15s, partitioned or index-optimized)
CREATE TABLE IF NOT EXISTS public.transport_live_location (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    route_id UUID NOT NULL REFERENCES public.transport_routes(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    speed DOUBLE PRECISION,
    heading DOUBLE PRECISION,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_live_location_school_id ON public.transport_live_location(school_id);
CREATE INDEX IF NOT EXISTS idx_live_location_route_recorded ON public.transport_live_location(route_id, recorded_at DESC);

-- ============================================================================
-- 8. RESULTS & EXAMINATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. 'Term 1 Mid-Term Examination'
    academic_year TEXT NOT NULL, -- e.g. '2026-2027'
    exam_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT uq_exam_school_class_name UNIQUE (school_id, class_id, academic_year, name)
);

CREATE INDEX IF NOT EXISTS idx_exams_school_id ON public.exams(school_id);
CREATE INDEX IF NOT EXISTS idx_exams_class ON public.exams(class_id);

CREATE TABLE IF NOT EXISTS public.exam_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    marks_obtained NUMERIC(5, 2) NOT NULL CHECK (marks_obtained >= 0),
    max_marks NUMERIC(5, 2) NOT NULL CHECK (max_marks > 0),
    grade TEXT,
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT uq_exam_student_subject UNIQUE (exam_id, student_id, subject),
    CONSTRAINT chk_marks_valid CHECK (marks_obtained <= max_marks)
);

CREATE INDEX IF NOT EXISTS idx_exam_results_school_id ON public.exam_results(school_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_student ON public.exam_results(student_id);

CREATE TABLE IF NOT EXISTS public.report_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    pdf_url TEXT NOT NULL,
    published_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT uq_report_card_student_exam UNIQUE (student_id, exam_id)
);

CREATE INDEX IF NOT EXISTS idx_report_cards_school_id ON public.report_cards(school_id);
CREATE INDEX IF NOT EXISTS idx_report_cards_student ON public.report_cards(student_id);

-- ============================================================================
-- 9. CALENDAR
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    event_type calendar_event_type NOT NULL DEFAULT 'event',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT chk_dates_order CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_school_id ON public.calendar_events(school_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_dates ON public.calendar_events(start_date, end_date);

-- ============================================================================
-- 10. GALLERY
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.gallery_albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    month TEXT NOT NULL, -- e.g. 'August'
    academic_year TEXT NOT NULL, -- e.g. '2026-2027'
    cover_image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_gallery_albums_school_id ON public.gallery_albums(school_id);

CREATE TABLE IF NOT EXISTS public.gallery_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    album_id UUID NOT NULL REFERENCES public.gallery_albums(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_gallery_photos_school_id ON public.gallery_photos(school_id);
CREATE INDEX IF NOT EXISTS idx_gallery_photos_album ON public.gallery_photos(album_id);

-- ============================================================================
-- 11. INFIRMARY
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.infirmary_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    visit_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    departure_date TIMESTAMPTZ,
    medicine_name TEXT,
    reason TEXT NOT NULL,
    checked_by TEXT NOT NULL,
    prescription_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_infirmary_visits_school_id ON public.infirmary_visits(school_id);
CREATE INDEX IF NOT EXISTS idx_infirmary_visits_student ON public.infirmary_visits(student_id);

-- ============================================================================
-- 12. NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'system', -- fee, homework, attendance, transport, circular
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_notifications_school_id ON public.notifications(school_id);
CREATE INDEX IF NOT EXISTS idx_notifications_profile_read ON public.notifications(profile_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

-- ============================================================================
-- AUTOMATIC updated_at TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to applicable tables
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN
        SELECT table_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND column_name = 'updated_at'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS trg_set_updated_at ON public.%I;
            CREATE TRIGGER trg_set_updated_at
            BEFORE UPDATE ON public.%I
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_updated_at();
        ', tbl, tbl);
    END LOOP;
END;
$$;
