-- Migration for Stages 10, 11, 12, 13, 14, 15, 16

-- ==========================================
-- STAGE 10: Transport & Live GPS
-- ==========================================
CREATE TABLE IF NOT EXISTS transport_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    vehicle_number VARCHAR(50) NOT NULL,
    driver_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    conductor_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    incharge_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transport_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    route_id UUID REFERENCES transport_routes(id) ON DELETE CASCADE,
    stop_name VARCHAR(255) NOT NULL,
    scheduled_time TIME NOT NULL,
    stop_order INTEGER NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transport_student_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    pickup_stop_id UUID REFERENCES transport_stops(id) ON DELETE SET NULL,
    drop_stop_id UUID REFERENCES transport_stops(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transport_live_location (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    route_id UUID REFERENCES transport_routes(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- STAGE 11: Results / Report Cards
-- ==========================================
CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    exam_date DATE NOT NULL,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_marks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    marks_obtained DECIMAL(5, 2),
    max_marks DECIMAL(5, 2) NOT NULL,
    grade VARCHAR(5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(exam_id, student_id, subject_id)
);

CREATE TABLE IF NOT EXISTS report_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    pdf_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(exam_id, student_id)
);

-- ==========================================
-- STAGE 12: School Calendar
-- ==========================================
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('Holiday', 'Event', 'Exam')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- STAGE 13: Image Gallery
-- ==========================================
CREATE TABLE IF NOT EXISTS gallery_albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    month VARCHAR(20) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    cover_photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gallery_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    album_id UUID REFERENCES gallery_albums(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- STAGE 14: Infirmary / Health Records
-- ==========================================
CREATE TABLE IF NOT EXISTS infirmary_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    visit_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    departure_date TIMESTAMPTZ,
    reason TEXT NOT NULL,
    medicine_given TEXT,
    prescription_url TEXT,
    checked_by_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: Stages 15 (Risk Dashboard) and 16 (Speed Tools) largely use views or queries
-- over existing data (dues, attendance, homework, remarks) so no new tables needed.

-- ==========================================
-- RLS Policies
-- ==========================================
-- Enable RLS for all new tables
ALTER TABLE transport_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_student_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_live_location ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE infirmary_visits ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read data for their school
CREATE POLICY "Allow read for school users" ON transport_routes FOR SELECT TO authenticated USING (school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Allow read for school users" ON transport_stops FOR SELECT TO authenticated USING (school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Allow read for school users" ON transport_student_stops FOR SELECT TO authenticated USING (school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Allow read for school users" ON transport_live_location FOR SELECT TO authenticated USING (school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Allow read for school users" ON exams FOR SELECT TO authenticated USING (school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Allow read for school users" ON exam_marks FOR SELECT TO authenticated USING (school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Allow read for school users" ON report_cards FOR SELECT TO authenticated USING (school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Allow read for school users" ON calendar_events FOR SELECT TO authenticated USING (school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Allow read for school users" ON gallery_albums FOR SELECT TO authenticated USING (school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Allow read for school users" ON gallery_photos FOR SELECT TO authenticated USING (school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Allow read for school users" ON infirmary_visits FOR SELECT TO authenticated USING (school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()));

-- Allow write for specific roles (Simplified for this project: let authenticated insert/update with school_id check)
CREATE POLICY "Allow all write for school users" ON transport_live_location FOR ALL TO authenticated USING (school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid())) WITH CHECK (school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Allow all write for school users" ON exam_marks FOR ALL TO authenticated USING (school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid())) WITH CHECK (school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Allow all write for school users" ON exams FOR ALL TO authenticated USING (school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid())) WITH CHECK (school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Allow all write for school users" ON calendar_events FOR ALL TO authenticated USING (school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid())) WITH CHECK (school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Allow all write for school users" ON gallery_albums FOR ALL TO authenticated USING (school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid())) WITH CHECK (school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Allow all write for school users" ON gallery_photos FOR ALL TO authenticated USING (school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid())) WITH CHECK (school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Allow all write for school users" ON infirmary_visits FOR ALL TO authenticated USING (school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid())) WITH CHECK (school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()));

-- Enable Realtime for live tracking
ALTER PUBLICATION supabase_realtime ADD TABLE transport_live_location;
