-- Organizations Policies
CREATE POLICY "Users can view their organizations" ON organizations
FOR SELECT USING (id IN (SELECT organization_id FROM public.user_organization_ids()));

-- Organization Members Policies
CREATE POLICY "Members can view other members in their orgs" ON organization_members
FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.user_organization_ids()));
