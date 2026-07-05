import { Link } from "react-router-dom";
import { PublicLayout } from "../../layouts/PublicLayout";
import { Sparkles, ArrowRight, CheckCircle2, Zap, Shield, Bot, BarChart2, Cpu } from "lucide-react";

const v1features = [
  { icon: <Zap className="w-4 h-4 text-indigo-400" />, title: "Distributed Scheduler Engine", items: ["PostgreSQL SKIP LOCKED atomic job claiming", "Multi-priority queue routing", "Cron, delayed, recurring, batch, and dependency jobs", "Timezone-aware scheduling with DST handling", "Sub-second scheduling precision"] },
  { icon: <Cpu className="w-4 h-4 text-rose-400" />, title: "Worker Orchestration Engine", items: ["Stateless horizontal worker scaling", "Configurable heartbeat monitoring", "Graceful shutdown with job drain", "Automatic crash recovery and job reassignment", "Per-worker concurrency slot management"] },
  { icon: <BarChart2 className="w-4 h-4 text-cyan-400" />, title: "Operations Center", items: ["Real-time WebSocket streaming dashboard", "Queue depth, throughput, and failure charts", "Worker utilization heatmaps", "Dead Letter Queue management", "Command Center with live node topology"] },
  { icon: <Bot className="w-4 h-4 text-violet-400" />, title: "AI Intelligence Layer", items: ["OpsGPT natural language queue diagnostics", "LangGraph-powered incident triage", "AI-generated queue optimization recommendations", "Automated failure pattern analysis", "AI report generation for stakeholders"] },
  { icon: <BarChart2 className="w-4 h-4 text-emerald-400" />, title: "Analytics & Observability", items: ["Jobs-per-second throughput metrics", "Success, failure, and retry rate dashboards", "Queue depth trend analysis", "Worker performance benchmarking", "OpenMetrics export for Grafana/Datadog"] },
  { icon: <Shield className="w-4 h-4 text-amber-400" />, title: "Security & Compliance", items: ["JWT authentication with refresh tokens", "Role-based access control (RBAC)", "Full audit log of all platform actions", "API key management with scope restrictions", "Row-level security on all database tables"] },
];

export function ReleasesPage() {
  return (
    <PublicLayout breadcrumbs={[{ label: "Resources" }, { label: "Release Notes" }]}>
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-400/20 bg-violet-400/5 text-[11px] font-bold uppercase tracking-widest text-violet-300 mb-6">
          <Sparkles className="w-3.5 h-3.5" /> Release Notes
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-5">
          AetherFlow Enterprise<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Changelog</span>
        </h1>
        <p className="text-[15px] text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Version history, improvements, and new features for AetherFlow Enterprise. Built for reliability engineers and distributed systems teams.
        </p>
      </section>

      {/* v1.0.0 */}
      <section className="max-w-4xl mx-auto px-6 mb-16">
        <div className="flex items-center gap-4 mb-6">
          <div className="glass-panel border border-primary/30 rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[14px] font-extrabold text-white font-mono">v1.0.0</span>
            <span className="text-[11px] text-zinc-500 ml-1">Latest</span>
          </div>
          <div className="text-[13px] text-zinc-500 font-mono">Released — 2026-07-01</div>
        </div>

        <div className="space-y-4">
          {v1features.map((section, i) => (
            <div key={i} className="glass-panel border border-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">{section.icon}</div>
                <h3 className="text-[15px] font-extrabold text-white">{section.title}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {section.items.map((item, j) => (
                  <div key={j} className="flex items-center gap-2 text-[13px] text-zinc-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Roadmap */}
      <section className="max-w-4xl mx-auto px-6 mb-16">
        <h2 className="text-xl font-extrabold text-white mb-4">Upcoming — v1.1.0</h2>
        <div className="glass-panel border border-white/10 rounded-2xl p-6 space-y-3">
          {[
            "Multi-region worker cluster federation",
            "gRPC worker communication protocol",
            "Advanced DAG workflow visualizer",
            "Custom plugin marketplace",
            "Slack and Teams webhook integrations",
            "GitHub Actions CI/CD job triggers",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-[14px] text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 shrink-0" /> {item}
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 mb-20 text-center">
        <div className="glass-panel border border-primary/20 rounded-2xl p-10">
          <h2 className="text-2xl font-extrabold text-white mb-3">Explore the platform today</h2>
          <p className="text-[14px] text-zinc-400 mb-6">Every feature in v1.0.0 is available now. Deploy your first queue in minutes.</p>
          <Link to="/login" className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-royal-glow">
            Enter Platform <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
