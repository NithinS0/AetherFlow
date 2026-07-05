import { useState, useEffect } from "react";
import { useStore } from "../stores/store";
import { api } from "../services/api";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { Table } from "../components/Table";
import { 
  RefreshCw, 
  Zap, 
  ShieldAlert, 
  Skull,
  UserX,
  Database
} from "lucide-react";
import { toast } from "sonner";

export function Chaos() {
  const store = useStore();
  const [running, setRunning] = useState(false);
  const projectId = store.projects[0]?.id || "";

  useEffect(() => {
    store.fetchChaosRuns();
    const interval = setInterval(() => {
      store.fetchChaosRuns();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const runScenario = async (scenario: string) => {
    setRunning(true);
    try {
      await api.executeChaosScenario(scenario, projectId);
      toast.success(`Injected scenario '${scenario}' into SRE cluster.`);
      store.fetchChaosRuns();
    } catch {
      toast.error("Failed to inject chaos scenario");
    } finally {
      setRunning(false);
    }
  };

  const chaosColumns = [
    {
      key: "started_at",
      header: "Timestamp",
      render: (row: any) => (
        <span className="font-mono text-[10px] text-zinc-500">{new Date(row.started_at).toLocaleString()}</span>
      )
    },
    {
      key: "scenario",
      header: "Scenario",
      render: (row: any) => (
        <span className="font-mono font-bold text-red-400 uppercase tracking-wide text-[10px]">{row.scenario}</span>
      )
    },
    {
      key: "status",
      header: "State",
      render: (row: any) => (
        <Badge variant={row.status === "completed" ? "success" : "info"}>{row.status}</Badge>
      )
    },
    {
      key: "affected_workers_count",
      header: "Workers Affected",
      render: (row: any) => (
        <span className="font-mono text-zinc-300 font-bold">{row.affected_workers_count}</span>
      )
    },
    {
      key: "affected_jobs_count",
      header: "Jobs Affected",
      render: (row: any) => (
        <span className="font-mono text-zinc-300 font-bold">{row.affected_jobs_count}</span>
      )
    },
    {
      key: "recovery_duration_ms",
      header: "MTTR Delta",
      render: (row: any) => (
        <span className="font-mono text-zinc-400 font-bold">{row.recovery_duration_ms ? `${row.recovery_duration_ms}ms` : "-"}</span>
      )
    }
  ];

  const scenarios = [
    {
      id: "kill_worker",
      name: "Kill Worker Node",
      description: "Instantly terminates one active worker process to trigger heartbeat loss and verify immediate self-healing.",
      icon: UserX,
      color: "text-red-500 border-red-950/20"
    },
    {
      id: "pause_worker",
      name: "Pause Worker (Maint)",
      description: "Sets one online worker node into maintenance status to test graceful draining and queue reallocation.",
      icon: Skull,
      color: "text-amber-500 border-amber-950/20"
    },
    {
      id: "queue_flood",
      name: "Queue Flood (100 Jobs)",
      description: "Floods the pipeline with 100 immediate tasks to test queue congestion alerts and worker throughput bottlenecks.",
      icon: Database,
      color: "text-blue-500 border-blue-950/20"
    },
    {
      id: "fail_execution",
      name: "Force Execution Failure",
      description: "Injects runtime exception flags inside job payloads to force tasks to fail and trigger retry policies.",
      icon: ShieldAlert,
      color: "text-rose-500 border-rose-950/20"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-50 bg-gradient-to-r from-zinc-50 to-zinc-400 bg-clip-text text-transparent">
            Chaos Engineering Console
          </h2>
          <p className="text-zinc-500 text-sm mt-1">
            Simulate network partitions, node crashes, and thread bottlenecks to prove AetherFlow SLA resilience.
          </p>
        </div>
        <button
          onClick={() => store.fetchChaosRuns()}
          className="p-2 bg-zinc-900 border border-border rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Grid of Available Simulations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {scenarios.map((s) => {
          const Icon = s.icon;
          return (
            <div 
              key={s.id} 
              className={`p-6 rounded-2xl glass-panel border flex flex-col justify-between space-y-6 transition-all duration-300 hover:border-red-500/20 ${s.color}`}
            >
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-zinc-900 border border-border/80 rounded-xl">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-200 text-sm tracking-wide font-mono">{s.name}</h4>
                  <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">{s.description}</p>
                </div>
              </div>
              <button
                disabled={running}
                onClick={() => runScenario(s.id)}
                className="w-full py-2 bg-zinc-950 hover:bg-red-950/10 border border-border hover:border-red-950/40 text-zinc-400 hover:text-red-400 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5" /> Inject Failure
              </button>
            </div>
          );
        })}
      </div>

      {/* Chaos Run Reports */}
      <Card title="Chaos History Log" subtitle="Audit records of injected crashes and recovery metrics">
        <Table columns={chaosColumns} data={store.chaosRuns} />
      </Card>

    </div>
  );
}
