-- =====================================================================
-- EVENTEASE - SMART COLLEGE EVENT MANAGEMENT PLATFORM
-- PostgreSQL Migration & Schema (Supabase Compatible)
-- =====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Extends auth.users or standalone for demo)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'organizer', 'admin')),
    branch_id UUID,
    usn TEXT,
    phone TEXT,
    college TEXT DEFAULT 'College of Engineering & Technology',
    year TEXT,
    interests TEXT[] DEFAULT '{}',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BRANCHES
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL, -- e.g. IT, CS, AML, DS, MECH
    description TEXT,
    icon_name TEXT DEFAULT 'Layers',
    accent_color TEXT DEFAULT '#059669',
    coordinator_name TEXT,
    coordinator_email TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORGANIZER ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.organizer_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, branch_id)
);

-- 4. EVENTS
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    branch_id UUID REFERENCES public.branches(id) ON DELETE RESTRICT,
    category TEXT NOT NULL CHECK (category IN ('hackathon', 'workshop', 'competition', 'cultural', 'technical')),
    tagline TEXT,
    description TEXT NOT NULL,
    rules JSONB DEFAULT '[]'::jsonb,
    schedule JSONB DEFAULT '[]'::jsonb,
    prizes JSONB DEFAULT '{}'::jsonb,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    venue TEXT NOT NULL,
    mode TEXT NOT NULL CHECK (mode IN ('offline', 'online', 'hybrid')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'published', 'registration_closed', 'completed', 'cancelled')),
    capacity INTEGER NOT NULL DEFAULT 100,
    registered_count INTEGER NOT NULL DEFAULT 0,
    registration_deadline TIMESTAMPTZ NOT NULL,
    organizer_id UUID REFERENCES public.profiles(id),
    organizer_name TEXT,
    organizer_contact TEXT,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_dates CHECK (end_date >= start_date),
    CONSTRAINT valid_deadline CHECK (registration_deadline <= end_date)
);

-- 5. EVENT THEMES (Dynamic Theme Engine)
CREATE TABLE IF NOT EXISTS public.event_themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID UNIQUE REFERENCES public.events(id) ON DELETE CASCADE,
    theme_name TEXT NOT NULL,
    primary_color TEXT NOT NULL,
    secondary_color TEXT NOT NULL,
    background_color TEXT NOT NULL,
    surface_color TEXT NOT NULL,
    text_color TEXT NOT NULL,
    accent_color TEXT NOT NULL,
    font_family TEXT DEFAULT 'sans',
    banner_url TEXT,
    poster_url TEXT,
    badge_text TEXT,
    certificate_style TEXT DEFAULT 'classic',
    certificate_border_color TEXT DEFAULT '#059669',
    certificate_bg_color TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. EVENT REGISTRATION SETTINGS
CREATE TABLE IF NOT EXISTS public.event_registration_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID UNIQUE REFERENCES public.events(id) ON DELETE CASCADE,
    min_team_size INTEGER NOT NULL DEFAULT 1,
    max_team_size INTEGER NOT NULL DEFAULT 4,
    allow_individual BOOLEAN DEFAULT TRUE,
    require_team BOOLEAN DEFAULT FALSE,
    require_all_member_accounts BOOLEAN DEFAULT FALSE,
    require_unique_team_name BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_team_range CHECK (max_team_size >= min_team_size AND min_team_size >= 1)
);

-- 7. EVENT PAYMENT SETTINGS
CREATE TABLE IF NOT EXISTS public.event_payment_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID UNIQUE REFERENCES public.events(id) ON DELETE CASCADE,
    is_paid BOOLEAN DEFAULT FALSE,
    fee_type TEXT DEFAULT 'per_team' CHECK (fee_type IN ('per_person', 'per_team')),
    fee_amount NUMERIC(10,2) DEFAULT 0.00,
    upi_id TEXT,
    payee_name TEXT,
    qr_image_url TEXT,
    payment_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. EVENT CERTIFICATE SETTINGS
