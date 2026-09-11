-- ============================================================================
-- VAJDHATA SCHOOL ERP - STAGE 1: ROW LEVEL SECURITY (RLS) POLICIES
-- Migration: 20260911000002_rls_policies.sql
-- ============================================================================

-- ============================================================================
-- STEP 1: ENABLE ROW LEVEL SECURITY ON EVERY SINGLE TABLE (100% COVERAGE)
-- ============================================================================
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_student_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_fee_dues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circulars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circular_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_transport ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_live_location ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infirmary_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: REUSABLE RLS HELPER FUNCTIONS (SECURITY DEFINER)
-- ============================================================================

-- Helper: Get current authenticated user's profile
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS public.profiles AS $$
    SELECT *
    FROM public.profiles
    WHERE id = auth.uid()
    LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: Get current authenticated user's school_id
CREATE OR REPLACE FUNCTION public.get_my_school_id()
RETURNS UUID AS $$
    SELECT school_id
    FROM public.profiles
    WHERE id = auth.uid()
    LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: Get current authenticated user's role
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.user_role AS $$
    SELECT role
    FROM public.profiles
    WHERE id = auth.uid()
    LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: Check if current user is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid() AND role = 'super_admin'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: Check if current user is school_admin for current school
CREATE OR REPLACE FUNCTION public.is_school_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: Check if current user is staff (admin, teacher, accountant, librarian)
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
          AND role IN ('super_admin', 'school_admin', 'teacher', 'accountant', 'librarian')
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: Get student_id for the logged in student
CREATE OR REPLACE FUNCTION public.get_my_student_id()
RETURNS UUID AS $$
    SELECT id
    FROM public.students
    WHERE profile_id = auth.uid()
    LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: Get all student IDs associated with current user (self if student, children if parent)
