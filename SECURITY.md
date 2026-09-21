# Vajdhata School ERP - Security & Deployment Architecture

## 1. Secrets Management
All secrets are strictly loaded from environment variables in production. They must never be committed to version control.
- `NEXT_PUBLIC_SUPABASE_URL`: Public Supabase Project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public anonymous key for Supabase (Safe for client).
- `SUPABASE_SERVICE_ROLE_KEY`: Admin bypass key (Strictly server-side only).
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: Razorpay credentials (Server-side only).
- `WHATSAPP_CLOUD_API_TOKEN`: Meta WhatsApp token (Server-side only).
- `NEXT_PUBLIC_MAPBOX_TOKEN`: Mapbox GL JS token (Restricted to production domain).

## 2. Row Level Security (RLS) & Cross-Tenant Isolation
This is a multi-tenant SaaS application. Isolation is the highest priority.
- Every table has a `school_id` foreign key referencing the `schools` table.
- RLS is ENABLED on every single table.
- Read Policy: `USING (school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()))`
- Write Policy: `WITH CHECK (school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()))`
- This ensures that a user logged in as School A can NEVER fetch, update, or delete data belonging to School B, even if they guess a UUID or intercept API requests.

## 3. Form Validation & Data Sanitization
- Client-side and server-side validation is enforced on all critical mutations.
- Negative amounts are rejected for fees and library fines.
- Uploaded files (PDFs, Images) are validated for MIME type and file size before reaching Supabase Storage to prevent malicious script uploads.

## 4. API Rate Limiting
- Login and password reset routes are rate-limited to prevent brute-force attacks (Max 5 attempts per minute).

## 5. Security Incident Response
If a key is leaked (e.g. Supabase Service Role Key):
1. Immediately revoke the key in the Supabase Dashboard (Settings > API).
2. Generate a new key.
3. Update the `SUPABASE_SERVICE_ROLE_KEY` environment variable in Vercel.
4. Redeploy the application to flush edge caches.
5. Review Supabase audit logs for any unauthorized access during the leak window.
