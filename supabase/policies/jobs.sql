-- Jobs Policies
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
