import { useEffect } from "react";
import { useStore } from "../stores/store";
import { StatCard } from "../components/StatCard";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { Card } from "../components/Card";
import { 
  Terminal, 
  Activity, 
  Clock, 
  Folder, 
  Layers, 
  Heart, 
  ShieldAlert, 
  RefreshCw,
  Server,
  Users
} from "lucide-react";

export function Dashboard() {
  const activeOrg = useStore((state) => state.activeOrg);
  const projects = useStore((state) => state.projects);
  const organizations = useStore((state) => state.organizations);
  const teams = useStore((state) => state.teams);
  const members = useStore((state) => state.members);
  const queues = useStore((state) => state.queues);
  const jobs = useStore((state) => state.jobs);
  const workers = useStore((state) => state.workers);
  const executions = useStore((state) => state.executions);
  const auditLogs = useStore((state) => state.auditLogs);
  const systemHealth = useStore((state) => state.systemHealth);
  const fetchOrgs = useStore((state) => state.fetchOrgs);
  const fetchAuditLogs = useStore((state) => state.fetchAuditLogs);
  const fetchWorkers = useStore((state) => state.fetchWorkers);
  const fetchExecutions = useStore((state) => state.fetchExecutions);
  const fetchQueues = useStore((state) => state.fetchQueues);
  const fetchJobs = useStore((state) => state.fetchJobs);
  const fetchScheduledJobs = useStore((state) => state.fetchScheduledJobs);
  const fetchReliability = useStore((state) => state.fetchReliability);

  const activeProj = Array.isArray(projects) ? projects[0] : undefined;
  const projectList = Array.isArray(projects) ? projects : [];
  const orgList = Array.isArray(organizations) ? organizations : [];
  const teamList = Array.isArray(teams) ? teams : [];
  const memberList = Array.isArray(members) ? members : [];
  const queueList = Array.isArray(queues) ? queues : [];
  const jobList = Array.isArray(jobs) ? jobs : [];
  const workerList = Array.isArray(workers) ? workers : [];
  const executionList = Array.isArray(executions) ? executions : [];
  const auditLogList = Array.isArray(auditLogs) ? auditLogs : [];

  useEffect(() => {
    fetchOrgs();
    fetchAuditLogs();
    fetchWorkers();
    fetchExecutions();

    if (activeProj) {
      fetchQueues(activeProj.id);
      fetchJobs(activeProj.id);
      fetchScheduledJobs(activeProj.id);
      fetchReliability(activeProj.id);
    }
  }, [
    activeProj?.id,
    fetchOrgs,
    fetchAuditLogs,
    fetchWorkers,
    fetchExecutions,
    fetchQueues,
    fetchJobs,
    fetchScheduledJobs,
    fetchReliability,
  ]);

  const triggerRefresh = () => {
    fetchOrgs();
    fetchAuditLogs();
    fetchWorkers();
    fetchExecutions();
    if (activeProj) {
      fetchQueues(activeProj.id);
      fetchJobs(activeProj.id);
      fetchScheduledJobs(activeProj.id);
      fetchReliability(activeProj.id);
    }
  };

  // Calculations
  const runningJobs = jobList.filter(j => j.status === "running").length;
  const scheduledJobs = jobList.filter(j => ["delayed", "scheduled", "cron", "batch"].includes(j.type)).length;
  const completedJobs = jobList.filter(j => j.status === "completed").length;
  const failedJobs = jobList.filter(j => j.status === "failed" || j.status === "dead_letter").length;
  const activeWorkers = workerList.filter(w => w.status !== "offline").length;
  const dlqCount = jobList.filter(j => j.status === "dead_letter").length;
  const totalRetries = jobList.reduce((sum, j) => sum + (j.retry_count || 0), 0);
  const queueCount = queueList.length;
  const projectCount = projectList.length;
  const queueHealth = queueList.length
    ? Math.round(queueList.reduce((sum, q) => sum + (q.health_score || 0), 0) / queueList.length)
    : 100;
  const workerHealth = workerList.length ? Math.round((activeWorkers / workerList.length) * 100) : 100;
  const throughput = executionList.length > 0 ? `${executionList.length} execution events` : "No executions yet";
  const executionMetrics = `${completedJobs}/${Math.max(jobList.length, 1)} completed`;
  const healthScore = systemHealth?.health_score || 98.4;
  const recentFailures = jobList.filter(j => j.status === "dead_letter" || j.status === "failed").slice(0, 5);

  const execColumns = [
    {
      key: "id",
      header: "Exec ID",
      render: (row: any) => (
        <span className="font-mono text-zinc-500 font-semibold">{row.id?.slice(0, 8) ?? "—"}...</span>
      )
    },
    {
      key: "status",
      header: "Status",
      render: (row: any) => {
        const color = row.status === "completed" ? "success" :
                      row.status === "failed" ? "danger" : "info";
        return <Badge variant={color}>{row.status}</Badge>;
      }
    },
    {
      key: "duration",
      header: "Duration",
      render: (row: any) => (
        <span className="font-mono text-zinc-300 font-bold">{row.duration ? `${row.duration.toFixed(2)}s` : "In Progress"}</span>
      )
    }
  ];

  const failureColumns = [
    {
      key: "id",
      header: "Job ID",
      render: (row: any) => (
        <span className="font-mono text-red-400 font-semibold">{row.id?.slice(0, 8) ?? "—"}...</span>
      )
    },
    {
      key: "queue_id",
      header: "Queue Link",
      render: (row: any) => (
        <span className="font-mono text-zinc-500">{row.queue_id?.slice(0, 8) ?? "—"}...</span>
      )
    },
    {
      key: "error_message",
      header: "Failure Reason",
      render: (row: any) => (
        <span className="text-zinc-400 font-mono text-[10px] leading-normal">{row.error_message || "Max retries exceeded"}</span>
      )
    }
  ];

  return (
    <div className="space-y-8">
      {/* Page Title & Refresh */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white font-sans bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Distributed Job Scheduling Platform
          </h2>
          <p className="text-zinc-500 text-xs mt-1 font-sans">
            Follow projects, queues, jobs, workers, retries, dead-letter isolation, and execution health from a single scheduler-first control room.
          </p>
        </div>
        <button
          onClick={triggerRefresh}
          className="p-2.5 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] text-zinc-400 hover:text-white transition-all cursor-pointer shadow-royal-glow"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Projects" 
          value={projectCount} 
          description="Active scheduler projects" 
          icon={Folder} 
          colorClass="text-cyan-400" 
        />
        <StatCard 
          title="Queues" 
          value={queueCount} 
          description="Configured queue partitions" 
          icon={Layers} 
          colorClass="text-indigo-400" 
        />
        <StatCard 
          title="Running Jobs" 
          value={runningJobs} 
          description="Currently executing" 
          icon={Terminal} 
          colorClass="text-primary" 
          trend={{ value: "+8%", isPositive: true }}
        />
        <StatCard 
          title="Scheduled Jobs" 
          value={scheduledJobs} 
          description="Delayed, cron, and batch" 
          icon={Clock} 
          colorClass="text-violet-400" 
        />
        <StatCard 
          title="Completed Jobs" 
          value={completedJobs} 
          description="Successful executions" 
          icon={Activity} 
          colorClass="text-emerald-450" 
        />
        <StatCard 
          title="Failed Jobs" 
          value={failedJobs} 
          description="Failures or DLQ captures" 
          icon={ShieldAlert} 
          colorClass="text-rose-450" 
        />
        <StatCard 
          title="Retry Count" 
          value={totalRetries} 
          description="Auto-retry attempts" 
          icon={RefreshCw} 
          colorClass="text-amber-400" 
        />
        <StatCard 
          title="Dead Letter Queue" 
          value={dlqCount} 
          description="Awaiting replay isolation" 
          icon={ShieldAlert} 
          colorClass="text-rose-500" 
          trend={{ value: dlqCount > 0 ? "Alert" : "Clean", isPositive: dlqCount === 0 }}
        />
        <StatCard 
          title="Worker Status" 
          value={`${activeWorkers} Online`} 
          description="Active registered nodes" 
          icon={Server} 
          colorClass="text-cyan-400" 
        />
        <StatCard 
          title="Worker Health" 
          value={`${workerHealth}%`} 
          description="Heartbeat health ratio" 
          icon={Heart} 
          colorClass="text-emerald-450" 
        />
        <StatCard 
          title="Queue Health" 
          value={`${queueHealth}%`} 
          description="Average queue readiness" 
          icon={Layers} 
          colorClass="text-primary" 
        />
        <StatCard 
          title="Throughput" 
          value={throughput} 
          description="Execution volume" 
          icon={Activity} 
          colorClass="text-violet-400" 
        />
        <StatCard 
          title="Execution Metrics" 
          value={executionMetrics} 
          description="Completed vs queued" 
          icon={Terminal} 
          colorClass="text-indigo-400" 
        />
        <StatCard 
          title="System Health" 
          value={`${healthScore.toFixed(1)}%`} 
          description="Service SLA score" 
          icon={Heart} 
          colorClass="text-emerald-450" 
          trend={{ value: "Stable", isPositive: true }}
        />
      </div>

      {/* Split Layout: Org Summary & Projects vs Queues status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Org and Projects */}
        <div className="lg:col-span-1 space-y-6">
          {/* Org Summary */}
          <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-5">
            <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Workspace Insights
            </h3>
            <div className="space-y-3 font-mono text-[11px] leading-relaxed">
              <div className="flex justify-between border-b border-white/[0.02] pb-2">
                <span className="text-zinc-500">Active Tenant:</span>
                <span className="text-zinc-200 font-bold">{activeOrg?.name || "None"}</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.02] pb-2">
                <span className="text-zinc-500">Organizations:</span>
                <span className="text-zinc-200">{orgList.length} Active</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.02] pb-2">
                <span className="text-zinc-500">Teams Registered:</span>
                <span className="text-zinc-200">{teamList.length} Teams</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Collaborators:</span>
                <span className="text-zinc-200">{memberList.length} Members</span>
              </div>
            </div>
          </div>

          {/* Projects Registry */}
          <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-5">
            <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-2">
              <Folder className="w-4 h-4 text-accent" /> Active Projects
            </h3>
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {projectList.length === 0 ? (
                <div className="text-zinc-500 text-xs font-mono text-center py-4">No projects registered.</div>
              ) : (
                projectList.map((p) => (
                  <div key={p.id} className="p-3.5 bg-white/[0.015] border border-white/5 rounded-xl space-y-1 hover:border-white/10 transition-colors">
                    <span className="font-bold text-zinc-200 text-xs font-mono">{p.name}</span>
                    <p className="text-[10px] text-zinc-500 leading-normal truncate">{p.description || "No description provided."}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Active Queues & Health */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel border border-white/5 space-y-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-primary" /> Active Queue Health & Concurrency
            </h3>
            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {queueList.length === 0 ? (
                <div className="p-12 text-center text-zinc-500 font-mono text-xs">No active queues configured.</div>
              ) : (
                queueList.map((q) => {
                  const isHealthy = q.health_score > 80;
                  const isWarning = q.health_score <= 80 && q.health_score > 50;
                  const progressColor = isHealthy ? "bg-gradient-to-r from-emerald-500 to-emerald-400" :
                                        isWarning ? "bg-gradient-to-r from-amber-500 to-amber-400" :
                                        "bg-gradient-to-r from-rose-500 to-rose-450";
                  return (
                    <div key={q.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-white/10 transition-colors">
                      <div className="space-y-1">
                        <span className="font-bold text-zinc-200 text-xs font-mono">{q.name}</span>
                        <div className="flex gap-4 text-[10px] font-mono text-zinc-500">
                          <span>Limit: {q.concurrency_limit} concurrent</span>
                          <span>Capacity: {q.max_queue_size} items</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="flex-1 md:w-36 h-2 bg-zinc-900 border border-white/5 rounded-full overflow-hidden shrink-0">
                          <div className={`h-full ${progressColor}`} style={{ width: `${q.health_score}%` }} />
                        </div>
                        <Badge variant={isHealthy ? "success" : isWarning ? "warning" : "danger"}>
                          {q.health_score}% Health
                        </Badge>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Split lists: Recent Executions, Recent Failures & Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Recent Executions */}
        <div className="xl:col-span-1">
          <Card title="Recent Executions" subtitle="Live stream of last 5 worker run states">
            <Table columns={execColumns} data={executionList.slice(0, 5)} />
          </Card>
        </div>

        {/* Recent Failures / DLQ */}
        <div className="xl:col-span-1">
          <Card title="Recent Failure Isolation" subtitle="Last 5 jobs pushed to dead letter queue">
            <Table columns={failureColumns} data={recentFailures} />
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="xl:col-span-1 p-6 rounded-2xl glass-panel border border-white/5 flex flex-col justify-between">
          <div className="mb-6">
            <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-primary" /> Workspace Activity Feed
            </h3>
            <p className="text-[11px] text-zinc-500 mt-1">
              Real-time audit trailing logs compiled from operator changes
            </p>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-80 pr-1">
            {auditLogList.length === 0 ? (
              <div className="p-8 text-center text-zinc-600 text-xs font-mono">
                No activity logs written. Perform actions to seed feed.
              </div>
            ) : (
              auditLogList.slice(0, 5).map((log) => (
                <div key={log.id} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl text-[11px] font-mono leading-relaxed text-zinc-300 flex justify-between gap-4 hover:border-white/10 transition-colors">
                  <div>
                    <span className="text-primary font-bold">[{log.action.toUpperCase()}]</span> {log.details || `Modified ${log.entity_type}`}
                  </div>
                  <span className="text-zinc-500 shrink-0 font-mono text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
