import { useState, useEffect } from "react";
import { API_URL } from "../services/api";
import { useStore } from "../stores/store";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Modal } from "../components/Modal";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { Drawer } from "../components/Drawer";
import { 
  Calendar, 
  Layers, 
  Clock, 
  Eye, 
  RefreshCw, 
  Trash2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

export function ScheduledJobs() {
  const store = useStore();
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  
  // Modals status
  const [cronModalOpen, setCronModalOpen] = useState(false);
  const [batchModalOpen, setBatchModalOpen] = useState(false);

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

  const activeProj = store.projects[0];

  useEffect(() => {
    if (activeProj) {
      store.fetchQueues(activeProj.id);
      store.fetchJobs(activeProj.id);
      store.fetchScheduledJobs(activeProj.id);
      store.fetchBatches();
    }
  }, [activeProj]);

  const triggerRefresh = () => {
    if (activeProj) {
      store.fetchJobs(activeProj.id);
      store.fetchScheduledJobs(activeProj.id);
      store.fetchBatches();
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

  const handleDeleteCron = async (cronId: string) => {
    const confirm = window.confirm("Are you sure you want to delete this Cron schedule?");
    if (!confirm) return;

    try {
      const res = await fetch(`${API_URL}/jobs/scheduled/${cronId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("aetherflow_token")}`
        }
      });
      if (!res.ok) throw new Error("Failed to delete schedule");
      toast.success("Cron schedule removed");
      triggerRefresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Filter jobs that are scheduled/delayed/recurring
  const scheduledOrDelayedJobs = store.jobs.filter(
    (j) => ["delayed", "scheduled", "cron", "batch"].includes(j.type)
  );

  const cronColumns = [
    {
      key: "name",
      header: "Schedule Name",
      render: (row: any) => (
        <span className="font-bold text-zinc-200">{row.name}</span>
      )
    },
    {
      key: "cron_expression",
      header: "Expression",
      render: (row: any) => (
        <code className="px-1.5 py-0.5 rounded bg-zinc-950 border border-border/80 text-primary font-mono text-[10px]">
          {row.cron_expression}
        </code>
      )
    },
    {
      key: "timezone",
      header: "Timezone",
      render: (row: any) => (
        <span className="text-zinc-400 text-[10px] font-mono">{row.timezone}</span>
      )
    },
    {
      key: "is_active",
      header: "Status",
      render: (row: any) => (
        <Badge variant={row.is_active ? "success" : "neutral"}>
          {row.is_active ? "Active" : "Paused"}
        </Badge>
      )
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: any) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleDeleteCron(row.id)}
            className="text-red-500 hover:text-red-400 cursor-pointer"
            title="Delete Cron Schedule"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const jobsColumns = [
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
      key: "scheduled_time",
      header: "Scheduled Run Time",
      render: (row: any) => (
        <span className="font-mono text-[10px] text-zinc-400">{new Date(row.scheduled_time).toLocaleString()}</span>
      )
    },
    {
      key: "actions",
      header: "Inspect",
      render: (row: any) => (
        <button
          onClick={() => setSelectedJob(row)}
          className="text-primary hover:underline cursor-pointer"
        >
          <Eye className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-50 bg-gradient-to-r from-zinc-50 to-zinc-400 bg-clip-text text-transparent">
            Scheduled & Recurring Jobs
          </h2>
          <p className="text-zinc-500 text-sm mt-1">
            Configure future job delays, register standard 5-field cron tables, and dispatch bulk task batches.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setCronModalOpen(true)} variant="outline" size="sm">
            <Calendar className="w-4 h-4" /> Cron Schedule
          </Button>
          <Button onClick={() => setBatchModalOpen(true)} variant="outline" size="sm">
            <Layers className="w-4 h-4" /> Deploy Batch
          </Button>
          <button
            onClick={triggerRefresh}
            className="p-2 bg-zinc-900 border border-border rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Active Cron registers */}
        <div className="xl:col-span-2 space-y-6">
          <Card title="Cron Scheduling Registrations" subtitle="Active repeating cron orchestrations running in cluster loop">
            <Table columns={cronColumns} data={store.scheduledJobs} />
          </Card>

          <Card title="Future Delayed & Batch Queue" subtitle="Registered runs awaiting scheduled timestamps">
            <Table columns={jobsColumns} data={scheduledOrDelayedJobs} />
          </Card>
        </div>

        {/* Info panel */}
        <div className="xl:col-span-1 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1 flex items-center gap-1.5">
            <Clock className="w-4.5 h-4.5 text-zinc-400" /> Cron & Delay Mechanics
          </h3>
          <div className="p-5 rounded-2xl glass-panel border border-border space-y-4 text-xs font-mono text-zinc-400 leading-relaxed">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4.5 h-4.5 text-primary shrink-0 mt-0.5" />
              <div>
                <strong className="text-zinc-200 block mb-1">Timezone Support</strong>
                AetherFlow matches schedule execution times with target zones. Default timezone is UTC.
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4.5 h-4.5 text-accent shrink-0 mt-0.5" />
              <div>
                <strong className="text-zinc-200 block mb-1">Batch Jobs</strong>
                Batch deployment generates multiple distinct job runs with custom payload index values instantly.
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-zinc-200 block mb-1">Delayed Queuing</strong>
                Queue execution runs are held in standard pending states until delayed target times are satisfied.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      <Drawer open={!!selectedJob} onClose={() => setSelectedJob(null)} title="Scheduled Job Context">
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
            </div>

            <div>
              <span className="block text-zinc-400 font-bold uppercase tracking-wider mb-2">Payload parameters</span>
              <pre className="p-4 bg-zinc-950 border border-border rounded-xl text-zinc-300 overflow-x-auto text-[10px]">
                {JSON.stringify(selectedJob.payload || {}, null, 2)}
              </pre>
            </div>

            <div>
              <span className="block text-zinc-400 font-bold uppercase tracking-wider mb-2">Scheduled details</span>
              <div className="p-3 bg-zinc-900/40 border border-border/60 rounded-xl space-y-2.5 text-zinc-400">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="text-zinc-300 uppercase">{selectedJob.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Scheduled date:</span>
                  <span className="text-zinc-300">{new Date(selectedJob.scheduled_time).toLocaleString()}</span>
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
              placeholder="e.g. database-cleanup-task"
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
              placeholder="e.g. email-batch-push"
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
            <label className="block text-zinc-400 mb-1 font-semibold uppercase tracking-wider">Batch Payloads (JSON Array)</label>
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

    </div>
  );
}
