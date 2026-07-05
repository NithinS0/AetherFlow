import { useState, useEffect } from "react";
import { useStore } from "../stores/store";
import { api } from "../services/api";
import { Table } from "../components/Table";
import { Card } from "../components/Card";
import { Modal } from "../components/Modal";
import { Drawer } from "../components/Drawer";
import { Button } from "../components/Button";
import { 
  RefreshCw, 
  Trash2, 
  Eye, 
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

export function DeadLetterQueue() {
  const store = useStore();
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  
  // Incident Modal
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  const [incidentJob, setIncidentJob] = useState<any | null>(null);
  const [incidentTitle, setIncidentTitle] = useState("");
  const [incidentDesc, setIncidentDesc] = useState("");
  const [incidentSeverity, setIncidentSeverity] = useState("high");
  const [loading, setLoading] = useState(false);

  const activeProj = store.projects[0];

  useEffect(() => {
    if (activeProj) {
      store.fetchJobs(activeProj.id);
    }
  }, [activeProj]);

  const triggerRefresh = () => {
    if (activeProj) store.fetchJobs(activeProj.id);
  };

  const handleRetryDlq = async (jobId: string) => {
    try {
      await api.retryDlqJob(jobId);
      toast.success("Job re-routed back to scheduling queue");
      triggerRefresh();
    } catch (e: any) {
      toast.error(e.message || "Retry failed");
    }
  };

  const handlePurgeDlq = async (jobId: string) => {
    const confirm = window.confirm("Are you sure you want to permanently delete this dead letter job?");
    if (!confirm) return;

    try {
      await api.deleteDlqJob(jobId);
      toast.success("Job purged from Dead Letter database");
      triggerRefresh();
    } catch (e: any) {
      toast.error(e.message || "Purge failed");
    }
  };

  const handleOpenIncidentModal = (job: any) => {
    setIncidentJob(job);
    setIncidentTitle(`DLQ Failure: Job ${job.id.slice(0, 8)}`);
    setIncidentDesc(`Investigation required for Dead Letter Queue job ${job.id}. Payload: ${JSON.stringify(job.payload || {})}`);
    setIncidentSeverity("high");
    setIncidentModalOpen(true);
  };

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentJob) return;
    setLoading(true);

    try {
      await api.createIncident({
        title: incidentTitle,
        description: incidentDesc,
        severity: incidentSeverity,
        trigger: "DLQ_THRESHOLD_BREACH",
        job_id: incidentJob.id,
        queue_id: incidentJob.queue_id
      });
      toast.success("Incident created and assigned to on-call engineers");
      setIncidentModalOpen(false);
      setIncidentJob(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to assign incident");
    } finally {
      setLoading(false);
    }
  };

  const dlqJobs = store.jobs.filter(j => j.status === "dead_letter" || j.status === "failed");

  const columns = [
    {
      key: "id",
      header: "Job ID",
      render: (row: any) => (
        <span className="font-mono text-zinc-500 font-semibold">{row.id.slice(0, 8)}...</span>
      )
    },
    {
      key: "queue_id",
      header: "Queue Link",
      render: (row: any) => (
        <span className="font-mono text-zinc-400 text-[10px]">{row.queue_id.slice(0, 8)}...</span>
      )
    },
    {
      key: "failure_reason",
      header: "Failure Reason",
      render: (row: any) => (
        <span className="text-red-400 font-mono text-[11px] font-medium leading-normal">
          {row.error_message || "Max retries exceeded with exit status 1"}
        </span>
      )
    },
    {
      key: "retry_count",
      header: "Retry Count",
      render: (row: any) => (
        <span className="font-mono text-zinc-400">{row.retry_count} / {row.max_retries}</span>
      )
    },
    {
      key: "actions",
      header: "Operator Console",
      render: (row: any) => (
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedJob(row)}
            className="text-zinc-400 hover:text-white cursor-pointer"
            title="Inspect Job Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleRetryDlq(row.id)}
            className="text-primary hover:text-primary-light cursor-pointer"
            title="Replay / Re-route Job"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenIncidentModal(row)}
            className="text-amber-500 hover:text-amber-400 cursor-pointer"
            title="Assign Incident"
          >
            <AlertTriangle className="w-4 h-4" />
          </button>
          <button
            onClick={() => handlePurgeDlq(row.id)}
            className="text-red-500 hover:text-red-400 cursor-pointer"
            title="Purge DLQ Job"
          >
            <Trash2 className="w-4 h-4" />
          </button>
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
            Dead Letter Queue (DLQ)
          </h2>
          <p className="text-zinc-500 text-sm mt-1">
            Isolate permanently failed executions, analyze stack traces, trigger replay routing, and dispatch incidents.
          </p>
        </div>
        <button
          onClick={triggerRefresh}
          className="p-2 bg-zinc-900 border border-border rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card title="Dead Letter Task Registrations" subtitle="Failed jobs awaiting recovery or diagnostic review">
          <Table columns={columns} data={dlqJobs} />
        </Card>
      </div>

      {/* Detail Drawer */}
      <Drawer open={!!selectedJob} onClose={() => setSelectedJob(null)} title="Dead Letter Job Context">
        {selectedJob && (
          <div className="space-y-6 text-xs font-mono">
            <div className="p-3 bg-zinc-900/60 border border-border/80 rounded-xl space-y-2">
              <div className="flex justify-between text-zinc-500">
                <span>Job ID:</span>
                <span className="text-zinc-300 font-bold">{selectedJob.id}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Queue:</span>
                <span className="text-zinc-300 font-bold">{selectedJob.queue_id}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Failed Attempt:</span>
                <span className="text-red-400 font-bold">{selectedJob.retry_count} / {selectedJob.max_retries}</span>
              </div>
            </div>

            <div>
              <span className="block text-zinc-400 font-bold uppercase tracking-wider mb-2">Payload Details</span>
              <pre className="p-4 bg-zinc-950 border border-border rounded-xl text-zinc-300 overflow-x-auto text-[10px]">
                {JSON.stringify(selectedJob.payload || {}, null, 2)}
              </pre>
            </div>

            <div>
              <span className="block text-zinc-400 font-bold uppercase tracking-wider mb-2">Failure Reason</span>
              <div className="p-4 bg-red-950/10 border border-red-900/20 text-red-400 rounded-xl leading-relaxed">
                {selectedJob.error_message || "Max retries exceeded with exit status 1. Task terminated due to unhandled promise rejection."}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Incident Modal */}
      <Modal open={incidentModalOpen} onClose={() => setIncidentModalOpen(false)} title="Assign Incident Report">
        <form onSubmit={handleCreateIncident} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-zinc-400 mb-1 font-semibold uppercase tracking-wider">Incident Title</label>
            <input
              type="text"
              required
              value={incidentTitle}
              onChange={(e) => setIncidentTitle(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-border rounded-lg text-zinc-200 focus:outline-none focus:border-primary text-xs"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1.5 font-semibold uppercase tracking-wider">Severity</label>
            <select
              value={incidentSeverity}
              onChange={(e) => setIncidentSeverity(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-border rounded-lg text-zinc-200 focus:outline-none focus:border-primary text-xs"
            >
              <option value="critical">CRITICAL (Sev-0)</option>
              <option value="high">HIGH (Sev-1)</option>
              <option value="medium">MEDIUM (Sev-2)</option>
              <option value="low">LOW (Sev-3)</option>
            </select>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1 font-semibold uppercase tracking-wider">Description / Investigation Note</label>
            <textarea
              rows={4}
              required
              value={incidentDesc}
              onChange={(e) => setIncidentDesc(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-border rounded-lg text-zinc-200 focus:outline-none focus:border-primary text-xs"
            />
          </div>

          <Button type="submit" loading={loading} className="w-full mt-2">
            Assign Incident
          </Button>
        </form>
      </Modal>

    </div>
  );
}
