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
