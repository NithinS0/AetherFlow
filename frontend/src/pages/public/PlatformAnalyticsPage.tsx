import { Link } from "react-router-dom";
import { PublicLayout } from "../../layouts/PublicLayout";
import { BarChart2, TrendingUp, AlertTriangle, RefreshCw, Cpu, Activity, ArrowRight } from "lucide-react";

const metrics = [
  { label: "Jobs Processed", value: "10M+", sub: "Daily executions", color: "text-indigo-400" },
  { label: "Success Rate", value: "99.97%", sub: "Across all queues", color: "text-emerald-400" },
  { label: "Avg Latency", value: "< 1.2ms", sub: "Claim-to-execute", color: "text-cyan-400" },
  { label: "Worker Uptime", value: "99.999%", sub: "SLA commitment", color: "text-violet-400" },
];

const features = [
  { icon: <TrendingUp className="w-5 h-5 text-indigo-400" />, title: "Throughput Metrics", desc: "Track jobs-per-second across all queues with 1-minute resolution. Identify peak load periods and provision workers proactively." },
  { icon: <Activity className="w-5 h-5 text-emerald-400" />, title: "Success & Failure Rates", desc: "Per-queue success, failure, and retry rates displayed in real-time. Alert thresholds trigger PagerDuty and webhook integrations automatically." },
  { icon: <RefreshCw className="w-5 h-5 text-amber-400" />, title: "Retry Trend Analysis", desc: "Visualize retry patterns to identify consistently failing job types. Drill down to individual job payloads to diagnose root causes without leaving the dashboard." },
  { icon: <BarChart2 className="w-5 h-5 text-cyan-400" />, title: "Queue Depth Monitoring", desc: "Live queue depth charts reveal backlog accumulation before it becomes critical. Automatic alerting when depth exceeds configurable thresholds." },
  { icon: <Cpu className="w-5 h-5 text-rose-400" />, title: "Worker Utilization", desc: "Per-worker CPU, memory, and concurrency slot utilization. Identify over-loaded and under-utilized nodes for optimal resource allocation." },
  { icon: <AlertTriangle className="w-5 h-5 text-violet-400" />, title: "Anomaly Detection", desc: "AI-powered baseline modeling detects abnormal execution patterns and notifies operators of potential infrastructure issues before they cause service degradation." },
];

export function PlatformAnalyticsPage() {
  return (
    <PublicLayout breadcrumbs={[{ label: "Platform", href: "/platform/analytics" }, { label: "Analytics & Monitoring" }]}>
      <section className="w-full mx-auto px-8 md:px-16 xl:px-24 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-400/20 bg-emerald-400/5 text-[11px] font-bold uppercase tracking-widest text-emerald-300 mb-6">
          <BarChart2 className="w-3.5 h-3.5" /> Analytics & Monitoring
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-5 leading-tight">
          Complete Observability<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">for Every Job</span>
        </h1>
        <p className="text-[16px] text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10">
          Real-time throughput charts, AI-powered anomaly detection, worker utilization heatmaps, and deep job-level drill-down give your team complete visibility into every execution.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/login" className="px-7 py-3 bg-primary text-white font-bold rounded-xl flex items-center gap-2 shadow-royal-glow">
            Open Analytics Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/docs" className="px-7 py-3 border border-white/10 text-zinc-300 font-bold rounded-xl hover:bg-white/5 transition-colors">
            Metrics Documentation
          </Link>
        </div>
      </section>

      {/* Metrics */}
      <section className="w-full mx-auto px-8 md:px-16 xl:px-24 mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((m, i) => (
            <div key={i} className="glass-panel border border-white/10 rounded-2xl p-6 text-center">
              <div className={`text-3xl font-black font-mono ${m.color} mb-1`}>{m.value}</div>
              <div className="text-[13px] font-bold text-white">{m.label}</div>
              <div className="text-[11px] text-zinc-500 mt-1">{m.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Sample chart visualization */}
      <section className="w-full mx-auto px-8 md:px-16 xl:px-24 mb-20">
        <div className="glass-panel border border-white/10 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[14px] font-bold text-white">Job Throughput — Last 24 Hours</h3>
            <span className="text-[11px] text-emerald-400 font-mono font-bold border border-emerald-400/20 rounded-full px-3 py-1">● LIVE</span>
          </div>
          <div className="flex items-end gap-1 h-32">
            {[40,55,45,70,85,60,90,75,88,95,80,92,70,85,78,95,88,100,92,85,78,88,94,90].map((h, i) => (
              <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-primary/60 to-primary/20 transition-all" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-zinc-600 font-mono">
            <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>Now</span>
          </div>
        </div>
      </section>

      <section className="w-full mx-auto px-8 md:px-16 xl:px-24 mb-20">
        <h2 className="text-2xl font-extrabold text-white mb-2 text-center">Analytics Capabilities</h2>
        <p className="text-[14px] text-zinc-500 text-center mb-10">Everything your SRE team needs to maintain operational excellence.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div key={i} className="glass-panel border border-white/5 rounded-2xl p-6 hover:border-primary/20 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4">{f.icon}</div>
              <h3 className="text-[15px] font-bold text-white mb-2">{f.title}</h3>
              <p className="text-[13px] text-zinc-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full max-w-7xl mx-auto px-8 md:px-16 xl:px-24 mb-20 text-center">
        <div className="glass-panel border border-primary/20 rounded-2xl p-10">
          <h2 className="text-2xl font-extrabold text-white mb-3">Instrument your distributed system.</h2>
          <p className="text-[14px] text-zinc-400 mb-6">Connect AetherFlow Analytics to your existing Grafana, Datadog, or PagerDuty workflows via webhooks and OpenMetrics export.</p>
          <Link to="/login" className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-royal-glow">
            Access Analytics <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
