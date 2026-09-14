-- ============================================================================
-- VAJDHATA SCHOOL ERP - STAGE 5: ATTENDANCE MODULE INDEXES
-- Migration: 20260914000003_attendance_indexes.sql
-- Adds composite indexes to speed up section-date roster lookups
-- and student attendance history queries.
-- ============================================================================

-- Composite index for teacher page: fetch all records for a school on a given date
CREATE INDEX IF NOT EXISTS idx_attendance_school_date_student
    ON public.attendance_records(school_id, date, student_id);

-- Index for student analytics: fetch all records for a given student by year range
CREATE INDEX IF NOT EXISTS idx_attendance_student_date_desc
    ON public.attendance_records(student_id, date DESC);

-- Index on notifications for attendance type (used in parent notification queries)
CREATE INDEX IF NOT EXISTS idx_notifications_type
    ON public.notifications(school_id, type, created_at DESC);
