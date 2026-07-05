import { CheckCircle2, AlertCircle, Clock, Activity, XCircle } from "lucide-react";

type StatusType = "healthy" | "busy" | "offline" | "failed" | "running" | "queued" | "completed" | "critical";

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const configs = {
    healthy: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/10", icon: <CheckCircle2 size={12} /> },
    completed: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/10", icon: <CheckCircle2 size={12} /> },
    busy: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/10", icon: <Activity size={12} /> },
    running: { color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/10", icon: <Activity size={12} className="animate-spin-slow" /> },
    offline: { color: "text-zinc-400", bg: "bg-zinc-800/30", border: "border-zinc-700/20", icon: <Clock size={12} /> },
    queued: { color: "text-zinc-400", bg: "bg-zinc-800/30", border: "border-zinc-700/20", icon: <Clock size={12} /> },
    failed: { color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/10", icon: <XCircle size={12} /> },
    critical: { color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/10", icon: <AlertCircle size={12} className="animate-pulse" /> },
  };

  const config = configs[status as keyof typeof configs] || configs.offline;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border font-mono tracking-wider uppercase ${config.bg} ${config.color} ${config.border}`}>
      {config.icon}
      <span>{label || status}</span>
    </span>
  );
}
