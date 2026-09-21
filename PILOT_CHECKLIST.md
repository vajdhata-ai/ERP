# 🚀 Pilot Launch Demo Checklist
*For use during the live demo with Radiant International School's admin.*

## Prerequisites (Pre-Meeting)
- [ ] Vercel production URL is live.
- [ ] Supabase production database is migrated and populated with base reference data.
- [ ] You have the Super Admin credentials ready.

## Live Demo Flow (Do this IN FRONT of the prospect)

### 1. Onboarding the School (The "Wow" factor)
- [ ] Go to `[VERCEL_URL]/super-admin/schools/new`
- [ ] Type "Radiant International School", upload their real logo (if you have it), and create the school.
- [ ] Show how the system instantly generates their secure Admin login credentials.

### 2. The Admin Experience
- [ ] Log out of Super Admin. Log in using the newly created Admin credentials.
- [ ] Land on the **Risk Dashboard** (`/admin/risk-dashboard`). Show how empty it is.
- [ ] Mention: "It's a blank slate, fully isolated to your school."

### 3. Quick Data Entry (Teacher Persona)
- [ ] Log in as a Teacher (open an Incognito window).
- [ ] Show the **Today's Schedule** screen (`/teacher`).
- [ ] Click the **1-Tap Attendance** button for the first period.
- [ ] Post a Quick Homework using the **Template button** (2 taps total).

### 4. Communication (The WhatsApp Magic)
- [ ] Go to **Circulars** (`/admin/circulars`).
- [ ] Type a quick message: "Welcome to the new ERP pilot."
- [ ] Hit Send. If they provided a real phone number for a test student, show them their phone buzzing with a WhatsApp message instantly.

### 5. Revenue & Fees (The Accountant Persona)
- [ ] Go to **Fees** (`/accountant/fees`).
- [ ] Search for a student and hit **Collect Fee**.
- [ ] Show the Razorpay checkout overlay appearing instantly on top of the app.

### 6. Logistics (Library & Transport)
- [ ] Go to **Library** (`/librarian`).
- [ ] Show the barcode scanner UI and explain how it auto-calculates fines.
- [ ] Go to **Transport Live Tracking** (`/student/transport`). Show the pulsing live location map (Mapbox).

## Conclusion
"We just onboarded your school, took attendance, sent a WhatsApp circular, and opened a fee payment gateway in under 5 minutes."
