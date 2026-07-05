CREATE OR REPLACE VIEW view_queue_metrics AS
SELECT 
    q.id AS queue_id,
    q.name AS queue_name,
    q.project_id,
    p.organization_id,
    COUNT(j.id) AS total_jobs,
    COUNT(CASE WHEN j.status = 'queued' THEN 1 END) AS queued_jobs,
    COUNT(CASE WHEN j.status = 'processing' THEN 1 END) AS processing_jobs,
    COUNT(CASE WHEN j.status = 'completed' THEN 1 END) AS completed_jobs,
    COUNT(CASE WHEN j.status = 'failed' THEN 1 END) AS failed_jobs
FROM 
    queues q
JOIN 
    projects p ON q.project_id = p.id
LEFT JOIN 
    jobs j ON q.id = j.queue_id
GROUP BY 
    q.id, q.name, q.project_id, p.organization_id;

-- Enable RLS logic for the view by enforcing it uses the caller's privileges
-- Note: Views don't have RLS directly, they inherit it if created with security invoker
ALTER VIEW view_queue_metrics SET (security_invoker = on);
