-- ============================================================================
-- VAJDHATA SCHOOL ERP - STAGE 1: SEED DATA
-- seed.sql: 1 school ('radiant'), 1 school_admin, 2 teachers, 1 librarian,
--           1 accountant, 3 students with linked parents, classes, sections,
--           homework, fees, transport, exams, etc.
-- ============================================================================

-- Fixed UUID Constants for deterministic relations
DO $$
DECLARE
    -- School
    v_school_id UUID := '11111111-1111-1111-1111-111111111111';
    
    -- Users / Profiles
    v_admin_uid UUID := 'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    v_teacher1_uid UUID := 'b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    v_teacher2_uid UUID := 'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    v_accountant_uid UUID := 'c1111111-cccc-cccc-cccc-cccccccccccc';
    v_librarian_uid UUID := 'd1111111-dddd-dddd-dddd-dddddddddddd';
    
    -- Students
    v_student1_uid UUID := 'e1111111-eeee-eeee-eeee-eeeeeeeeeeee';
    v_student2_uid UUID := 'e2222222-eeee-eeee-eeee-eeeeeeeeeeee';
    v_student3_uid UUID := 'e3333333-eeee-eeee-eeee-eeeeeeeeeeee';
    
    -- Parents
    v_parent1_uid UUID := 'f1111111-ffff-ffff-ffff-ffffffffffff';
    v_parent2_uid UUID := 'f2222222-ffff-ffff-ffff-ffffffffffff';
    v_parent3_uid UUID := 'f3333333-ffff-ffff-ffff-ffffffffffff';

    -- Academic
    v_class_xii_id UUID := '22222222-2222-2222-2222-222222222222';
    v_class_x_id UUID   := '22222222-2222-2222-2222-333333333333';
    v_sec_a_xii_id UUID := '33333333-3333-3333-3333-333333333331';
    v_sec_b_xii_id UUID := '33333333-3333-3333-3333-333333333332';
    v_sec_a_x_id UUID   := '33333333-3333-3333-3333-333333333333';

    -- Student primary keys
    v_student_rec1 UUID := '44444444-4444-4444-4444-444444444441';
    v_student_rec2 UUID := '44444444-4444-4444-4444-444444444442';
    v_student_rec3 UUID := '44444444-4444-4444-4444-444444444443';

    -- Transport
    v_route_1 UUID := '55555555-5555-5555-5555-555555555551';
    v_stop_1 UUID  := '55555555-5555-5555-5555-666666666661';
    v_stop_2 UUID  := '55555555-5555-5555-5555-666666666662';

    -- Fees
    v_fee_struct_1 UUID := '77777777-7777-7777-7777-777777777771';
    v_fee_due_1 UUID    := '77777777-7777-7777-7777-888888888881';

    -- Homework & Exams
    v_hw_1 UUID := '88888888-8888-8888-8888-888888888881';
    v_exam_1 UUID := '99999999-9999-9999-9999-999999999991';

    -- Books
    v_book_1 UUID := 'aaaaaaaa-bbbb-cccc-dddd-111111111111';
