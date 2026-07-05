-- ====================================================================
-- AetherFlow Enterprise
-- Migration: Views for Metrics and Worker Health
-- ====================================================================

-- 1. Queue Metrics View
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

ALTER VIEW view_queue_metrics SET (security_invoker = on);

-- 2. Worker Health View
CREATE OR REPLACE VIEW view_worker_health AS
SELECT 
    w.organization_id,
    COUNT(w.id) AS total_workers,
    COUNT(CASE WHEN w.status = 'healthy' THEN 1 END) AS healthy_workers,
    COUNT(CASE WHEN w.status = 'degraded' THEN 1 END) AS degraded_workers,
    COUNT(CASE WHEN w.status = 'failing' THEN 1 END) AS failing_workers,
    COUNT(CASE WHEN w.status = 'offline' THEN 1 END) AS offline_workers
FROM 
    workers w
GROUP BY 
    w.organization_id;

ALTER VIEW view_worker_health SET (security_invoker = on);
