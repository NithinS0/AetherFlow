import { Link } from "react-router-dom";
import { PublicLayout } from "../../layouts/PublicLayout";
import { CheckCircle2, ArrowRight } from "lucide-react";

const services = [
  { name: "API Gateway", uptime: "99.999%", latency: "0.8ms", status: "Operational" },
  { name: "Job Scheduler", uptime: "99.998%", latency: "1.1ms", status: "Operational" },
  { name: "Worker Engine", uptime: "99.997%", latency: "N/A", status: "Operational" },
  { name: "Queue Router", uptime: "100%", latency: "0.3ms", status: "Operational" },
  { name: "PostgreSQL Database", uptime: "99.999%", latency: "2.1ms", status: "Operational" },
  { name: "Realtime WebSocket", uptime: "99.995%", latency: "4.2ms", status: "Operational" },
  { name: "AI Operations (OpsGPT)", uptime: "99.990%", latency: "120ms", status: "Operational" },
  { name: "Supabase Storage", uptime: "99.999%", latency: "12ms", status: "Operational" },
  { name: "Notification Service", uptime: "99.996%", latency: "3.5ms", status: "Operational" },
];

const incidents = [
  { date: "2026-06-28", title: "Resolved — Elevated API latency", duration: "12 min", severity: "Minor" },
  { date: "2026-06-15", title: "Resolved — Scheduled maintenance window", duration: "30 min", severity: "Maintenance" },
  { date: "2026-05-30", title: "Resolved — Worker pool rebalancing", duration: "8 min", severity: "Minor" },
];

export function StatusPage() {
  return (
    <PublicLayout breadcrumbs={[{ label: "Resources" }, { label: "System Status" }]}>
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-400/20 bg-emerald-400/5 text-[11px] font-bold uppercase tracking-widest text-emerald-300 mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> All Systems Operational
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
          AetherFlow<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">System Status</span>
        </h1>
        <p className="text-[15px] text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Real-time status of all AetherFlow Enterprise platform services. Last checked: just now.
        </p>
      </section>

      {/* Overall status */}
      <section className="max-w-4xl mx-auto px-6 mb-10">
        <div className="glass-panel border border-emerald-400/20 rounded-2xl p-5 flex items-center gap-4 bg-emerald-400/5">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
          <div>
            <div className="text-[15px] font-extrabold text-white">All Systems Fully Operational</div>
            <div className="text-[12px] text-zinc-400 font-mono mt-0.5">Last updated: 2026-07-05 — 08:42 UTC</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-[13px] font-bold text-emerald-400">99.998%</div>
            <div className="text-[11px] text-zinc-500">90-day uptime</div>
          </div>
        </div>
      </section>

      {/* Uptime bar */}
      <section className="max-w-4xl mx-auto px-6 mb-12">
        <div className="flex items-end gap-0.5 h-10">
          {Array.from({ length: 90 }, (_, i) => (
            <div key={i} className={`flex-1 rounded-sm ${i === 14 || i === 29 ? "bg-amber-400/60 h-6" : "bg-emerald-400/70 h-10"}`} />
          ))}
        </div>
        <div className="flex justify-between text-[11px] text-zinc-600 font-mono mt-2">
          <span>90 days ago</span><span>Today</span>
        </div>
      </section>

      {/* Services */}
      <section className="max-w-4xl mx-auto px-6 mb-16">
        <h2 className="text-xl font-extrabold text-white mb-4">Service Status</h2>
        <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden">
          {services.map((s, i) => (
            <div key={i} className={`flex items-center justify-between px-6 py-4 ${i < services.length - 1 ? "border-b border-white/5" : ""}`}>
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span className="text-[14px] font-semibold text-zinc-200">{s.name}</span>
              </div>
              <div className="hidden md:flex items-center gap-8 text-[12px]">
                <div className="text-right">
                  <div className="text-zinc-500">Uptime</div>
                  <div className="font-mono text-emerald-400 font-bold">{s.uptime}</div>
                </div>
                <div className="text-right">
                  <div className="text-zinc-500">Avg Latency</div>
                  <div className="font-mono text-zinc-300 font-bold">{s.latency}</div>
                </div>
              </div>
              <span className="text-[12px] font-bold text-emerald-400 border border-emerald-400/20 rounded-full px-3 py-1">{s.status}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Incident history */}
      <section className="max-w-4xl mx-auto px-6 mb-16">
        <h2 className="text-xl font-extrabold text-white mb-4">Recent Incidents</h2>
        <div className="space-y-3">
          {incidents.map((inc, i) => (
            <div key={i} className="glass-panel border border-white/10 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-[13px] font-semibold text-zinc-200">{inc.title}</div>
                  <div className="text-[11px] text-zinc-500 font-mono mt-0.5">{inc.date} · Duration: {inc.duration}</div>
                </div>
              </div>
              <span className={`text-[11px] font-bold border rounded-full px-2.5 py-0.5 ${inc.severity === "Maintenance" ? "text-blue-400 border-blue-400/20" : "text-amber-400 border-amber-400/20"}`}>
                {inc.severity}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 mb-20 text-center">
        <div className="glass-panel border border-primary/20 rounded-2xl p-10">
          <h2 className="text-2xl font-extrabold text-white mb-3">Subscribe to status updates</h2>
          <p className="text-[14px] text-zinc-400 mb-6">Get notified immediately when any service changes status via email or webhook.</p>
          <Link to="/login" className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-royal-glow">
            Configure Notifications <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
