-- ==================================================
-- SUPABASE MIGRATION: AI Layer Schema
-- AetherFlow Enterprise
-- ==================================================

-- 1. CONVERSATION MEMORY
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL, -- Isolated by tenant
    user_id UUID NOT NULL, -- References auth.users
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own org conversations" ON ai_conversations FOR ALL USING (organization_id IN (SELECT organization_id FROM public.user_organization_ids()));

CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
    content TEXT NOT NULL,
    agent_name TEXT, -- E.g., 'opsgpt', 'failure_analyst'
    metadata JSONB, -- For storing confidence, reasoning, tool_calls
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
-- Inherit access from conversation

-- 2. RECOMMENDATIONS & GOVERNANCE
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    agent_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    confidence NUMERIC CHECK (confidence >= 0 AND confidence <= 100),
    impact TEXT,
    reasoning TEXT,
    suggested_actions JSONB,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'executed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own org recommendations" ON ai_recommendations FOR ALL USING (organization_id IN (SELECT organization_id FROM public.user_organization_ids()));

CREATE TABLE IF NOT EXISTS approval_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recommendation_id UUID NOT NULL REFERENCES ai_recommendations(id) ON DELETE CASCADE,
    requested_by UUID, -- AI Agent ID or System
    reviewed_by UUID, -- References auth.users
    decision TEXT CHECK (decision IN ('approve', 'reject')),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;

-- 3. REPORTS
CREATE TABLE IF NOT EXISTS ai_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    report_type TEXT CHECK (report_type IN ('daily', 'weekly', 'incident', 'executive')),
    title TEXT NOT NULL,
    content_markdown TEXT NOT NULL,
    generated_by TEXT NOT NULL, -- Agent Name
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own org reports" ON ai_reports FOR ALL USING (organization_id IN (SELECT organization_id FROM public.user_organization_ids()));
