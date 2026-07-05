-- Demo Tenant Seed Script
-- Safe to run multiple times (uses ON CONFLICT DO NOTHING for inserts if we had unique constraints, but we'll use specific UUIDs to ensure idempotency)

DO $$ 
DECLARE
    org_id UUID := '00000000-0000-0000-0000-000000000001';
    user_id UUID := '00000000-0000-0000-0000-000000000002';
    project_id UUID := '00000000-0000-0000-0000-000000000003';
BEGIN
    -- 1. Create a demo organization
    INSERT INTO organizations (id, name, slug, plan)
    VALUES (org_id, 'AetherFlow Demo Corp', 'demo-corp', 'enterprise')
    ON CONFLICT (id) DO NOTHING;

    -- 2. Mock a Supabase user for testing
    -- Note: In a real environment, this user MUST exist in auth.users first due to foreign key constraints!
    -- This assumes you have already created a user in Supabase Auth and mapped their ID, OR
    -- you can bypass the FK for local testing if necessary.
    -- Assuming a mock user is inserted into auth.users elsewhere, we insert into public.users:
    -- INSERT INTO users (id, email, full_name) VALUES (user_id, 'admin@demo-corp.com', 'Demo Admin') ON CONFLICT DO NOTHING;
    
    -- 3. Create a project
    INSERT INTO projects (id, organization_id, name, description)
    VALUES (project_id, org_id, 'Production Environment', 'Main production jobs')
    ON CONFLICT (id) DO NOTHING;

    -- 4. Create some standard queues
    INSERT INTO queues (project_id, name, priority, concurrency_limit)
    VALUES 
        (project_id, 'high-priority', 'high', 50),
        (project_id, 'default', 'medium', 10),
        (project_id, 'background-tasks', 'low', 5)
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Demo tenant successfully seeded!';
END $$;