BEGIN

    -- ------------------------------------------------------------------------
    -- 1. SCHOOL
    -- ------------------------------------------------------------------------
    INSERT INTO public.schools (id, name, school_code, address, logo_url, subscription_plan, is_active)
    VALUES (
        v_school_id,
        'Radiant Public Senior Secondary School',
        'radiant',
        'Plot 42, Knowledge Park III, Greater Noida, Uttar Pradesh 201306',
        'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200&h=200&fit=crop',
        'enterprise',
        true
    ) ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        school_code = EXCLUDED.school_code;

    -- ------------------------------------------------------------------------
    -- 2. AUTH USERS (Insert dummy auth users if auth schema exists)
    -- ------------------------------------------------------------------------
    -- Password hash for 'Radiant@123'
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES
        (v_admin_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@radiant.edu', crypt('Radiant@123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Principal Dr. Sharma"}', now(), now()),
        (v_teacher1_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'verma.physics@radiant.edu', crypt('Radiant@123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Rajesh Verma"}', now(), now()),
        (v_teacher2_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'anita.maths@radiant.edu', crypt('Radiant@123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Anita Gupta"}', now(), now()),
        (v_accountant_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'accounts@radiant.edu', crypt('Radiant@123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Ramesh Tiwari"}', now(), now()),
        (v_librarian_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'library@radiant.edu', crypt('Radiant@123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Sunita Rao"}', now(), now()),
        (v_student1_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'aarav.patel@student.radiant.edu', crypt('Radiant@123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Aarav Patel"}', now(), now()),
        (v_student2_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'diya.sharma@student.radiant.edu', crypt('Radiant@123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Diya Sharma"}', now(), now()),
        (v_student3_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'kabir.singh@student.radiant.edu', crypt('Radiant@123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Kabir Singh"}', now(), now()),
        (v_parent1_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'vikram.patel@parents.radiant.edu', crypt('Radiant@123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Vikram Patel"}', now(), now()),
        (v_parent2_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'priya.sharma@parents.radiant.edu', crypt('Radiant@123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Priya Sharma"}', now(), now()),
        (v_parent3_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'harpreet.singh@parents.radiant.edu', crypt('Radiant@123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Harpreet Singh"}', now(), now())
    ON CONFLICT (id) DO NOTHING;

    -- ------------------------------------------------------------------------
    -- 3. PROFILES
    -- ------------------------------------------------------------------------
    INSERT INTO public.profiles (id, school_id, full_name, role, phone, is_active)
    VALUES
        (v_admin_uid, v_school_id, 'Dr. Vinod Sharma', 'school_admin', '+919876543210', true),
        (v_teacher1_uid, v_school_id, 'Rajesh Verma', 'teacher', '+919876543211', true),
        (v_teacher2_uid, v_school_id, 'Anita Gupta', 'teacher', '+919876543212', true),
        (v_accountant_uid, v_school_id, 'Ramesh Tiwari', 'accountant', '+919876543213', true),
        (v_librarian_uid, v_school_id, 'Sunita Rao', 'librarian', '+919876543214', true),
        (v_student1_uid, v_school_id, 'Aarav Patel', 'student', '+919876543215', true),
        (v_student2_uid, v_school_id, 'Diya Sharma', 'student', '+919876543216', true),
        (v_student3_uid, v_school_id, 'Kabir Singh', 'student', '+919876543217', true),
        (v_parent1_uid, v_school_id, 'Vikram Patel', 'parent', '+919876543218', true),
        (v_parent2_uid, v_school_id, 'Priya Sharma', 'parent', '+919876543219', true),
        (v_parent3_uid, v_school_id, 'Harpreet Singh', 'parent', '+919876543220', true)
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        school_id = EXCLUDED.school_id;

    -- ------------------------------------------------------------------------
    -- 4. STAFF DETAILS
    -- ------------------------------------------------------------------------
    INSERT INTO public.staff (id, school_id, profile_id, designation, subjects_taught)
    VALUES
        (gen_random_uuid(), v_school_id, v_admin_uid, 'Principal', ARRAY['Leadership', 'Ethics']),
        (gen_random_uuid(), v_school_id, v_teacher1_uid, 'Senior PGT Physics', ARRAY['Physics', 'Applied Science']),
        (gen_random_uuid(), v_school_id, v_teacher2_uid, 'TGT Mathematics', ARRAY['Mathematics', 'Statistics']),
        (gen_random_uuid(), v_school_id, v_accountant_uid, 'Chief Accountant', ARRAY[]::text[]),
        (gen_random_uuid(), v_school_id, v_librarian_uid, 'Chief Librarian', ARRAY[]::text[])
    ON CONFLICT (profile_id) DO NOTHING;

    -- ------------------------------------------------------------------------
    -- 5. CLASSES & SECTIONS
    -- ------------------------------------------------------------------------
    INSERT INTO public.classes (id, school_id, name)
    VALUES
        (v_class_xii_id, v_school_id, 'XII'),
        (v_class_x_id, v_school_id, 'X')
    ON CONFLICT (school_id, name) DO NOTHING;

    INSERT INTO public.sections (id, school_id, class_id, name)
    VALUES
        (v_sec_a_xii_id, v_school_id, v_class_xii_id, 'A'),
        (v_sec_b_xii_id, v_school_id, v_class_xii_id, 'B'),
        (v_sec_a_x_id, v_school_id, v_class_x_id, 'A')
    ON CONFLICT (class_id, name) DO NOTHING;

    -- ------------------------------------------------------------------------
    -- 6. STUDENTS & PARENT LINKS
    -- ------------------------------------------------------------------------
    INSERT INTO public.students (id, school_id, profile_id, admission_no, class_id, section_id, date_of_birth, gender, address, admission_date)
    VALUES
        (v_student_rec1, v_school_id, v_student1_uid, 'RAD-2024-001', v_class_xii_id, v_sec_a_xii_id, '2008-05-14', 'Male', 'Sector 62, Noida, UP', '2024-04-01'),
        (v_student_rec2, v_school_id, v_student2_uid, 'RAD-2024-002', v_class_xii_id, v_sec_a_xii_id, '2008-09-22', 'Female', 'Indirapuram, Ghaziabad, UP', '2024-04-01'),
        (v_student_rec3, v_school_id, v_student3_uid, 'RAD-2024-003', v_class_x_id, v_sec_a_x_id, '2010-12-05', 'Male', 'Alpha 1, Greater Noida, UP', '2024-04-02')
    ON CONFLICT (school_id, admission_no) DO NOTHING;

    INSERT INTO public.parent_student_links (school_id, parent_profile_id, student_id, relation)
    VALUES
        (v_school_id, v_parent1_uid, v_student_rec1, 'father'),
        (v_school_id, v_parent2_uid, v_student_rec2, 'mother'),
        (v_school_id, v_parent3_uid, v_student_rec3, 'father')
    ON CONFLICT (parent_profile_id, student_id) DO NOTHING;

    -- ------------------------------------------------------------------------
    -- 7. ATTENDANCE RECORDS
    -- ------------------------------------------------------------------------
    INSERT INTO public.attendance_records (school_id, student_id, date, status, marked_by, remark)
    VALUES
        (v_school_id, v_student_rec1, CURRENT_DATE, 'present', v_teacher1_uid, 'On time'),
        (v_school_id, v_student_rec2, CURRENT_DATE, 'present', v_teacher1_uid, 'Active in morning assembly'),
        (v_school_id, v_student_rec3, CURRENT_DATE, 'leave', v_teacher2_uid, 'Informed medical leave')
    ON CONFLICT (student_id, date) DO NOTHING;

    -- ------------------------------------------------------------------------
    -- 8. HOMEWORK & STATUS
    -- ------------------------------------------------------------------------
    INSERT INTO public.homework (id, school_id, class_id, section_id, subject, title, description, type, due_date, created_by)
    VALUES
        (v_hw_1, v_school_id, v_class_xii_id, v_sec_a_xii_id, 'Physics', 'Electromagnetic Induction Numerical Problems', 'Complete exercises 4.1 to 4.15 from Chapter 4 of NCERT textbook.', 'homework', CURRENT_DATE + 3, v_teacher1_uid)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.homework_status (school_id, homework_id, student_id, status)
    VALUES
        (v_school_id, v_hw_1, v_student_rec1, 'pending'),
        (v_school_id, v_hw_1, v_student_rec2, 'submitted')
    ON CONFLICT (homework_id, student_id) DO NOTHING;

    -- ------------------------------------------------------------------------
    -- 9. FEES (IN PAISE: 4500000 = Rs 45,000)
    -- ------------------------------------------------------------------------
    INSERT INTO public.fee_structures (id, school_id, class_id, academic_year, installment_name, due_date, amount_paise)
    VALUES
        (v_fee_struct_1, v_school_id, v_class_xii_id, '2026-2027', 'Quarter 1 (Apr-Jun)', CURRENT_DATE + 15, 4500000)
    ON CONFLICT (school_id, class_id, academic_year, installment_name) DO NOTHING;

    INSERT INTO public.student_fee_dues (id, school_id, student_id, fee_structure_id, amount_due_paise, amount_paid_paise, late_fee_paise, status)
    VALUES
        (v_fee_due_1, v_school_id, v_student_rec1, v_fee_struct_1, 4500000, 4500000, 0, 'paid'),
        (gen_random_uuid(), v_school_id, v_student_rec2, v_fee_struct_1, 4500000, 0, 0, 'pending')
    ON CONFLICT (student_id, fee_structure_id) DO NOTHING;

    INSERT INTO public.fee_payments (school_id, student_id, student_fee_due_id, amount_paise, razorpay_order_id, razorpay_payment_id, status, receipt_no, payment_mode)
    VALUES
        (v_school_id, v_student_rec1, v_fee_due_1, 4500000, 'order_mock_12345', 'pay_mock_98765', 'captured', 'RAD/REC/2026/0001', 'online')
    ON CONFLICT (school_id, receipt_no) DO NOTHING;

    -- ------------------------------------------------------------------------
    -- 10. LIBRARY
    -- ------------------------------------------------------------------------
    INSERT INTO public.library_books (id, school_id, accession_no, title, author, publisher, subject, total_copies, available_copies)
    VALUES
        (v_book_1, v_school_id, 'LIB-PHY-001', 'Concepts of Physics (Vol 1 & 2)', 'Dr. H.C. Verma', 'Bharati Bhawan', 'Physics', 10, 9)
    ON CONFLICT (school_id, accession_no) DO NOTHING;

    INSERT INTO public.library_transactions (school_id, book_id, student_id, issued_at, due_at, status, fine_paise)
    VALUES
        (v_school_id, v_book_1, v_student_rec1, now() - interval '2 days', now() + interval '12 days', 'issued', 0)
    ON CONFLICT DO NOTHING;

    -- ------------------------------------------------------------------------
    -- 11. TRANSPORT
    -- ------------------------------------------------------------------------
    INSERT INTO public.transport_routes (id, school_id, route_name, vehicle_no, driver_name, driver_phone, incharge_name)
    VALUES
        (v_route_1, v_school_id, 'Route 4 - Expressway Express', 'UP 16 BT 9921', 'Mahesh Yadav', '+919811223344', 'Suresh Chandra')
    ON CONFLICT (school_id, vehicle_no) DO NOTHING;

    INSERT INTO public.transport_stops (id, school_id, route_id, stop_name, sequence_no, scheduled_time)
    VALUES
        (v_stop_1, v_school_id, v_route_1, 'Sector 62 Metro Gate 2', 1, '07:15:00'),
        (v_stop_2, v_school_id, v_route_1, 'Pari Chowk Circle', 2, '07:45:00')
    ON CONFLICT (route_id, sequence_no) DO NOTHING;

    INSERT INTO public.student_transport (school_id, student_id, route_id, pickup_stop_id, drop_stop_id)
    VALUES
        (v_school_id, v_student_rec1, v_route_1, v_stop_1, v_stop_1)
    ON CONFLICT (student_id) DO NOTHING;

    INSERT INTO public.transport_live_location (school_id, route_id, latitude, longitude, speed, recorded_at)
    VALUES
        (v_school_id, v_route_1, 28.5355, 77.3910, 32.5, now());

    -- ------------------------------------------------------------------------
    -- 12. EXAMS & RESULTS
    -- ------------------------------------------------------------------------
    INSERT INTO public.exams (id, school_id, class_id, name, academic_year, exam_date)
    VALUES
        (v_exam_1, v_school_id, v_class_xii_id, 'Term 1 Mid-Term Examination', '2026-2027', CURRENT_DATE - 10)
    ON CONFLICT (school_id, class_id, academic_year, name) DO NOTHING;

    INSERT INTO public.exam_results (school_id, exam_id, student_id, subject, marks_obtained, max_marks, grade, remarks)
    VALUES
        (v_school_id, v_exam_1, v_student_rec1, 'Physics', 92.5, 100, 'A1', 'Outstanding analytical grasp'),
        (v_school_id, v_exam_1, v_student_rec2, 'Physics', 88.0, 100, 'A2', 'Very strong problem solving')
    ON CONFLICT (exam_id, student_id, subject) DO NOTHING;

    -- ------------------------------------------------------------------------
    -- 13. CIRCULARS & NOTIFICATIONS
    -- ------------------------------------------------------------------------
    INSERT INTO public.circulars (school_id, title, description, category, target_class_id, created_by, send_whatsapp)
    VALUES
        (v_school_id, 'Annual Sports Meet 2026 Announcement', 'All students and parents are hereby invited to register for athletics and track events before Friday.', 'Sports', NULL, v_admin_uid, true);

    INSERT INTO public.notifications (school_id, profile_id, title, body, type)
    VALUES
        (v_school_id, v_student1_uid, 'New Homework Assigned', 'Mr. Rajesh Verma assigned homework in Physics.', 'homework'),
        (v_school_id, v_parent1_uid, 'Fee Payment Receipt Generated', 'Fee receipt RAD/REC/2026/0001 for Rs 45,000 is ready for download.', 'fee');

    -- ------------------------------------------------------------------------
    -- 14. CALENDAR EVENTS
    -- ------------------------------------------------------------------------
    INSERT INTO public.calendar_events (school_id, title, event_type, start_date, end_date, description)
    VALUES
        (v_school_id, 'Gandhi Jayanti Holiday', 'holiday', '2026-10-02', '2026-10-02', 'National holiday on occasion of Mahatma Gandhi Jayanti.'),
        (v_school_id, 'Term 1 Final Assessments', 'exam', '2026-11-10', '2026-11-20', 'Term 1 end semester examinations for all classes.');

END $$;
