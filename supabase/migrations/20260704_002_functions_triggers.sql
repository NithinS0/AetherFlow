-- ====================================================================
-- AetherFlow Enterprise
-- Triggers and Functions
-- ====================================================================

-- 1. Automatically update `updated_at` column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all relevant tables
CREATE TRIGGER set_updated_at_orgs BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER set_updated_at_users BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER set_updated_at_members BEFORE UPDATE ON organization_members FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER set_updated_at_projects BEFORE UPDATE ON projects FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER set_updated_at_queues BEFORE UPDATE ON queues FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER set_updated_at_workers BEFORE UPDATE ON workers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER set_updated_at_jobs BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 2. Audit Logging Table and Function
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    user_id UUID, -- Optional, can be null if action is system-driven
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Try to get the user ID from Supabase Auth context
    BEGIN
        current_user_id := auth.uid();
    EXCEPTION WHEN OTHERS THEN
        current_user_id := NULL;
    END;

    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_data, user_id)
        VALUES (TG_TABLE_NAME::TEXT, OLD.id, TG_OP, row_to_json(OLD)::JSONB, current_user_id);
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, user_id)
        VALUES (TG_TABLE_NAME::TEXT, NEW.id, TG_OP, row_to_json(OLD)::JSONB, row_to_json(NEW)::JSONB, current_user_id);
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_data, user_id)
        VALUES (TG_TABLE_NAME::TEXT, NEW.id, TG_OP, row_to_json(NEW)::JSONB, current_user_id);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply Audit to critical tables (Example: queues and workers)
CREATE TRIGGER audit_queues_trigger
AFTER INSERT OR UPDATE OR DELETE ON queues
FOR EACH ROW EXECUTE PROCEDURE log_audit_event();

CREATE TRIGGER audit_workers_trigger
AFTER INSERT OR UPDATE OR DELETE ON workers
FOR EACH ROW EXECUTE PROCEDURE log_audit_event();
