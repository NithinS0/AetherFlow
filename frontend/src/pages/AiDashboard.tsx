import { useEffect } from "react";
import { useStore } from "../stores/store";
import { api } from "../services/api";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { Table } from "../components/Table";
import { 
  Bot, 
  Check, 
  X, 
  ShieldAlert, 
  Activity, 
  Zap, 
  RefreshCw,
  Gauge
} from "lucide-react";
import { toast } from "sonner";

export function AiDashboard() {
  const store = useStore();
  const user = store.user;

  useEffect(() => {
    store.fetchAiRecommendations();
  }, []);

  const handleApprove = async (recId: string) => {
    if (user?.role !== "Administrator") {
      toast.error("RBAC Denied: Only Administrators can approve system optimizations.");
      return;
    }

    try {
      await api.approveRecommendation(recId);
      toast.success("Recommendation approved. Config applied successfully.");
      store.fetchAiRecommendations();
    } catch {
      toast.error("Failed to approve recommendation");
    }
  };

  const handleReject = async (recId: string) => {
    if (user?.role !== "Administrator") {
      toast.error("RBAC Denied: Only Administrators can reject system optimizations.");
      return;
    }

    try {
      await api.rejectRecommendation(recId);
      toast.success("Recommendation rejected.");
      store.fetchAiRecommendations();
    } catch {
      toast.error("Failed to reject recommendation");
    }
  };

  const pendingRecs = store.aiRecommendations.filter((r) => r.status === "pending");
  const historyRecs = store.aiRecommendations.filter((r) => r.status !== "pending");

  const recColumns = [
    {
      key: "title",
      header: "Optimization Recommendation",
      render: (row: any) => (
        <div>
          <span className="font-bold text-zinc-200 text-xs font-mono">{row.title}</span>
          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{row.description}</p>
        </div>
      )
    },
    {
      key: "priority",
      header: "Severity",
      render: (row: any) => {
        const priorityColor = row.priority === "critical" ? "danger" :
                              row.priority === "high" ? "warning" : "info";
        return <Badge variant={priorityColor}>{row.priority.toUpperCase()}</Badge>;
      }
    },
    {
      key: "status",
      header: "Status",
      render: (row: any) => {
        const statusColor = row.status === "approved" ? "success" : "danger";
        return <Badge variant={statusColor}>{row.status.toUpperCase()}</Badge>;
      }
    }
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-50 bg-gradient-to-r from-zinc-50 to-zinc-400 bg-clip-text text-transparent">
            AI Operations Intelligence
          </h2>
          <p className="text-zinc-500 text-sm mt-1">
            Proactive SRE suggestions, collaborative LangGraph monitoring, and admin approval workflows.
          </p>
        </div>
        <button
          onClick={() => store.fetchAiRecommendations()}
          className="p-2 bg-zinc-900 border border-border rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Agents Health Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-5 rounded-2xl glass-panel border border-border flex items-center gap-4">
          <div className="p-3 bg-zinc-900 border border-border/80 text-emerald-400 rounded-xl">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Monitoring Agent</span>
            <span className="font-bold text-xs text-zinc-200 font-mono">STATUS: ONLINE</span>
          </div>
        </div>
        <div className="p-5 rounded-2xl glass-panel border border-border flex items-center gap-4">
          <div className="p-3 bg-zinc-900 border border-border/80 text-emerald-400 rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Failure Analyst</span>
            <span className="font-bold text-xs text-zinc-200 font-mono">STATUS: ONLINE</span>
          </div>
        </div>
        <div className="p-5 rounded-2xl glass-panel border border-border flex items-center gap-4">
          <div className="p-3 bg-zinc-900 border border-border/80 text-emerald-400 rounded-xl">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Optimization Agent</span>
            <span className="font-bold text-xs text-zinc-200 font-mono">STATUS: ONLINE</span>
          </div>
        </div>
        <div className="p-5 rounded-2xl glass-panel border border-border flex items-center gap-4">
          <div className="p-3 bg-zinc-900 border border-border/80 text-emerald-400 rounded-xl">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Documentation Agent</span>
            <span className="font-bold text-xs text-zinc-200 font-mono">STATUS: ONLINE</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Pending recommendations */}
        <div className="xl:col-span-2 space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1 flex items-center gap-1.5">
            <ShieldAlert className="w-4.5 h-4.5 text-amber-500 animate-pulse" /> SRE Optimization Approval Queue
          </h3>
          {pendingRecs.length === 0 ? (
            <div className="p-12 text-center border border-border rounded-2xl glass-panel text-zinc-500 font-mono text-xs">
              No pending recommendations. Node cluster operations fully optimized.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRecs.map((r) => {
                const isCritical = r.priority === "critical" || r.priority === "high";
                return (
                  <div 
                    key={r.id}
                    className={`p-6 rounded-2xl glass-panel border flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300 ${
                      isCritical ? "border-amber-950/20 bg-amber-950/5" : "border-border"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-200 text-xs font-mono">{r.title}</span>
                        <Badge variant={isCritical ? "warning" : "info"}>{r.priority.toUpperCase()}</Badge>
                      </div>
                      <p className="text-[11px] text-zinc-400 font-mono leading-relaxed mt-2">{r.description}</p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleApprove(r.id)}
                        className="p-2 bg-emerald-950/10 border border-emerald-900/40 text-emerald-400 hover:text-white hover:bg-emerald-900 rounded-xl transition-all cursor-pointer"
                        title="Approve Recommendation"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReject(r.id)}
                        className="p-2 bg-zinc-900 border border-border hover:border-red-950 hover:text-red-400 rounded-xl transition-all cursor-pointer"
                        title="Reject Recommendation"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* History logs */}
        <div className="xl:col-span-1">
          <Card title="Optimization Review History" subtitle="Audit log of approved SRE modifications">
            <Table columns={recColumns} data={historyRecs} />
          </Card>
        </div>

      </div>

    </div>
  );
}