CREATE TABLE IF NOT EXISTS public.event_certificate_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID UNIQUE REFERENCES public.events(id) ON DELETE CASCADE,
    enable_participation BOOLEAN DEFAULT TRUE,
    attendance_requirement_pct INTEGER DEFAULT 100,
    college_name TEXT DEFAULT 'EventEase College of Engineering',
    signatories JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. REGISTRATIONS & TEAMS
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.events(id) ON DELETE RESTRICT,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_team BOOLEAN DEFAULT FALSE,
    team_name TEXT,
    team_size INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('pending_payment', 'submitted', 'confirmed', 'rejected', 'cancelled')),
    payment_status TEXT NOT NULL DEFAULT 'not_required' CHECK (payment_status IN ('not_required', 'awaiting_submission', 'submitted', 'verified', 'rejected', 'refund_pending')),
    total_amount NUMERIC(10,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ
);

-- 10. TEAM MEMBERS
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID REFERENCES public.registrations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    usn TEXT,
    branch TEXT,
    year TEXT,
    phone TEXT,
    is_leader BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. PAYMENT SUBMISSIONS
CREATE TABLE IF NOT EXISTS public.payment_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID UNIQUE REFERENCES public.registrations(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE RESTRICT,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    transaction_ref TEXT NOT NULL, -- UPI UTR Number
    proof_image_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'verified', 'rejected')),
    rejection_reason TEXT,
    reviewer_id UUID REFERENCES public.profiles(id),
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

-- 12. TICKETS
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_code TEXT UNIQUE NOT NULL, -- Opaque ticket verification token
    registration_id UUID REFERENCES public.registrations(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE RESTRICT,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    participant_name TEXT NOT NULL,
    participant_email TEXT NOT NULL,
    team_name TEXT,
    is_checked_in BOOLEAN DEFAULT FALSE,
    checked_in_at TIMESTAMPTZ,
    checked_in_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. ATTENDANCE RECORDS
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
    registration_id UUID REFERENCES public.registrations(id) ON DELETE CASCADE,
    participant_name TEXT NOT NULL,
    participant_email TEXT NOT NULL,
    team_name TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    verified_by UUID REFERENCES public.profiles(id)
);

-- 14. EVENT RESULTS
CREATE TABLE IF NOT EXISTS public.event_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    registration_id UUID REFERENCES public.registrations(id) ON DELETE CASCADE,
    team_name TEXT NOT NULL,
    placement INTEGER NOT NULL CHECK (placement IN (1, 2, 3)),
    members JSONB NOT NULL DEFAULT '[]'::jsonb,
    score NUMERIC(5,2),
    notes TEXT,
    confirmed_by UUID REFERENCES public.profiles(id),
    published_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, placement) -- Prevents duplicate place assignments without tie logic
);

-- 15. CERTIFICATES
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    certificate_number TEXT UNIQUE NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE RESTRICT,
    event_title TEXT NOT NULL,
    branch_name TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    recipient_id UUID REFERENCES public.profiles(id),
    team_name TEXT,
    type TEXT NOT NULL CHECK (type IN ('participation', 'winner')),
    award_category TEXT NOT NULL,
    placement INTEGER CHECK (placement IN (1, 2, 3)),
    event_date TEXT NOT NULL,
    issue_date TIMESTAMPTZ DEFAULT NOW(),
    qr_verification_code TEXT UNIQUE NOT NULL,
    signatories JSONB DEFAULT '[]'::jsonb,
    is_revoked BOOLEAN DEFAULT FALSE,
    revocation_reason TEXT,
    theme_snapshot JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'alert')),
    link TEXT,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_branch ON public.events(branch_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_registrations_event ON public.registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON public.registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_code ON public.tickets(ticket_code);
CREATE INDEX IF NOT EXISTS idx_certificates_number ON public.certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, read);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: users read all public info, update own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Events: Published events visible to all; organizers/admins can manage
CREATE POLICY "Published events are viewable by all" ON public.events FOR SELECT USING (status = 'published' OR status = 'completed');
CREATE POLICY "Organizers view their branch events" ON public.events FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('organizer', 'admin'))
);

-- Event themes: Viewable by anyone
CREATE POLICY "Themes viewable by all" ON public.event_themes FOR SELECT USING (true);

-- Certificates: Viewable by all for public verification; revoked status preserved
CREATE POLICY "Certificates public select" ON public.certificates FOR SELECT USING (true);

-- Registrations: Students see their own; Organizers see event registrations
CREATE POLICY "Students see own registrations" ON public.registrations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Students insert own registrations" ON public.registrations FOR INSERT WITH CHECK (user_id = auth.uid());
