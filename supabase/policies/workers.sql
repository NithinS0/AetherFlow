-- Workers Policies
CREATE POLICY "Members can view workers in their orgs" ON workers
FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.user_organization_ids()));

-- Note: Worker insertion/updates will likely be handled by the backend 
-- using the Service Role Key, bypassing RLS, but for read-access this is sufficient.
