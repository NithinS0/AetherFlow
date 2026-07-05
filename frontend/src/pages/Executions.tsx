import { useState, useEffect } from "react";
import { useStore } from "../stores/store";
import { api } from "../services/api";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { Card } from "../components/Card";
import { Drawer } from "../components/Drawer";
import { Terminal, RefreshCw, Trash2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export function Executions() {
  const store = useStore();
  const [selectedExec, setSelectedExec] = useState<any | null>(null);
  const [execLogs, setExecLogs] = useState<any[]>([]);

  useEffect(() => {
    store.fetchExecutions();
    store.fetchJobs(store.projects[0]?.id || "");
    const interval = setInterval(() => {
      store.fetchExecutions();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadLogs = async (exec: any) => {
    setSelectedExec(exec);
    setExecLogs([]);
    try {
      const logs = await api.getExecutionLogs(exec.id);
      setExecLogs(logs);
    } catch {
      toast.error("Failed to load execution logs");
    }
  };

  const handleRetryDlq = async (jobId: string) => {
    try {
      await api.retryDlqJob(jobId);
      toast.success("Job re-routed back to scheduling queue");
      store.fetchExecutions();
      store.fetchJobs(store.projects[0]?.id || "");
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
      store.fetchExecutions();
      store.fetchJobs(store.projects[0]?.id || "");
    } catch (e: any) {
      toast.error(e.message || "Purge failed");
    }
  };

  // DLQ Jobs list
  const dlqJobs = store.jobs.filter(j => j.status === "dead_letter");

  const execColumns = [
    {
      key: "id",
      header: "Exec ID",
      render: (row: any) => (
        <span className="font-mono text-zinc-500 font-semibold">{row.id.slice(0, 8)}...</span>
      )
    },
    {
      key: "job_id",
      header: "Job ID",
      render: (row: any) => (
        <span className="font-mono text-zinc-400">{row.job_id.slice(0, 8)}...</span>
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
    },
    {
      key: "start_time",
      header: "Execution Start",
      render: (row: any) => (
        <span className="font-mono text-[10px] text-zinc-500">{new Date(row.start_time).toLocaleString()}</span>
      )
    },
    {
      key: "actions",
      header: "Operator Console",
      render: (row: any) => (
        <button
          onClick={() => loadLogs(row)}
          className="text-primary hover:underline flex items-center gap-1 cursor-pointer font-mono text-[10px]"
        >
          <Terminal className="w-3.5 h-3.5" /> View Logs
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
            Active Executions & DLQ
          </h2>
          <p className="text-zinc-500 text-sm mt-1">
            Track active task execution, stream process logs, and re-enqueue failed Dead Letter Queue tasks.
          </p>
        </div>
        <button
          onClick={() => store.fetchExecutions()}
          className="p-2 bg-zinc-900 border border-border rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Executions lists */}
        <div className="xl:col-span-2">
          <Card title="Active & Completed Executions" subtitle="Live stream of running worker thread logs">
            <Table columns={execColumns} data={store.executions} />
          </Card>
        </div>

        {/* DLQ Panel */}
        <div className="xl:col-span-1 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1 flex items-center gap-1.5">
            <ShieldAlert className="w-4.5 h-4.5 text-red-500" /> Dead Letter Queue (DLQ)
          </h3>
          {dlqJobs.length === 0 ? (
            <div className="p-8 text-center border border-border rounded-2xl glass-panel text-zinc-500 font-mono text-xs">
              No failed jobs in Dead Letter table. All tasks healthy.
            </div>
          ) : (
            <div className="space-y-4">
              {dlqJobs.map((j) => (
                <div key={j.id} className="p-4 rounded-xl glass-panel border border-red-950/20 bg-red-950/5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-red-400 font-bold text-xs uppercase">Attempt Limit Exceeded</span>
                      <span className="text-[9px] font-mono text-zinc-500">{j.id.slice(0, 8)}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-2 font-mono">Payload: {JSON.stringify(j.payload || {})}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRetryDlq(j.id)}
                      className="flex-1 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/25 text-primary hover:text-white font-bold rounded-lg text-[10px] transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Retry Task
                    </button>
                    <button
                      onClick={() => handlePurgeDlq(j.id)}
                      className="p-1.5 bg-zinc-900 border border-border hover:text-red-400 hover:border-red-950 rounded-lg transition-colors cursor-pointer"
                      title="Purge DLQ Job"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Logs Drawer */}
      <Drawer open={!!selectedExec} onClose={() => setSelectedExec(null)} title="Live Thread stdout/stderr logs">
        {selectedExec && (
          <div className="space-y-6 text-xs font-mono">
            <div className="p-3 bg-zinc-900/60 border border-border/80 rounded-xl space-y-1">
              <div className="flex justify-between text-zinc-500">
                <span>Execution ID:</span>
                <span className="text-zinc-300 font-bold">{selectedExec.id}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Worker node:</span>
                <span className="text-zinc-300 font-bold">{selectedExec.worker_id}</span>
              </div>
            </div>

            <div className="p-4 bg-zinc-950 border border-border rounded-xl max-h-96 overflow-y-auto space-y-2 text-[10px] text-emerald-400 font-mono">
              {execLogs.length === 0 ? (
                <div className="text-zinc-600 text-center py-4">No stdout lines recorded for execution node.</div>
              ) : (
                execLogs.map((log) => {
                  const levelColor = log.level === "error" ? "text-red-400" :
                                     log.level === "warning" ? "text-amber-400" : "text-emerald-400";
                  return (
                    <div key={log.id} className="flex gap-3 leading-relaxed">
                      <span className="text-zinc-600 shrink-0 select-none">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                      <span className={`${levelColor} font-bold uppercase shrink-0`}>[{log.level}]</span>
                      <span className="text-zinc-300">{log.message}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </Drawer>

    </div>
  );
}
