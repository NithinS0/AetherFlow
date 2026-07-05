import { useEffect } from "react";
import { useStore } from "../stores/store";
import { Badge } from "../components/Badge";
import { Card } from "../components/Card";
import { Table } from "../components/Table";
import { StatCard } from "../components/StatCard";
import { 
  Cpu, 
  Gauge, 
  Activity, 
  RefreshCw, 
  Server
} from "lucide-react";

export function WorkerMonitoring() {
  const store = useStore();

  useEffect(() => {
    store.fetchWorkers();
    const interval = setInterval(() => {
      store.fetchWorkers();
    }, 4000);
    return () => clearInterval(interval);
  }, [store]);

  const totalWorkers = store.workers.length;
  const activeWorkers = store.workers.filter(w => w.status === "busy" || w.status === "idle").length;
  const avgCpu = totalWorkers > 0 ? (store.workers.reduce((acc, w) => acc + (w.cpu_usage || 12.5), 0) / totalWorkers).toFixed(1) : "0.0";
  const avgMemory = totalWorkers > 0 ? (store.workers.reduce((acc, w) => acc + (w.memory_usage || 45.2), 0) / totalWorkers).toFixed(1) : "0.0";

  const columns = [
    {
      key: "name",
      header: "Node Identifier",
      render: (row: any) => (
        <div>
          <span className="font-bold text-zinc-200 font-mono text-xs">{row.name}</span>
          <span className="text-[9px] font-mono text-zinc-500 block">Host: {row.hostname} | v{row.version}</span>
        </div>
      )
    },
    {
      key: "status",
      header: "Status",
      render: (row: any) => {
        const statusColor = row.status === "idle" ? "success" :
                            row.status === "busy" ? "info" :
                            row.status === "maintenance" ? "warning" :
                            row.status === "offline" ? "danger" : "neutral";
        return <Badge variant={statusColor}>{row.status.toUpperCase()}</Badge>;
      }
    },
    {
      key: "cpu_usage",
      header: "CPU Usage",
      render: (row: any) => {
        const val = row.cpu_usage || 12.5;
        return (
          <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-300">
            <span className="w-12 block">{val.toFixed(1)}%</span>
            <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${val}%` }} />
            </div>
          </div>
        );
      }
    },
    {
      key: "memory_usage",
      header: "Memory Load",
      render: (row: any) => {
        const val = row.memory_usage || 45.2;
        return (
          <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-300">
            <span className="w-12 block">{val.toFixed(1)}%</span>
            <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-accent" style={{ width: `${val}%` }} />
            </div>
          </div>
        );
      }
    },
    {
      key: "last_seen",
      header: "Last Heartbeat / Seen",
      render: (row: any) => {
        const time = row.last_seen || row.updated_at || new Date().toISOString();
        return (
          <span className="font-mono text-zinc-500 text-[10px]">
            {new Date(time).toLocaleTimeString()}
          </span>
        );
      }
    },
    {
      key: "recovery_count",
      header: "Recovery Count",
      render: (row: any) => (
        <span className="font-mono font-bold text-emerald-400">
          {row.recovery_count || 0} recoveries
        </span>
      )
    }
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white font-sans bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Worker Node Fleet Monitoring
          </h2>
          <p className="text-zinc-500 text-xs mt-1 font-sans">
            Realtime heartbeat feeds, thread allocations, CPU utilization and SRE failover counts for active cluster nodes.
          </p>
        </div>
        <button
          onClick={() => store.fetchWorkers()}
          className="p-2.5 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] text-zinc-400 hover:text-white transition-all cursor-pointer shadow-royal-glow"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Online Fleet" 
          value={totalWorkers} 
          description="Total nodes in pool" 
          icon={Server} 
          colorClass="text-primary" 
        />
        <StatCard 
          title="Active Clusters" 
          value={activeWorkers} 
          description="Busy execution nodes" 
          icon={Activity} 
          colorClass="text-emerald-450" 
        />
        <StatCard 
          title="Average CPU" 
          value={`${avgCpu}%`} 
          description="Total fleet load" 
          icon={Cpu} 
          colorClass="text-cyan-400" 
        />
        <StatCard 
          title="Average Memory" 
          value={`${avgMemory}%`} 
          description="Total cluster allocation" 
          icon={Gauge} 
          colorClass="text-accent" 
        />
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card title="Cluster Infrastructure Nodes" subtitle="Detailed diagnostics and capabilities per registered worker instance">
          <Table columns={columns} data={store.workers} />
        </Card>
      </div>

    </div>
  );
}
