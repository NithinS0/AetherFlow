-- ====================================================================
-- AetherFlow Enterprise
-- Row Level Security (RLS) Policies
-- ====================================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Helper Function: Get user organizations
CREATE OR REPLACE FUNCTION public.user_organization_ids()
RETURNS TABLE (organization_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT om.organization_id
  FROM organization_members om
  WHERE om.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Organizations Policies
CREATE POLICY "Users can view their organizations" ON organizations
FOR SELECT USING (id IN (SELECT organization_id FROM public.user_organization_ids()));

-- 3. Organization Members Policies
CREATE POLICY "Members can view other members in their orgs" ON organization_members
FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.user_organization_ids()));

-- 4. Projects Policies
CREATE POLICY "Members can view projects in their orgs" ON projects
FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.user_organization_ids()));

CREATE POLICY "Members can create projects in their orgs" ON projects
FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM public.user_organization_ids()));

-- 5. Queues Policies
CREATE POLICY "Members can view queues in their orgs" ON queues
FOR SELECT USING (
  project_id IN (
    SELECT id FROM projects WHERE organization_id IN (SELECT organization_id FROM public.user_organization_ids())
  )
);

CREATE POLICY "Members can create queues in their orgs" ON queues
FOR INSERT WITH CHECK (
  project_id IN (
    SELECT id FROM projects WHERE organization_id IN (SELECT organization_id FROM public.user_organization_ids())
  )
);

-- 6. Workers Policies
CREATE POLICY "Members can view workers in their orgs" ON workers
FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.user_organization_ids()));

-- Note: Worker insertion/updates will likely be handled by the backend 
-- using the Service Role Key, bypassing RLS, but for read-access this is sufficient.

-- 7. Jobs Policies
CREATE POLICY "Members can view jobs in their orgs" ON jobs
FOR SELECT USING (
  queue_id IN (
    SELECT id FROM queues WHERE project_id IN (
      SELECT id FROM projects WHERE organization_id IN (SELECT organization_id FROM public.user_organization_ids())
    )
  )
);

-- Note: Job insertion/updates (especially SELECT FOR UPDATE SKIP LOCKED) 
-- will exclusively be executed by the backend with the Service Role Key.

-- 8. Audit Logs Policies
CREATE POLICY "Members can view audit logs for their records" ON audit_logs
FOR SELECT USING (user_id = auth.uid());
