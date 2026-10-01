-- =============================================================================
-- CXPulse AI Customer Experience Intelligence Platform
-- Production PostgreSQL Database Schema (Supabase compatible)
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. USERS & AGENTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY DEFAULT ('usr_' || substr(md5(random()::text), 1, 12)),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'agent' CHECK (role IN ('admin', 'agent', 'manager', 'Head of Customer Experience')),
    avatar VARCHAR(10) DEFAULT 'AM',
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2. CUSTOMERS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    avatar VARCHAR(10),
    avatar_bg VARCHAR(20) DEFAULT '#2563EB',
    risk_score INTEGER DEFAULT 20 CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level VARCHAR(50) DEFAULT 'Low' CHECK (risk_level IN ('Low', 'Medium', 'High', 'Critical')),
    ltv VARCHAR(50) DEFAULT '$0 ARR',
    since VARCHAR(50) DEFAULT 'Just now',
    status VARCHAR(50) DEFAULT 'Healthy',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. TICKETS & PRIORITY QUEUE TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tickets (
    id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    avatar VARCHAR(10),
    avatar_bg VARCHAR(20) DEFAULT '#2563EB',
    issue TEXT NOT NULL,
    sentiment VARCHAR(50) DEFAULT 'Neutral',
    sentiment_score NUMERIC(4, 2) DEFAULT 0.0,
    priority VARCHAR(50) DEFAULT 'P3 - Medium',
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    waiting_time VARCHAR(50) DEFAULT 'Just now',
    risk_score INTEGER DEFAULT 20,
    risk_level VARCHAR(50) DEFAULT 'Low',
    ltv VARCHAR(50) DEFAULT '$0 ARR',
    since VARCHAR(50) DEFAULT 'Just now',
    ai_recommendation TEXT,
    intent VARCHAR(255),
    emotion VARCHAR(255),
    why_risk JSONB DEFAULT '[]'::jsonb,
    next_actions JSONB DEFAULT '[]'::jsonb,
    journey JSONB DEFAULT '[]'::jsonb,
    suggested_responses JSONB DEFAULT '{}'::jsonb,
    assigned_to TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 4. FEEDBACK & CSAT TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.feedback_items (
    id VARCHAR(50) PRIMARY KEY,
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
-- 5. AI INSIGHTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_insights (
    id VARCHAR(50) PRIMARY KEY,
    tag VARCHAR(100) NOT NULL,
    title TEXT NOT NULL,
    impact VARCHAR(50) DEFAULT 'High',
    impact_badge VARCHAR(50) DEFAULT 'badge-critical',
    confidence VARCHAR(20) DEFAULT '90%',
    affected_count VARCHAR(100),
    recommendation TEXT NOT NULL,
    affected_filter VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 6. INTEGRATIONS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.integrations (
    id VARCHAR(50) PRIMARY KEY,
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
CREATE INDEX IF NOT EXISTS idx_tickets_risk_score ON public.tickets (risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets (status);
CREATE INDEX IF NOT EXISTS idx_customers_risk ON public.customers (risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_channel ON public.feedback_items (channel);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback_items (created_at DESC);

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- Allow read/write for authenticated service role and anon for hackathon demo
CREATE POLICY "Allow public read access" ON public.tickets FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.tickets FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.customers FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON public.feedback_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.feedback_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON public.ai_insights FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.integrations FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.users FOR SELECT USING (true);
