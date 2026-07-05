-- ====================================================================
-- AetherFlow Enterprise
-- Migration: Settings table and security policies
-- ====================================================================

CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    settings_json JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_settings_user ON settings (user_id);
CREATE INDEX IF NOT EXISTS idx_settings_organization ON settings (organization_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_settings_user_unique ON settings (user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_settings_organization_unique ON settings (organization_id) WHERE organization_id IS NOT NULL;

-- Keep updated_at current on row updates
CREATE TRIGGER set_updated_at_settings
BEFORE UPDATE ON settings
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Enable RLS for settings and allow access to users inside the same organization
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their settings" ON settings
FOR SELECT USING (
  (user_id IS NOT NULL AND user_id = auth.uid()) OR
  (organization_id IS NOT NULL AND organization_id IN (SELECT organization_id FROM public.user_organization_ids()))
);

CREATE POLICY "Users can insert their settings" ON settings
FOR INSERT WITH CHECK (
  (user_id IS NOT NULL AND user_id = auth.uid()) OR
  (organization_id IS NOT NULL AND organization_id IN (SELECT organization_id FROM public.user_organization_ids()))
);

CREATE POLICY "Users can update their settings" ON settings
FOR UPDATE USING (
  (user_id IS NOT NULL AND user_id = auth.uid()) OR
  (organization_id IS NOT NULL AND organization_id IN (SELECT organization_id FROM public.user_organization_ids()))
)
WITH CHECK (
  (user_id IS NOT NULL AND user_id = auth.uid()) OR
  (organization_id IS NOT NULL AND organization_id IN (SELECT organization_id FROM public.user_organization_ids()))
);
