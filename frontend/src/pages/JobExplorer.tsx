import { useState, useEffect } from "react";
import { useStore } from "../stores/store";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { Card } from "../components/Card";
import { Drawer } from "../components/Drawer";
import { 
  Eye, 
  RefreshCw, 
  Search
} from "lucide-react";

export function JobExplorer() {
  const store = useStore();
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  
  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [queueFilter, setQueueFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const activeProj = store.projects[0];

  useEffect(() => {
    if (activeProj) {
      store.fetchQueues(activeProj.id);
      store.fetchJobs(activeProj.id);
    }
  }, [activeProj]);

  const triggerRefresh = () => {
    if (activeProj) {
      store.fetchJobs(activeProj.id);
    }
  };

  // Filter jobs based on search query and drop-down filters
  const filteredJobs = store.jobs.filter((j) => {
    if (queueFilter && j.queue_id !== queueFilter) return false;
    if (statusFilter && j.status !== statusFilter) return false;
    if (typeFilter && j.type !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchId = j.id.toLowerCase().includes(q);
      const matchName = j.name?.toLowerCase().includes(q) || false;
      const matchPayload = JSON.stringify(j.payload || {}).toLowerCase().includes(q);
      return matchId || matchName || matchPayload;
    }
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
      key: "name",
      header: "Job Name",
      render: (row: any) => (
        <span className="text-zinc-300 font-medium font-mono text-[11px]">{row.name || "unnamed"}</span>
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
      key: "retry_count",
      header: "Retries",
      render: (row: any) => (
        <span className="font-mono text-zinc-400">{row.retry_count} / {row.max_retries}</span>
      )
    },
    {
      key: "scheduled_time",
      header: "Scheduled Run Time",
      render: (row: any) => (
        <span className="font-mono text-[10px] text-zinc-500">{new Date(row.scheduled_time).toLocaleString()}</span>
      )
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: any) => (
        <button
          onClick={() => setSelectedJob(row)}
          className="text-primary hover:underline cursor-pointer flex items-center gap-1 font-mono text-[10px]"
        >
          <Eye className="w-3.5 h-3.5" /> Inspect
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
            Job Explorer Console
          </h2>
          <p className="text-zinc-500 text-sm mt-1">
            Search, filter, and inspect execution payloads for all immediate, scheduled, delayed, and recurring jobs.
          </p>
        </div>
        <button
          onClick={triggerRefresh}
          className="p-2 bg-zinc-900 border border-border rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter and Search Panel */}
      <div className="p-5 rounded-2xl glass-panel border border-border flex flex-col md:flex-row md:items-center justify-between gap-6 text-xs font-mono">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by UUID, Name, or Payload Content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-zinc-950/40 border border-border rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap gap-4">
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
              <option value="dead_letter">Dead Letter</option>
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
      </div>

      {/* Main Table */}
      <Card title="Distributed Job Database" subtitle="Complete record list of all job runs in the current project">
        <Table columns={columns} data={filteredJobs} />
      </Card>

      {/* Detail Drawer */}
      <Drawer open={!!selectedJob} onClose={() => setSelectedJob(null)} title="Job Dispatch Registry Details">
        {selectedJob && (
          <div className="space-y-6 text-xs font-mono">
            <div className="p-3 bg-zinc-900/60 border border-border/80 rounded-xl space-y-2">
              <div className="flex justify-between text-zinc-500">
                <span>Job UUID:</span>
                <span className="text-zinc-300 font-bold">{selectedJob.id}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Name:</span>
                <span className="text-zinc-300 font-bold">{selectedJob.name || "unnamed"}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Queue:</span>
                <span className="text-zinc-300 font-bold">{selectedJob.queue_id}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Priority:</span>
                <span className="text-primary font-bold uppercase">{selectedJob.priority}</span>
              </div>
            </div>

            <div>
              <span className="block text-zinc-400 font-bold uppercase tracking-wider mb-2">Payload JSON Data</span>
              <pre className="p-4 bg-zinc-950 border border-border rounded-xl text-zinc-300 overflow-x-auto text-[10px]">
                {JSON.stringify(selectedJob.payload || {}, null, 2)}
              </pre>
            </div>

            <div>
              <span className="block text-zinc-400 font-bold uppercase tracking-wider mb-2">Job Configuration</span>
              <div className="p-3 bg-zinc-900/40 border border-border/60 rounded-xl space-y-2 text-zinc-400">
                <div className="flex justify-between">
                  <span>Job Type:</span>
                  <span className="text-zinc-300 uppercase font-bold">{selectedJob.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Scheduled Time:</span>
                  <span className="text-zinc-300">{new Date(selectedJob.scheduled_time).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Attempts:</span>
                  <span className="text-zinc-300 font-bold">{selectedJob.retry_count} / {selectedJob.max_retries} max</span>
                </div>
                <div className="flex justify-between">
                  <span>Timeout Value:</span>
                  <span className="text-zinc-300">{selectedJob.timeout_seconds} seconds</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
