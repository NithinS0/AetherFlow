-- Queues Policies
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