CREATE OR REPLACE FUNCTION public.get_my_student_ids()
RETURNS TABLE (student_id UUID) AS $$
BEGIN
    RETURN QUERY
    -- If user is student
    SELECT s.id AS student_id
    FROM public.students s
    WHERE s.profile_id = auth.uid()
    UNION
    -- If user is parent
    SELECT psl.student_id
    FROM public.parent_student_links psl
    WHERE psl.parent_profile_id = auth.uid();
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Helper: Check if a student belongs to the current user (either self or parent's child)
CREATE OR REPLACE FUNCTION public.is_my_child_or_self(target_student_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.get_my_student_ids() g
        WHERE g.student_id = target_student_id
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================================
-- STEP 3: GRANULAR RLS POLICIES FOR EACH TABLE
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. SCHOOLS
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "schools_super_admin_all" ON public.schools;
CREATE POLICY "schools_super_admin_all" ON public.schools
    FOR ALL
    TO authenticated
    USING (public.is_super_admin());

DROP POLICY IF EXISTS "schools_view_own" ON public.schools;
CREATE POLICY "schools_view_own" ON public.schools
    FOR SELECT
    TO authenticated
    USING (id = public.get_my_school_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "schools_anon_login_lookup" ON public.schools;
CREATE POLICY "schools_anon_login_lookup" ON public.schools
    FOR SELECT
    TO anon
    USING (is_active = true);

-- ----------------------------------------------------------------------------
-- 2. PROFILES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_super_admin_all" ON public.profiles;
CREATE POLICY "profiles_super_admin_all" ON public.profiles
    FOR ALL
    TO authenticated
    USING (public.is_super_admin());

DROP POLICY IF EXISTS "profiles_view_school" ON public.profiles;
CREATE POLICY "profiles_view_school" ON public.profiles
    FOR SELECT
    TO authenticated
    USING (
        school_id = public.get_my_school_id()
        OR id = auth.uid()
        OR public.is_super_admin()
    );

DROP POLICY IF EXISTS "profiles_admin_manage" ON public.profiles;
CREATE POLICY "profiles_admin_manage" ON public.profiles
    FOR ALL
    TO authenticated
    USING (
        (school_id = public.get_my_school_id() AND public.is_school_admin())
        OR public.is_super_admin()
    )
    WITH CHECK (
        (school_id = public.get_my_school_id() AND public.is_school_admin())
        OR public.is_super_admin()
    );

DROP POLICY IF EXISTS "profiles_update_self" ON public.profiles;
CREATE POLICY "profiles_update_self" ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- ----------------------------------------------------------------------------
-- 3. CLASSES & SECTIONS
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "classes_view_school" ON public.classes;
CREATE POLICY "classes_view_school" ON public.classes
    FOR SELECT
    TO authenticated
    USING (school_id = public.get_my_school_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "classes_admin_manage" ON public.classes;
CREATE POLICY "classes_admin_manage" ON public.classes
    FOR ALL
    TO authenticated
    USING ((school_id = public.get_my_school_id() AND public.is_school_admin()) OR public.is_super_admin())
    WITH CHECK ((school_id = public.get_my_school_id() AND public.is_school_admin()) OR public.is_super_admin());

DROP POLICY IF EXISTS "sections_view_school" ON public.sections;
CREATE POLICY "sections_view_school" ON public.sections
    FOR SELECT
    TO authenticated
    USING (school_id = public.get_my_school_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "sections_admin_manage" ON public.sections;
CREATE POLICY "sections_admin_manage" ON public.sections
    FOR ALL
    TO authenticated
    USING ((school_id = public.get_my_school_id() AND public.is_school_admin()) OR public.is_super_admin())
    WITH CHECK ((school_id = public.get_my_school_id() AND public.is_school_admin()) OR public.is_super_admin());

-- ----------------------------------------------------------------------------
-- 4. STUDENTS
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "students_view" ON public.students;
CREATE POLICY "students_view" ON public.students
    FOR SELECT
    TO authenticated
    USING (
        (school_id = public.get_my_school_id() AND public.is_staff())
        OR public.is_my_child_or_self(id)
        OR public.is_super_admin()
    );

DROP POLICY IF EXISTS "students_admin_manage" ON public.students;
CREATE POLICY "students_admin_manage" ON public.students
    FOR ALL
    TO authenticated
    USING ((school_id = public.get_my_school_id() AND public.is_school_admin()) OR public.is_super_admin())
    WITH CHECK ((school_id = public.get_my_school_id() AND public.is_school_admin()) OR public.is_super_admin());

-- ----------------------------------------------------------------------------
-- 5. PARENT_STUDENT_LINKS
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "psl_view" ON public.parent_student_links;
CREATE POLICY "psl_view" ON public.parent_student_links
    FOR SELECT
    TO authenticated
    USING (
        (school_id = public.get_my_school_id() AND public.is_staff())
        OR parent_profile_id = auth.uid()
        OR student_id = public.get_my_student_id()
        OR public.is_super_admin()
    );

DROP POLICY IF EXISTS "psl_admin_manage" ON public.parent_student_links;
CREATE POLICY "psl_admin_manage" ON public.parent_student_links
    FOR ALL
    TO authenticated
    USING ((school_id = public.get_my_school_id() AND public.is_school_admin()) OR public.is_super_admin())
    WITH CHECK ((school_id = public.get_my_school_id() AND public.is_school_admin()) OR public.is_super_admin());

-- ----------------------------------------------------------------------------
-- 6. STAFF
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "staff_view" ON public.staff;
CREATE POLICY "staff_view" ON public.staff
    FOR SELECT
    TO authenticated
    USING (school_id = public.get_my_school_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "staff_admin_manage" ON public.staff;
CREATE POLICY "staff_admin_manage" ON public.staff
    FOR ALL
    TO authenticated
    USING ((school_id = public.get_my_school_id() AND public.is_school_admin()) OR public.is_super_admin())
    WITH CHECK ((school_id = public.get_my_school_id() AND public.is_school_admin()) OR public.is_super_admin());

-- ----------------------------------------------------------------------------
-- 7. ATTENDANCE_RECORDS
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "attendance_view" ON public.attendance_records;
CREATE POLICY "attendance_view" ON public.attendance_records
    FOR SELECT
    TO authenticated
    USING (
        (school_id = public.get_my_school_id() AND public.is_staff())
        OR public.is_my_child_or_self(student_id)
        OR public.is_super_admin()
    );

DROP POLICY IF EXISTS "attendance_staff_manage" ON public.attendance_records;
CREATE POLICY "attendance_staff_manage" ON public.attendance_records
    FOR ALL
    TO authenticated
    USING (
        (school_id = public.get_my_school_id() AND public.get_my_role() IN ('super_admin', 'school_admin', 'teacher'))
        OR public.is_super_admin()
    )
    WITH CHECK (
        (school_id = public.get_my_school_id() AND public.get_my_role() IN ('super_admin', 'school_admin', 'teacher'))
        OR public.is_super_admin()
    );

-- ----------------------------------------------------------------------------
-- 8. HOMEWORK & HOMEWORK_STATUS
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "homework_view" ON public.homework;
CREATE POLICY "homework_view" ON public.homework
    FOR SELECT
    TO authenticated
    USING (school_id = public.get_my_school_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "homework_teacher_admin_manage" ON public.homework;
CREATE POLICY "homework_teacher_admin_manage" ON public.homework
    FOR ALL
    TO authenticated
    USING (
        (school_id = public.get_my_school_id() AND public.get_my_role() IN ('super_admin', 'school_admin', 'teacher'))
        OR public.is_super_admin()
    )
    WITH CHECK (
        (school_id = public.get_my_school_id() AND public.get_my_role() IN ('super_admin', 'school_admin', 'teacher'))
        OR public.is_super_admin()
    );

DROP POLICY IF EXISTS "hw_status_view" ON public.homework_status;
CREATE POLICY "hw_status_view" ON public.homework_status
    FOR SELECT
    TO authenticated
    USING (
        (school_id = public.get_my_school_id() AND public.is_staff())
        OR public.is_my_child_or_self(student_id)
        OR public.is_super_admin()
    );

DROP POLICY IF EXISTS "hw_status_student_submit" ON public.homework_status;
CREATE POLICY "hw_status_student_submit" ON public.homework_status
    FOR INSERT
    TO authenticated
    WITH CHECK (
        school_id = public.get_my_school_id()
        AND (student_id = public.get_my_student_id() OR public.is_staff() OR public.is_super_admin())
    );

DROP POLICY IF EXISTS "hw_status_student_update" ON public.homework_status;
CREATE POLICY "hw_status_student_update" ON public.homework_status
    FOR UPDATE
    TO authenticated
    USING (
        school_id = public.get_my_school_id()
        AND (student_id = public.get_my_student_id() OR public.is_staff() OR public.is_super_admin())
    )
    WITH CHECK (
        school_id = public.get_my_school_id()
        AND (student_id = public.get_my_student_id() OR public.is_staff() OR public.is_super_admin())
    );

-- ----------------------------------------------------------------------------
-- 9. FEES & PAYMENTS
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "fee_structures_view" ON public.fee_structures;
CREATE POLICY "fee_structures_view" ON public.fee_structures
    FOR SELECT
    TO authenticated
    USING (school_id = public.get_my_school_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "fee_structures_admin_manage" ON public.fee_structures;
CREATE POLICY "fee_structures_admin_manage" ON public.fee_structures
    FOR ALL
    TO authenticated
    USING (
        (school_id = public.get_my_school_id() AND public.get_my_role() IN ('super_admin', 'school_admin', 'accountant'))
        OR public.is_super_admin()
    )
    WITH CHECK (
        (school_id = public.get_my_school_id() AND public.get_my_role() IN ('super_admin', 'school_admin', 'accountant'))
        OR public.is_super_admin()
    );

DROP POLICY IF EXISTS "fee_dues_view" ON public.student_fee_dues;
CREATE POLICY "fee_dues_view" ON public.student_fee_dues
    FOR SELECT
    TO authenticated
    USING (
        (school_id = public.get_my_school_id() AND public.get_my_role() IN ('super_admin', 'school_admin', 'accountant'))
        OR public.is_my_child_or_self(student_id)
        OR public.is_super_admin()
    );

DROP POLICY IF EXISTS "fee_dues_admin_manage" ON public.student_fee_dues;
CREATE POLICY "fee_dues_admin_manage" ON public.student_fee_dues
    FOR ALL
    TO authenticated
    USING (
        (school_id = public.get_my_school_id() AND public.get_my_role() IN ('super_admin', 'school_admin', 'accountant'))
        OR public.is_super_admin()
    )
    WITH CHECK (
        (school_id = public.get_my_school_id() AND public.get_my_role() IN ('super_admin', 'school_admin', 'accountant'))
        OR public.is_super_admin()
    );

DROP POLICY IF EXISTS "fee_payments_view" ON public.fee_payments;
CREATE POLICY "fee_payments_view" ON public.fee_payments
    FOR SELECT
    TO authenticated
    USING (
        (school_id = public.get_my_school_id() AND public.get_my_role() IN ('super_admin', 'school_admin', 'accountant'))
        OR public.is_my_child_or_self(student_id)
        OR public.is_super_admin()
    );

DROP POLICY IF EXISTS "fee_payments_manage" ON public.fee_payments;
CREATE POLICY "fee_payments_manage" ON public.fee_payments
    FOR ALL
    TO authenticated
    USING (
        (school_id = public.get_my_school_id() AND public.get_my_role() IN ('super_admin', 'school_admin', 'accountant'))
        OR public.is_super_admin()
    )
    WITH CHECK (
        (school_id = public.get_my_school_id() AND public.get_my_role() IN ('super_admin', 'school_admin', 'accountant'))
        OR public.is_super_admin()
    );

-- ----------------------------------------------------------------------------
-- 10. CIRCULARS & REMARKS
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "circulars_view" ON public.circulars;
CREATE POLICY "circulars_view" ON public.circulars
    FOR SELECT
    TO authenticated
    USING (school_id = public.get_my_school_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "circulars_admin_manage" ON public.circulars;
CREATE POLICY "circulars_admin_manage" ON public.circulars
    FOR ALL
    TO authenticated
    USING (
        (school_id = public.get_my_school_id() AND public.is_school_admin())
        OR public.is_super_admin()
    )
    WITH CHECK (
        (school_id = public.get_my_school_id() AND public.is_school_admin())
        OR public.is_super_admin()
    );

DROP POLICY IF EXISTS "circular_reads_view" ON public.circular_reads;
CREATE POLICY "circular_reads_view" ON public.circular_reads
    FOR SELECT
    TO authenticated
    USING (
        (school_id = public.get_my_school_id() AND public.is_staff())
        OR public.is_my_child_or_self(student_id)
        OR public.is_super_admin()
    );

DROP POLICY IF EXISTS "circular_reads_insert" ON public.circular_reads;
CREATE POLICY "circular_reads_insert" ON public.circular_reads
    FOR INSERT
    TO authenticated
    WITH CHECK (
        school_id = public.get_my_school_id()
        AND (public.is_my_child_or_self(student_id) OR public.is_super_admin())
    );

DROP POLICY IF EXISTS "remarks_view" ON public.remarks;
CREATE POLICY "remarks_view" ON public.remarks
    FOR SELECT
    TO authenticated
    USING (
        (school_id = public.get_my_school_id() AND public.is_staff())
        OR public.is_my_child_or_self(student_id)
        OR public.is_super_admin()
    );

DROP POLICY IF EXISTS "remarks_staff_manage" ON public.remarks;
CREATE POLICY "remarks_staff_manage" ON public.remarks
    FOR ALL
    TO authenticated
    USING (
        (school_id = public.get_my_school_id() AND public.get_my_role() IN ('super_admin', 'school_admin', 'teacher'))
        OR public.is_super_admin()
    )
    WITH CHECK (
        (school_id = public.get_my_school_id() AND public.get_my_role() IN ('super_admin', 'school_admin', 'teacher'))
        OR public.is_super_admin()
    );

-- ----------------------------------------------------------------------------
-- 11. LIBRARY
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "library_books_view" ON public.library_books;
CREATE POLICY "library_books_view" ON public.library_books
    FOR SELECT
    TO authenticated
    USING (school_id = public.get_my_school_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "library_books_manage" ON public.library_books;
CREATE POLICY "library_books_manage" ON public.library_books
    FOR ALL
    TO authenticated
    USING (
        (school_id = public.get_my_school_id() AND public.get_my_role() IN ('super_admin', 'school_admin', 'librarian'))
        OR public.is_super_admin()
    )
    WITH CHECK (
        (school_id = public.get_my_school_id() AND public.get_my_role() IN ('super_admin', 'school_admin', 'librarian'))
        OR public.is_super_admin()
    );

DROP POLICY IF EXISTS "library_tx_view" ON public.library_transactions;
CREATE POLICY "library_tx_view" ON public.library_transactions
    FOR SELECT
    TO authenticated
    USING (
        (school_id = public.get_my_school_id() AND public.get_my_role() IN ('super_admin', 'school_admin', 'librarian'))
        OR public.is_my_child_or_self(student_id)
        OR public.is_super_admin()
    );

DROP POLICY IF EXISTS "library_tx_manage" ON public.library_transactions;
CREATE POLICY "library_tx_manage" ON public.library_transactions
    FOR ALL
    TO authenticated
    USING (
        (school_id = public.get_my_school_id() AND public.get_my_role() IN ('super_admin', 'school_admin', 'librarian'))
        OR public.is_super_admin()
    )
    WITH CHECK (
        (school_id = public.get_my_school_id() AND public.get_my_role() IN ('super_admin', 'school_admin', 'librarian'))
        OR public.is_super_admin()
    );

-- ----------------------------------------------------------------------------
-- 12. TRANSPORT
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "transport_routes_view" ON public.transport_routes;
CREATE POLICY "transport_routes_view" ON public.transport_routes
    FOR SELECT
    TO authenticated
    USING (school_id = public.get_my_school_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "transport_routes_manage" ON public.transport_routes;
CREATE POLICY "transport_routes_manage" ON public.transport_routes
    FOR ALL
    TO authenticated
    USING ((school_id = public.get_my_school_id() AND public.is_school_admin()) OR public.is_super_admin())
    WITH CHECK ((school_id = public.get_my_school_id() AND public.is_school_admin()) OR public.is_super_admin());

DROP POLICY IF EXISTS "transport_stops_view" ON public.transport_stops;
CREATE POLICY "transport_stops_view" ON public.transport_stops
    FOR SELECT
    TO authenticated
    USING (school_id = public.get_my_school_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "transport_stops_manage" ON public.transport_stops;
CREATE POLICY "transport_stops_manage" ON public.transport_stops
    FOR ALL
    TO authenticated
    USING ((school_id = public.get_my_school_id() AND public.is_school_admin()) OR public.is_super_admin())
    WITH CHECK ((school_id = public.get_my_school_id() AND public.is_school_admin()) OR public.is_super_admin());

DROP POLICY IF EXISTS "student_transport_view" ON public.student_transport;
CREATE POLICY "student_transport_view" ON public.student_transport
    FOR SELECT
    TO authenticated
    USING (
        (school_id = public.get_my_school_id() AND public.is_staff())
        OR public.is_my_child_or_self(student_id)
        OR public.is_super_admin()
    );

DROP POLICY IF EXISTS "student_transport_manage" ON public.student_transport;
CREATE POLICY "student_transport_manage" ON public.student_transport
    FOR ALL
    TO authenticated
    USING ((school_id = public.get_my_school_id() AND public.is_school_admin()) OR public.is_super_admin())
    WITH CHECK ((school_id = public.get_my_school_id() AND public.is_school_admin()) OR public.is_super_admin());

DROP POLICY IF EXISTS "live_loc_view" ON public.transport_live_location;
CREATE POLICY "live_loc_view" ON public.transport_live_location
    FOR SELECT
    TO authenticated
    USING (school_id = public.get_my_school_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "live_loc_insert" ON public.transport_live_location;
CREATE POLICY "live_loc_insert" ON public.transport_live_location
    FOR INSERT
    TO authenticated
    WITH CHECK (
        (school_id = public.get_my_school_id() AND (public.is_staff() OR public.is_school_admin()))
        OR public.is_super_admin()
    );

-- ----------------------------------------------------------------------------
-- 13. RESULTS & EXAMS
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "exams_view" ON public.exams;
CREATE POLICY "exams_view" ON public.exams
    FOR SELECT
    TO authenticated
    USING (school_id = public.get_my_school_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "exams_manage" ON public.exams;
CREATE POLICY "exams_manage" ON public.exams
    FOR ALL
    TO authenticated
    USING (
        (school_id = public.get_my_school_id() AND public.get_my_role() IN ('super_admin', 'school_admin', 'teacher'))
        OR public.is_super_admin()
    )
    WITH CHECK (
        (school_id = public.get_my_school_id() AND public.get_my_role() IN ('super_admin', 'school_admin', 'teacher'))
        OR public.is_super_admin()
    );

DROP POLICY IF EXISTS "exam_results_view" ON public.exam_results;
CREATE POLICY "exam_results_view" ON public.exam_results
    FOR SELECT
    TO authenticated
    USING (
        (school_id = public.get_my_school_id() AND public.is_staff())
        OR public.is_my_child_or_self(student_id)
        OR public.is_super_admin()
    );

DROP POLICY IF EXISTS "exam_results_manage" ON public.exam_results;
CREATE POLICY "exam_results_manage" ON public.exam_results
    FOR ALL
    TO authenticated
    USING (
        (school_id = public.get_my_school_id() AND public.get_my_role() IN ('super_admin', 'school_admin', 'teacher'))
        OR public.is_super_admin()
    )
    WITH CHECK (
        (school_id = public.get_my_school_id() AND public.get_my_role() IN ('super_admin', 'school_admin', 'teacher'))
        OR public.is_super_admin()
    );

DROP POLICY IF EXISTS "report_cards_view" ON public.report_cards;
CREATE POLICY "report_cards_view" ON public.report_cards
    FOR SELECT
    TO authenticated
    USING (
        (school_id = public.get_my_school_id() AND public.is_staff())
        OR public.is_my_child_or_self(student_id)
        OR public.is_super_admin()
    );

DROP POLICY IF EXISTS "report_cards_manage" ON public.report_cards;
CREATE POLICY "report_cards_manage" ON public.report_cards
    FOR ALL
    TO authenticated
    USING (
        (school_id = public.get_my_school_id() AND public.get_my_role() IN ('super_admin', 'school_admin', 'teacher'))
        OR public.is_super_admin()
    )
    WITH CHECK (
        (school_id = public.get_my_school_id() AND public.get_my_role() IN ('super_admin', 'school_admin', 'teacher'))
        OR public.is_super_admin()
    );

-- ----------------------------------------------------------------------------
-- 14. CALENDAR
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "calendar_events_view" ON public.calendar_events;
CREATE POLICY "calendar_events_view" ON public.calendar_events
    FOR SELECT
    TO authenticated
    USING (school_id = public.get_my_school_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "calendar_events_manage" ON public.calendar_events;
CREATE POLICY "calendar_events_manage" ON public.calendar_events
    FOR ALL
    TO authenticated
    USING (
        (school_id = public.get_my_school_id() AND public.is_school_admin())
        OR public.is_super_admin()
    )
    WITH CHECK (
        (school_id = public.get_my_school_id() AND public.is_school_admin())
        OR public.is_super_admin()
    );

-- ----------------------------------------------------------------------------
-- 15. GALLERY
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "gallery_albums_view" ON public.gallery_albums;
CREATE POLICY "gallery_albums_view" ON public.gallery_albums
    FOR SELECT
    TO authenticated
    USING (school_id = public.get_my_school_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "gallery_albums_manage" ON public.gallery_albums;
CREATE POLICY "gallery_albums_manage" ON public.gallery_albums
    FOR ALL
    TO authenticated
    USING (
        (school_id = public.get_my_school_id() AND public.get_my_role() IN ('super_admin', 'school_admin', 'teacher'))
        OR public.is_super_admin()
    )
    WITH CHECK (
        (school_id = public.get_my_school_id() AND public.get_my_role() IN ('super_admin', 'school_admin', 'teacher'))
        OR public.is_super_admin()
    );

DROP POLICY IF EXISTS "gallery_photos_view" ON public.gallery_photos;
CREATE POLICY "gallery_photos_view" ON public.gallery_photos
    FOR SELECT
    TO authenticated
    USING (school_id = public.get_my_school_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "gallery_photos_manage" ON public.gallery_photos;
CREATE POLICY "gallery_photos_manage" ON public.gallery_photos
    FOR ALL
    TO authenticated
    USING (
        (school_id = public.get_my_school_id() AND public.get_my_role() IN ('super_admin', 'school_admin', 'teacher'))
        OR public.is_super_admin()
    )
    WITH CHECK (
        (school_id = public.get_my_school_id() AND public.get_my_role() IN ('super_admin', 'school_admin', 'teacher'))
        OR public.is_super_admin()
    );

-- ----------------------------------------------------------------------------
-- 16. INFIRMARY
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "infirmary_visits_view" ON public.infirmary_visits;
CREATE POLICY "infirmary_visits_view" ON public.infirmary_visits
    FOR SELECT
    TO authenticated
    USING (
        (school_id = public.get_my_school_id() AND public.is_staff())
        OR public.is_my_child_or_self(student_id)
        OR public.is_super_admin()
    );

DROP POLICY IF EXISTS "infirmary_visits_manage" ON public.infirmary_visits;
CREATE POLICY "infirmary_visits_manage" ON public.infirmary_visits
    FOR ALL
    TO authenticated
    USING (
        (school_id = public.get_my_school_id() AND public.is_staff())
        OR public.is_super_admin()
    )
    WITH CHECK (
        (school_id = public.get_my_school_id() AND public.is_staff())
        OR public.is_super_admin()
    );

-- ----------------------------------------------------------------------------
-- 17. NOTIFICATIONS
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "notifications_view_own" ON public.notifications;
CREATE POLICY "notifications_view_own" ON public.notifications
    FOR SELECT
    TO authenticated
    USING (profile_id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications
    FOR UPDATE
    TO authenticated
    USING (profile_id = auth.uid() OR public.is_super_admin())
    WITH CHECK (profile_id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "notifications_create_staff" ON public.notifications;
CREATE POLICY "notifications_create_staff" ON public.notifications
    FOR INSERT
    TO authenticated
    WITH CHECK (
        (school_id = public.get_my_school_id() AND public.is_staff())
        OR public.is_super_admin()
    );
