import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  colorClass?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  colorClass = "text-primary",
  trend,
}: StatCardProps) {
  return (
    <div className="p-6 rounded-2xl glass-panel glass-panel-hover flex items-center justify-between border shadow-royal-glow">
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">
          {title}
        </span>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-extrabold text-zinc-100 font-mono tracking-tight">
            {value}
          </h3>
          {trend && (
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
              trend.isPositive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
            }`}>
              {trend.value}
            </span>
          )}
        </div>
        {description && (
          <span className="text-[10px] text-zinc-500 mt-1 block">
            {description}
          </span>
        )}
      </div>
      {Icon && (
        <div className={`p-3 bg-zinc-900/60 border border-white/5 rounded-xl shrink-0 ${colorClass}`}>
          <Icon className="w-5.5 h-5.5" />
        </div>
      )}
    </div>
  );
}
