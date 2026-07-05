-- Projects Policies
CREATE POLICY "Members can view projects in their orgs" ON projects
FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.user_organization_ids()));

CREATE POLICY "Members can create projects in their orgs" ON projects
FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM public.user_organization_ids()));
