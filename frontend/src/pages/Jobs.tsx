import { useState, useEffect } from "react";
import { useStore } from "../stores/store";
import { API_URL } from "../services/api";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Modal } from "../components/Modal";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { Drawer } from "../components/Drawer";
import { 
  Calendar, 
  Layers, 
  Workflow, 
  Ban, 
  Eye, 
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

export function Jobs() {
  const store = useStore();
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  
  // Modals status
  const [cronModalOpen, setCronModalOpen] = useState(false);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [depModalOpen, setDepModalOpen] = useState(false);

  // Filters State
  const [queueFilter, setQueueFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // Form states - Cron
  const [cronName, setCronName] = useState("");
  const [cronQueue, setCronQueue] = useState("");
  const [cronExpression, setCronExpression] = useState("*/5 * * * *");
  const [cronTimezone, setCronTimezone] = useState("UTC");
  const [cronPayload, setCronPayload] = useState('{"action": "sync"}');

  // Form states - Batch
  const [batchName, setBatchName] = useState("");
  const [batchQueue, setBatchQueue] = useState("");
  const [batchPayloads, setBatchPayloads] = useState('[{"task": "email-1"}, {"task": "email-2"}]');

  // Form states - Dependency
  const [childJobId, setChildJobId] = useState("");
  const [parentJobId, setParentJobId] = useState("");

  const activeProj = store.projects[0];

  useEffect(() => {
    if (activeProj) {
      store.fetchQueues(activeProj.id);
      store.fetchJobs(activeProj.id);
      store.fetchScheduledJobs(activeProj.id);
    }
  }, [activeProj]);

  const triggerRefresh = () => {
    if (activeProj) {
      store.fetchJobs(activeProj.id);
      store.fetchScheduledJobs(activeProj.id);
    }
  };

  const handleCancelJob = async (jobId: string) => {
    const confirm = window.confirm("Are you sure you want to cancel this job?");
    if (!confirm) return;

    try {
      const res = await fetch(`${API_URL}/jobs/${jobId}/cancel`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("aetherflow_token")}`
        }
      });
      if (!res.ok) throw new Error("Cancellation failed");
      toast.success("Job run cancelled successfully");
      triggerRefresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCreateCron = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cronQueue) return;
    setLoading(true);

    try {
      const parsedPayload = JSON.parse(cronPayload);
      const res = await fetch(`${API_URL}/jobs/scheduled`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("aetherflow_token")}`
        },
        body: JSON.stringify({
          name: cronName,
          queue_id: cronQueue,
          cron_expression: cronExpression,
          timezone: cronTimezone,
          payload: parsedPayload
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Scheduled job creation failed");
      }

      toast.success(`Cron Schedule '${cronName}' registered`);
      setCronModalOpen(false);
      setCronName("");
      setCronPayload('{"action": "sync"}');
      triggerRefresh();
    } catch (err: any) {
      toast.error(err.message || "Invalid payload JSON syntax");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchQueue) return;
    setLoading(true);

    try {
      const parsedPayloads = JSON.parse(batchPayloads);
      if (!Array.isArray(parsedPayloads)) {
        throw new Error("Payloads must be a valid JSON list of objects");
      }

      const jobsData = parsedPayloads.map((payload) => ({
        name: `${batchName}-job`,
        queue_id: batchQueue,
        type: "batch",
        priority: "medium",
        payload: payload
      }));

      const res = await fetch(`${API_URL}/jobs/batches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("aetherflow_token")}`
        },
        body: JSON.stringify({
          name: batchName,
          jobs: jobsData
        })
      });

      if (!res.ok) throw new Error("Batch deploy failed");
      toast.success("Job batch deployed successfully");
      setBatchModalOpen(false);
      setBatchName("");
      triggerRefresh();
    } catch (err: any) {
      toast.error(err.message || "Invalid JSON syntax");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkDependency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childJobId || !parentJobId) return;
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/jobs/${childJobId}/dependencies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("aetherflow_token")}`
        },
        body: JSON.stringify({
          parent_job_id: parentJobId
        })
      });

      if (!res.ok) throw new Error("Link failed");
      toast.success("Job dependency linked successfully");
      setDepModalOpen(false);
      setChildJobId("");
      setParentJobId("");
      triggerRefresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter local store jobs
  const filteredJobs = store.jobs.filter((j) => {
    if (queueFilter && j.queue_id !== queueFilter) return false;
    if (statusFilter && j.status !== statusFilter) return false;
    if (typeFilter && j.type !== typeFilter) return false;
    return true;
  });

  const columns = [
    {
      key: "id",
      header: "Job ID",
      render: (row: any) => (
        <span className="font-mono text-zinc-500 font-semibold">{row.id.slice(0, 8)}...</span>
      )
    },
    {
      key: "type",
      header: "Type",
      render: (row: any) => (
        <span className="font-mono text-[10px] uppercase font-bold text-zinc-400">{row.type}</span>
      )
    },
    {
      key: "status",
      header: "Status",
      render: (row: any) => {
        const color = row.status === "queued" ? "info" :
                      row.status === "completed" ? "success" :
                      row.status === "failed" ? "danger" :
                      row.status === "cancelled" ? "warning" : "neutral";
        return <Badge variant={color}>{row.status}</Badge>;
      }
    },
    {
      key: "priority",
      header: "Priority",
      render: (row: any) => (
        <span className="text-[10px] font-bold font-mono text-zinc-500 uppercase">{row.priority}</span>
      )
    },
    {
      key: "scheduled_time",
      header: "Scheduled Time",
      render: (row: any) => (
        <span className="font-mono text-[10px] text-zinc-400">{new Date(row.scheduled_time).toLocaleString()}</span>
      )
    },
    {
      key: "actions",
      header: "Operator commands",
      render: (row: any) => (
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedJob(row)}
            className="text-primary hover:underline cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>
          {["pending", "queued"].includes(row.status) && (
            <button
              onClick={() => handleCancelJob(row.id)}
              className="text-red-500 hover:text-red-400 cursor-pointer"
            >
              <Ban className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-50 bg-gradient-to-r from-zinc-50 to-zinc-400 bg-clip-text text-transparent">
            Jobs & Scheduled Orchestration
          </h2>
          <p className="text-zinc-500 text-sm mt-1">
            Dispatch immediate jobs, configure recurring cron schedules, chain dependencies, and inspect payloads.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setCronModalOpen(true)} variant="outline" size="sm">
            <Calendar className="w-4 h-4" /> Cron Schedule
          </Button>
          <Button onClick={() => setBatchModalOpen(true)} variant="outline" size="sm">
            <Layers className="w-4 h-4" /> Deploy Batch
          </Button>
          <Button onClick={() => setDepModalOpen(true)} variant="outline" size="sm">
            <Workflow className="w-4 h-4" /> Link Dependency
          </Button>
          <button
            onClick={triggerRefresh}
            className="p-2 bg-zinc-900 border border-border rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <div className="p-4 rounded-xl glass-panel border border-border flex flex-wrap gap-4 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 uppercase tracking-wider font-semibold">Queue:</span>
          <select
            value={queueFilter}
            onChange={(e) => setQueueFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-zinc-900 border border-border rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-primary"
          >
            <option value="">-- All Queues --</option>
            {store.queues.map((q) => (
              <option key={q.id} value={q.id}>{q.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-zinc-500 uppercase tracking-wider font-semibold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-zinc-900 border border-border rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-primary"
          >
            <option value="">-- All Status --</option>
            <option value="pending">Pending</option>
            <option value="queued">Queued</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-zinc-500 uppercase tracking-wider font-semibold">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-zinc-900 border border-border rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-primary"
          >
            <option value="">-- All Types --</option>
            <option value="immediate">Immediate</option>
            <option value="delayed">Delayed</option>
            <option value="scheduled">Scheduled</option>
            <option value="cron">Cron</option>
            <option value="batch">Batch</option>
            <option value="dependency">Dependency</option>
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <Card title="Active Scheduling Registry" subtitle="Historical register of job runs ready for distributed worker execution">
        <Table columns={columns} data={filteredJobs} />
      </Card>

      {/* Detail Drawer */}
      <Drawer open={!!selectedJob} onClose={() => setSelectedJob(null)} title="Job Orchestration Details">
        {selectedJob && (
          <div className="space-y-6 text-xs font-mono">
            <div className="p-3 bg-zinc-900/60 border border-border/80 rounded-xl space-y-2">
              <div className="flex justify-between text-zinc-500">
                <span>Job UUID:</span>
                <span className="text-zinc-300 font-bold">{selectedJob.id}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Queue Link:</span>
                <span className="text-zinc-300 font-bold">{selectedJob.queue_id}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Priority:</span>
                <span className="text-primary font-bold uppercase">{selectedJob.priority}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Attempt count:</span>
                <span className="text-zinc-300 font-bold">{selectedJob.retry_count} / {selectedJob.max_retries} max</span>
              </div>
            </div>

            <div>
              <span className="block text-zinc-400 font-bold uppercase tracking-wider mb-2">Payload JSON parameters</span>
              <pre className="p-4 bg-zinc-950 border border-border rounded-xl text-zinc-300 overflow-x-auto text-[10px]">
                {JSON.stringify(selectedJob.payload || {}, null, 2)}
              </pre>
            </div>

            <div>
              <span className="block text-zinc-400 font-bold uppercase tracking-wider mb-2">Scheduling details</span>
              <div className="p-3 bg-zinc-900/40 border border-border/60 rounded-xl space-y-2.5 text-zinc-400">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="text-zinc-300 uppercase">{selectedJob.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Scheduled date:</span>
                  <span className="text-zinc-300">{new Date(selectedJob.scheduled_time).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Timeout limit:</span>
                  <span className="text-zinc-300">{selectedJob.timeout_seconds} seconds</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Cron Schedule Modal */}
      <Modal open={cronModalOpen} onClose={() => setCronModalOpen(false)} title="Schedule Cron Job">
        <form onSubmit={handleCreateCron} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-zinc-400 mb-1 font-semibold uppercase tracking-wider">Schedule Name</label>
            <input
              type="text"
              required
              placeholder="e.g. database-purge-midnight"
              value={cronName}
              onChange={(e) => setCronName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-border rounded-lg text-zinc-200 focus:outline-none focus:border-primary text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 mb-1.5 font-semibold uppercase tracking-wider">Execution Queue</label>
              <select
                value={cronQueue}
                required
                onChange={(e) => setCronQueue(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-border rounded-lg text-zinc-200 focus:outline-none focus:border-primary text-xs"
              >
                <option value="">-- Select Queue --</option>
                {store.queues.map((q) => (
                  <option key={q.id} value={q.id}>{q.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1.5 font-semibold uppercase tracking-wider">Timezone</label>
              <select
                value={cronTimezone}
                onChange={(e) => setCronTimezone(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-border rounded-lg text-zinc-200 focus:outline-none focus:border-primary text-xs"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Asia/Kolkata">Asia/Kolkata</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1 font-semibold uppercase tracking-wider">Cron Expression</label>
            <input
              type="text"
              required
              value={cronExpression}
              onChange={(e) => setCronExpression(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-border rounded-lg text-zinc-200 focus:outline-none focus:border-primary text-xs"
            />
            <span className="text-[10px] text-zinc-500 mt-1 block">Must follow standard 5-field cron (e.g. */5 * * * *)</span>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1 font-semibold uppercase tracking-wider">Payload JSON parameters</label>
            <textarea
              rows={3}
              required
              value={cronPayload}
              onChange={(e) => setCronPayload(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-border rounded-lg text-zinc-200 focus:outline-none focus:border-primary text-xs font-mono"
            />
          </div>

          <Button type="submit" loading={loading} className="w-full mt-2">
            Schedule Cron
          </Button>
        </form>
      </Modal>

      {/* Batch deploy Modal */}
      <Modal open={batchModalOpen} onClose={() => setBatchModalOpen(false)} title="Deploy Batch Jobs">
        <form onSubmit={handleCreateBatch} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-zinc-400 mb-1 font-semibold uppercase tracking-wider">Batch Name</label>
            <input
              type="text"
              required
              placeholder="e.g. batch-email-relays"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-border rounded-lg text-zinc-200 focus:outline-none focus:border-primary text-xs"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1.5 font-semibold uppercase tracking-wider">Execution Queue</label>
            <select
              value={batchQueue}
              required
              onChange={(e) => setBatchQueue(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-border rounded-lg text-zinc-200 focus:outline-none focus:border-primary text-xs"
            >
              <option value="">-- Select Queue --</option>
              {store.queues.map((q) => (
                <option key={q.id} value={q.id}>{q.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1 font-semibold uppercase tracking-wider">Batch Job Payloads (List of objects)</label>
            <textarea
              rows={4}
              required
              value={batchPayloads}
              onChange={(e) => setBatchPayloads(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-border rounded-lg text-zinc-200 focus:outline-none focus:border-primary text-xs font-mono"
            />
          </div>

          <Button type="submit" loading={loading} className="w-full mt-2">
            Deploy Batch
          </Button>
        </form>
      </Modal>

      {/* Dependency Modal */}
      <Modal open={depModalOpen} onClose={() => setDepModalOpen(false)} title="Link Job Dependency">
        <form onSubmit={handleLinkDependency} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-zinc-400 mb-1.5 font-semibold uppercase tracking-wider">Select Child Job (Blocked)</label>
            <select
              value={childJobId}
              required
              onChange={(e) => setChildJobId(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-border rounded-lg text-zinc-200 focus:outline-none focus:border-primary text-xs"
            >
              <option value="">-- Select Job --</option>
              {store.jobs.map((j) => (
                <option key={j.id} value={j.id}>{j.type.toUpperCase()} ({j.id.slice(0, 8)})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1.5 font-semibold uppercase tracking-wider">Select Parent Job (Required)</label>
            <select
              value={parentJobId}
              required
              onChange={(e) => setParentJobId(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-border rounded-lg text-zinc-200 focus:outline-none focus:border-primary text-xs"
            >
              <option value="">-- Select Job --</option>
              {store.jobs.map((j) => (
                <option key={j.id} value={j.id}>{j.type.toUpperCase()} ({j.id.slice(0, 8)})</option>
              ))}
            </select>
          </div>

          <Button type="submit" loading={loading} className="w-full mt-2">
            Link Dependency
          </Button>
        </form>
      </Modal>

    </div>
  );
}
