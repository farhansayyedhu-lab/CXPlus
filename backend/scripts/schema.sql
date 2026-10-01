-- =============================================================================
-- CXPulse AI Customer Experience Intelligence Platform
-- Production PostgreSQL Database Schema (Supabase compatible)
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. USERS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'support_agent' CHECK (role IN ('admin', 'support_agent', 'agent', 'manager', 'Head of Customer Experience')),
    avatar VARCHAR(10) DEFAULT 'AM',
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2. CUSTOMERS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    avatar VARCHAR(10),
    avatar_bg VARCHAR(20) DEFAULT '#2563EB',
    total_orders INTEGER DEFAULT 1,
    total_spent NUMERIC(12, 2) DEFAULT 0.00,
    satisfaction_score NUMERIC(3, 1) DEFAULT 4.5,
    customer_risk VARCHAR(50) DEFAULT 'Low' CHECK (customer_risk IN ('Low', 'Medium', 'High', 'Critical')),
    risk_score INTEGER DEFAULT 20 CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_factors JSONB DEFAULT '[]'::jsonb,
    ltv VARCHAR(50) DEFAULT '$0 ARR',
    since VARCHAR(50) DEFAULT 'Jan 2024',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. TICKETS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    company VARCHAR(255),
    avatar VARCHAR(10),
    avatar_bg VARCHAR(20) DEFAULT '#2563EB',
    subject VARCHAR(255),
    message TEXT,
    issue TEXT,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority VARCHAR(50) DEFAULT 'P3 - Medium',
    intent VARCHAR(255),
    sentiment VARCHAR(50) DEFAULT 'Neutral' CHECK (sentiment IN ('Positive', 'Neutral', 'Negative', 'Critical')),
    sentiment_score NUMERIC(4, 2) DEFAULT 0.0,
    emotion VARCHAR(255),
    customer_risk VARCHAR(50) DEFAULT 'Low',
    risk_score INTEGER DEFAULT 20,
    ai_summary TEXT,
    ai_response TEXT,
    recommended_action TEXT,
    requires_escalation BOOLEAN DEFAULT FALSE,
    assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
    why_risk JSONB DEFAULT '[]'::jsonb,
    next_actions JSONB DEFAULT '[]'::jsonb,
    journey JSONB DEFAULT '[]'::jsonb,
    suggested_responses JSONB DEFAULT '{}'::jsonb,
    waiting_time VARCHAR(50) DEFAULT 'Just now',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 4. TICKET MESSAGES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
    sender_type VARCHAR(50) NOT NULL CHECK (sender_type IN ('customer', 'agent', 'ai')),
    sender_name VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 5. AI ANALYSES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
    intent VARCHAR(255),
    sentiment VARCHAR(50),
    emotion VARCHAR(255),
    priority VARCHAR(50),
    customer_risk VARCHAR(50),
    summary TEXT,
    suggested_response TEXT,
    recommended_action TEXT,
    requires_escalation BOOLEAN DEFAULT FALSE,
    model VARCHAR(100) DEFAULT 'gemini-1.5-flash',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 6. AI INSIGHTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    summary TEXT,
    top_issues JSONB DEFAULT '[]'::jsonb,
    risk_areas JSONB DEFAULT '[]'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    trends JSONB DEFAULT '[]'::jsonb,
    tag VARCHAR(100),
    title TEXT,
    impact VARCHAR(50) DEFAULT 'High',
    impact_badge VARCHAR(50) DEFAULT 'badge-critical',
    confidence VARCHAR(20) DEFAULT '94%',
    affected_count VARCHAR(100),
    affected_filter VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 7. FEEDBACK & CSAT TABLE (Optional telemetry)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.feedback_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    channel VARCHAR(100) DEFAULT 'In-App Survey',
    rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    nps_score INTEGER DEFAULT 8 CHECK (nps_score >= 0 AND nps_score <= 10),
    sentiment VARCHAR(50) DEFAULT 'Positive',
    sentiment_score NUMERIC(4, 2) DEFAULT 0.5,
    comment TEXT NOT NULL,
    topic VARCHAR(100) DEFAULT 'General',
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 8. INTEGRATIONS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'Connected',
    sync_state VARCHAR(50) DEFAULT 'Healthy',
    last_sync VARCHAR(50) DEFAULT 'Just now',
    icon VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- INDEXES FOR FAST QUERYING
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_tickets_customer_id ON public.tickets (customer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets (status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON public.tickets (priority);
CREATE INDEX IF NOT EXISTS idx_tickets_risk_score ON public.tickets (risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON public.tickets (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON public.ticket_messages (ticket_id);
CREATE INDEX IF NOT EXISTS idx_customers_risk_score ON public.customers (risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers (email);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_ticket_id ON public.ai_analyses (ticket_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback_items (created_at DESC);

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access for hackathon / service role
CREATE POLICY "Allow public read access" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.users FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.customers FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON public.tickets FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.tickets FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON public.ticket_messages FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.ticket_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON public.ai_analyses FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.ai_analyses FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON public.ai_insights FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.ai_insights FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON public.feedback_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.feedback_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON public.integrations FOR SELECT USING (true);
