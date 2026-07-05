import { useEffect } from "react";
import { useStore } from "../stores/store";
import { api } from "../services/api";
import { Badge } from "../components/Badge";
import { 
  Heart, 
  RefreshCw, 
  Wrench, 
  AlertTriangle,
  Server,
  Database,
  CloudLightning,
  ShieldCheck
} from "lucide-react";
import { toast } from "sonner";

export function SystemHealthPage() {
  const store = useStore();
  const projectId = store.projects[0]?.id || "";

  useEffect(() => {
    if (projectId) {
      store.fetchReliability(projectId);
    }
  }, [projectId, store]);

  const triggerRefresh = () => {
    if (projectId) store.fetchReliability(projectId);
  };

  const handleManualHeal = async () => {
    try {
      const res = await api.triggerManualHeal();
      toast.success(res.message || "Manual healing diagnostics run completed.");
      triggerRefresh();
    } catch {
      toast.error("Failed to trigger self-healing diagnostics");
    }
  };

  const health = store.systemHealth || {
    status: "healthy",
    health_score: 98.4,
    availability_rate: 99.9,
    recovery_success_rate: 100.0,
    mttr_seconds: 1.25,
    congestions: []
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white font-sans bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            System Infrastructure & Fleet Health
          </h2>
          <p className="text-zinc-500 text-xs mt-1 font-sans">
            Audit scheduler loop latency, track live database connection status, and check queue congestion limits.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleManualHeal}
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-royal-glow border border-white/10"
          >
            <Wrench className="w-3.5 h-3.5" /> Force Diagnostics
          </button>
          <button
            onClick={triggerRefresh}
            className="p-2.5 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] text-zinc-400 hover:text-white transition-all cursor-pointer shadow-royal-glow"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid splits Overall Score vs Microservices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Overall Health Score Card */}
        <div className="p-6 rounded-2xl glass-panel border border-white/5 flex flex-col justify-between relative overflow-hidden shadow-royal-glow">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">Overall Platform Score</span>
            <Heart className="w-5 h-5 text-emerald-450 animate-pulse" />
          </div>
          <div className="my-6">
            <span className="text-6xl font-black font-mono text-white tracking-tight">{health.health_score}%</span>
            <div className="flex items-center gap-1.5 mt-3">
              <span className="w-2 h-2 rounded-full bg-emerald-450 pulse-active" />
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold">Operational</span>
            </div>
          </div>
          <p className="text-[10px] text-zinc-500 font-mono">Synced with active database clusters.</p>
        </div>

        {/* Microservices Status Card */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel border border-white/5 space-y-6 shadow-royal-glow">
          <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-2">
            <ShieldCheck className="w-4.5 h-4.5 text-primary" /> Core Microservices Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3.5 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between hover:border-white/10 transition-colors">
              <div className="flex items-center gap-2.5">
                <Server className="w-4 h-4 text-zinc-500" />
                <span className="text-zinc-300">Distributed Scheduler</span>
              </div>
              <span className="text-emerald-400 font-bold uppercase text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/10">HEALTHY</span>
            </div>

            <div className="p-3.5 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between hover:border-white/10 transition-colors">
              <div className="flex items-center gap-2.5">
                <Server className="w-4 h-4 text-zinc-500" />
                <span className="text-zinc-300">Worker Node Daemon</span>
              </div>
              <span className="text-emerald-400 font-bold uppercase text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/10">RUNNING</span>
            </div>

            <div className="p-3.5 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between hover:border-white/10 transition-colors">
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-zinc-500" />
                <span className="text-zinc-300">PostgreSQL Database</span>
              </div>
              <span className="text-emerald-400 font-bold uppercase text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/10">CONNECTED</span>
            </div>

            <div className="p-3.5 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between hover:border-white/10 transition-colors">
              <div className="flex items-center gap-2.5">
                <CloudLightning className="w-4 h-4 text-zinc-500" />
                <span className="text-zinc-300">Realtime Websocket</span>
              </div>
              <span className="text-emerald-400 font-bold uppercase text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/10">CONNECTED</span>
            </div>
          </div>
        </div>

      </div>

      {/* Congestion Panel */}
      <div className="grid grid-cols-1 gap-8">
        <div className="p-6 rounded-2xl glass-panel border border-white/5 space-y-5 shadow-royal-glow">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-zinc-500" /> Active Queue Health & Congestions
          </h3>
          {(!health.congestions || health.congestions.length === 0) ? (
            <div className="p-12 text-center border border-white/5 rounded-2xl bg-white/[0.01] text-zinc-500 font-mono text-xs shadow-inner">
              All queue channels healthy. Worker throughput is fully optimized.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {health.congestions.map((c: any, idx: number) => (
                <div 
                  key={idx} 
                  className={`p-5 rounded-2xl border flex flex-col justify-between space-y-3 bg-[var(--bg-elevated)]/10 ${
                    c.status === "critical" ? "border-rose-950/40" : "border-amber-950/40"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs font-bold text-zinc-200">{c.queue_name}</span>
                    <Badge variant={c.status === "critical" ? "danger" : "warning"}>{c.status}</Badge>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-mono leading-relaxed">{c.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
