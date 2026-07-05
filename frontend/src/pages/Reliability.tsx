import { useEffect } from "react";
import { useStore } from "../stores/store";
import { api } from "../services/api";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { Table } from "../components/Table";
import { 
  ShieldAlert, 
  Heart, 
  Activity, 
  RefreshCw, 
  Wrench, 
  Clock,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

export function Reliability() {
  const store = useStore();
  const projectId = store.projects[0]?.id || "";

  useEffect(() => {
    if (projectId) {
      store.fetchReliability(projectId);
    }
    const interval = setInterval(() => {
      if (projectId) store.fetchReliability(projectId);
    }, 5000);
    return () => clearInterval(interval);
  }, [projectId]);

  const handleManualHeal = async () => {
    try {
      const res = await api.triggerManualHeal();
      toast.success(res.message || "Manual healing check dispatched.");
      if (projectId) store.fetchReliability(projectId);
    } catch {
      toast.error("Failed to run healing diagnostics");
    }
  };

  const health = store.systemHealth || {
    status: "healthy",
    health_score: 100,
    availability_rate: 100.0,
    recovery_success_rate: 100.0,
    mttr_seconds: 0.0,
    congestions: []
  };

  const recColumns = [
    {
      key: "id",
      header: "Recovery ID",
      render: (row: any) => (
        <span className="font-mono text-zinc-500 font-semibold">{row.id.slice(0, 8)}...</span>
      )
    },
    {
      key: "type",
      header: "Type",
      render: (row: any) => (
        <span className="font-mono font-bold text-zinc-300">{row.type.toUpperCase()}</span>
      )
    },
    {
      key: "success",
      header: "Status",
      render: (row: any) => (
        <Badge variant={row.success ? "success" : "danger"}>
          {row.success ? "Recovered" : "Failed"}
        </Badge>
      )
    },
    {
      key: "duration_ms",
      header: "Duration",
      render: (row: any) => (
        <span className="font-mono text-zinc-400">{row.duration_ms}ms</span>
      )
    },
    {
      key: "timestamp",
      header: "Recovered At",
      render: (row: any) => (
        <span className="font-mono text-[10px] text-zinc-500">{new Date(row.timestamp).toLocaleString()}</span>
      )
    }
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-50 bg-gradient-to-r from-zinc-50 to-zinc-400 bg-clip-text text-transparent">
            Reliability & Self-Healing Console
          </h2>
          <p className="text-zinc-500 text-sm mt-1">
            Automated cluster monitors, orphan thread recyclers, and live MTTR recovery logs.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleManualHeal}
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-primary/20"
          >
            <Wrench className="w-3.5 h-3.5" /> Force Diagnostics
          </button>
          <button
            onClick={() => projectId && store.fetchReliability(projectId)}
            className="p-2 bg-zinc-900 border border-border rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Overall Platform Health */}
        <div className="p-6 rounded-2xl glass-panel border border-border flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">Platform Health</span>
            <Heart className={`w-5 h-5 ${health.status === 'healthy' ? 'text-emerald-500 animate-pulse' : 'text-amber-500'}`} />
          </div>
          <div className="my-4">
            <span className="text-5xl font-black font-mono text-zinc-100">{health.health_score}%</span>
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`w-2 h-2 rounded-full ${health.status === 'healthy' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">{health.status.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Worker Availability */}
        <div className="p-6 rounded-2xl glass-panel border border-border flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">Availability</span>
            <Activity className="w-5 h-5 text-zinc-400" />
          </div>
          <div className="my-4">
            <span className="text-5xl font-black font-mono text-zinc-100">{health.availability_rate.toFixed(1)}%</span>
            <p className="text-[10px] font-mono text-zinc-500 mt-2">Node uptime SLA baseline</p>
          </div>
        </div>

        {/* MTTR */}
        <div className="p-6 rounded-2xl glass-panel border border-border flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">MTTR (Average)</span>
            <Clock className="w-5 h-5 text-zinc-400" />
          </div>
          <div className="my-4">
            <span className="text-5xl font-black font-mono text-zinc-100">{health.mttr_seconds.toFixed(2)}s</span>
            <p className="text-[10px] font-mono text-zinc-500 mt-2">Mean Time To Recovery</p>
          </div>
        </div>

        {/* Recovery Success Rate */}
        <div className="p-6 rounded-2xl glass-panel border border-border flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">Healer Efficiency</span>
            <CheckCircle2 className="w-5 h-5 text-zinc-400" />
          </div>
          <div className="my-4">
            <span className="text-5xl font-black font-mono text-zinc-100">{health.recovery_success_rate.toFixed(1)}%</span>
            <p className="text-[10px] font-mono text-zinc-500 mt-2">Self-healing transaction success</p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Recovery logs timeline */}
        <div className="xl:col-span-2">
          <Card title="Self-Healing Execution Log" subtitle="Recent auto-recovery trigger details">
            <Table columns={recColumns} data={store.recoveryEvents} />
          </Card>
        </div>

        {/* Congestion Suggestions */}
        <div className="xl:col-span-1 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1 flex items-center gap-1.5">
            <ShieldAlert className="w-4.5 h-4.5 text-zinc-400" /> Queue Congestion Warnings
          </h3>
          {health.congestions.length === 0 ? (
            <div className="p-8 text-center border border-border rounded-2xl glass-panel text-zinc-500 font-mono text-xs">
              All queue channels healthy. Worker throughput is optimized.
            </div>
          ) : (
            <div className="space-y-4">
              {health.congestions.map((c: any, idx: number) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-xl glass-panel border flex flex-col justify-between space-y-3 ${
                    c.status === "critical" ? "border-red-950/20 bg-red-950/5" : "border-amber-950/20 bg-amber-950/5"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs font-bold text-zinc-200">{c.queue_name}</span>
                    <Badge variant={c.status === "critical" ? "danger" : "warning"}>{c.status}</Badge>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-mono leading-relaxed">{c.reason}</p>
                  <div className="p-2.5 bg-zinc-950 border border-border/40 rounded-lg text-[10px] text-zinc-400 font-mono leading-relaxed flex items-start gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{c.suggestion}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
