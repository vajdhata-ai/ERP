-- ============================================================================
-- VAJDHATA SCHOOL ERP - STAGE 6: HOMEWORK & ASSIGNMENTS MIGRATION
-- Migration: 20260914000004_homework_features.sql
-- ============================================================================

-- 1. Allow nullable due_date (pure 'homework' vs graded 'assignment')
ALTER TABLE public.homework ALTER COLUMN due_date DROP NOT NULL;

-- 2. Add teacher_remarks and attachment_name columns if not existing
ALTER TABLE public.homework ADD COLUMN IF NOT EXISTS teacher_remarks TEXT;
ALTER TABLE public.homework ADD COLUMN IF NOT EXISTS attachment_name TEXT;

-- 3. Storage bucket for homework-attachments (if storage schema exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'storage' AND table_name = 'buckets'
    ) THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('homework-attachments', 'homework-attachments', true)
        ON CONFLICT (id) DO UPDATE SET public = true;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'storage' AND table_name = 'objects'
    ) THEN
        DROP POLICY IF EXISTS "homework_attachments_public_select" ON storage.objects;
        CREATE POLICY "homework_attachments_public_select" ON storage.objects
            FOR SELECT TO authenticated, anon
            USING (bucket_id = 'homework-attachments');

        DROP POLICY IF EXISTS "homework_attachments_staff_insert" ON storage.objects;
        CREATE POLICY "homework_attachments_staff_insert" ON storage.objects
            FOR INSERT TO authenticated
            WITH CHECK (bucket_id = 'homework-attachments');

        DROP POLICY IF EXISTS "homework_attachments_staff_update" ON storage.objects;
        CREATE POLICY "homework_attachments_staff_update" ON storage.objects
            FOR UPDATE TO authenticated
            USING (bucket_id = 'homework-attachments');

        DROP POLICY IF EXISTS "homework_attachments_staff_delete" ON storage.objects;
        CREATE POLICY "homework_attachments_staff_delete" ON storage.objects
            FOR DELETE TO authenticated
            USING (bucket_id = 'homework-attachments');
    END IF;
EXCEPTION
    WHEN undefined_table THEN null;
END $$;
