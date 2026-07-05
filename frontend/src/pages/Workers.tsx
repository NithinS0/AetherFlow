import { useEffect } from "react";
import { useStore } from "../stores/store";
import { api } from "../services/api";
import { Badge } from "../components/Badge";
import { 
  Cpu, 
  Flame, 
  AlertTriangle, 
  RefreshCw,
  Gauge
} from "lucide-react";
import { toast } from "sonner";

export function Workers() {
  const store = useStore();

  useEffect(() => {
    store.fetchWorkers();
    // Auto-refresh stats every 4 seconds
    const interval = setInterval(() => {
      store.fetchWorkers();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleDrain = async (workerId: string) => {
    try {
      await api.drainWorker(workerId);
      toast.success("Drain command dispatched to worker node.");
      store.fetchWorkers();
    } catch {
      toast.error("Failed to dispatch drain command");
    }
  };

  const handleToggleMaintenance = async (workerId: string, currentStatus: string) => {
    const isMaint = currentStatus === "maintenance";
    try {
      await api.toggleWorkerMaintenance(workerId, !isMaint);
      toast.success(`Worker state set to ${!isMaint ? "maintenance" : "idle"}`);
      store.fetchWorkers();
    } catch {
      toast.error("Failed to toggle maintenance mode");
    }
  };

  const handleRestart = async (workerId: string) => {
    try {
      await api.restartWorker(workerId);
      toast.success("Worker restart triggered successfully");
      store.fetchWorkers();
    } catch {
      toast.error("Failed to restart worker node");
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-50 bg-gradient-to-r from-zinc-50 to-zinc-400 bg-clip-text text-transparent">
            Distributed Worker Nodes
          </h2>
          <p className="text-zinc-500 text-sm mt-1">
            Monitor registered nodes, track CPU/memory health metrics, and trigger SRE cluster commands.
          </p>
        </div>
        <button
          onClick={() => store.fetchWorkers()}
          className="p-2 bg-zinc-900 border border-border rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Grid of worker cards */}
      {store.workers.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl glass-panel text-zinc-500 font-medium font-mono text-xs">
          No registered workers online. Start the local worker daemon via CLI:
          <pre className="mt-4 p-3 bg-zinc-950 border border-border rounded-lg text-zinc-400 text-[10px] text-left overflow-x-auto">
            python backend/app/workers/run_worker.py
          </pre>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {store.workers.map((w) => {
            const statusColor = w.status === "idle" ? "success" :
                                w.status === "busy" ? "info" :
                                w.status === "maintenance" ? "warning" :
                                w.status === "offline" ? "danger" : "neutral";
            return (
              <div 
                key={w.id}
                className={`p-6 rounded-2xl glass-panel border shadow-lg flex flex-col justify-between space-y-6 transition-all duration-300 relative overflow-hidden ${
                  w.status === "offline" ? "border-red-950/20 opacity-60" : "border-border hover:border-primary/20"
                }`}
              >
                {/* Header */}
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-zinc-200 text-sm tracking-wide font-mono">{w.name}</h4>
                      <span className="text-[9px] font-mono text-zinc-500 mt-1 block">Host: {w.hostname} | v{w.version}</span>
                    </div>
                    <Badge variant={statusColor}>{w.status}</Badge>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/40 text-[10px] font-mono text-zinc-500">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-zinc-400" />
                    <div>
                      <span>CPU Load</span>
                      <span className="text-zinc-200 font-bold block">12.5%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-zinc-400" />
                    <div>
                      <span>Memory</span>
                      <span className="text-zinc-200 font-bold block">45.2%</span>
                    </div>
                  </div>
                </div>

                {/* Details / Queues */}
                <div className="space-y-1 text-[10px] font-mono">
                  <span className="text-zinc-500">Supported Capabilities:</span>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {w.capabilities && w.capabilities.map((c: string, idx: number) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded bg-zinc-900 border border-border text-zinc-400 uppercase text-[8px] font-bold">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleToggleMaintenance(w.id, w.status)}
                    className="flex-1 py-2 bg-zinc-900 border border-border text-zinc-400 hover:text-zinc-200 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" /> Maint
                  </button>
                  <button
                    onClick={() => handleDrain(w.id)}
                    className="p-2 bg-zinc-900 border border-border text-zinc-500 hover:text-amber-400 hover:border-amber-950 rounded-lg transition-colors cursor-pointer"
                    title="Drain worker tasks"
                  >
                    <Flame className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRestart(w.id)}
                    className="p-2 bg-zinc-900 border border-border text-zinc-500 hover:text-primary hover:border-primary-dark rounded-lg transition-colors cursor-pointer"
                    title="Restart Node"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
