import { Link } from "react-router-dom";
import { PublicLayout } from "../../layouts/PublicLayout";
import { CloudLightning, Layers, RefreshCw, PauseCircle, Activity, ShieldCheck, Zap, ArrowRight, CheckCircle2, Server } from "lucide-react";

const features = [
  { icon: <Layers className="w-5 h-5 text-indigo-400" />, title: "Queue Priorities", desc: "Define critical, high, normal, and low priority lanes. Critical queues receive dedicated worker threads ensuring time-sensitive jobs are never starved by bulk workloads." },
  { icon: <Zap className="w-5 h-5 text-cyan-400" />, title: "Concurrency Limits", desc: "Set per-queue maximum concurrency to protect downstream dependencies. Workers respect global and per-queue limits using PostgreSQL advisory locks for zero over-commitment." },
  { icon: <RefreshCw className="w-5 h-5 text-amber-400" />, title: "Retry Policies", desc: "Attach exponential backoff, linear, or fixed retry policies per queue. Configure max attempts, delay multipliers, and jitter windows to recover gracefully from transient failures." },
  { icon: <PauseCircle className="w-5 h-5 text-violet-400" />, title: "Pause & Resume", desc: "Safely pause any queue during deployments or maintenance windows. Enqueued jobs are preserved and processing resumes immediately on resume with no data loss." },
  { icon: <Activity className="w-5 h-5 text-emerald-400" />, title: "Queue Monitoring", desc: "Real-time depth, throughput, error rate, and latency metrics streamed via WebSocket to the Operations Center dashboard for instant observability." },
  { icon: <ShieldCheck className="w-5 h-5 text-rose-400" />, title: "Queue Health Scoring", desc: "Automated health scores evaluate depth trends, failure ratios, and worker availability to surface degrading queues before they cause downstream outages." },
];

const useCases = [
  "High-volume email and notification delivery pipelines",
  "Video and media transcoding workload distribution",
  "Financial transaction processing with strict ordering",
  "IoT sensor data ingestion and aggregation",
  "ML model inference request batching",
  "Multi-tenant SaaS background job isolation",
];

export function QueueManagementPage() {
  return (
    <PublicLayout breadcrumbs={[{ label: "Platform", href: "/platform/queue-management" }, { label: "Queue Management" }]}>
      {/* Hero */}
      <section className="w-full mx-auto px-8 md:px-16 xl:px-24 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-400/20 bg-cyan-400/5 text-[11px] font-bold uppercase tracking-widest text-cyan-300 mb-6">
          <CloudLightning className="w-3.5 h-3.5" /> Queue Management
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-5 leading-tight">
          Distributed Queue Infrastructure<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Built for Scale</span>
        </h1>
        <p className="text-[16px] text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10">
          AetherFlow's Queue Management layer provides atomic SKIP LOCKED job claiming, multi-priority routing, and real-time queue health metrics for mission-critical distributed pipelines.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/login" className="px-7 py-3 bg-primary text-white font-bold rounded-xl flex items-center gap-2 shadow-royal-glow">
            Start Managing Queues <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/docs" className="px-7 py-3 border border-white/10 text-zinc-300 font-bold rounded-xl hover:bg-white/5 transition-colors">
            Read Documentation
          </Link>
        </div>
      </section>

      {/* Architecture */}
      <section className="w-full mx-auto px-8 md:px-16 xl:px-24 mb-20">
        <div className="glass-panel border border-white/10 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
          {["Job Producer", "Queue Router", "Worker Pool", "Result Store"].map((node, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Server className="w-6 h-6 text-primary" />
              </div>
              <span className="text-[12px] font-bold text-white text-center">{node}</span>
              {i < 3 && <span className="hidden md:block absolute text-zinc-600 text-xl translate-x-28">→</span>}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="w-full mx-auto px-8 md:px-16 xl:px-24 mb-20">
        <h2 className="text-2xl font-extrabold text-white mb-2 text-center">Core Queue Capabilities</h2>
        <p className="text-[14px] text-zinc-500 text-center mb-10">Everything you need to build resilient, high-throughput job processing pipelines.</p>
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

      {/* Use Cases */}
      <section className="w-full mx-auto px-8 md:px-16 xl:px-24 mb-20">
        <div className="glass-panel border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-extrabold text-white mb-6">Common Use Cases</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {useCases.map((u, i) => (
              <div key={i} className="flex items-center gap-3 text-[14px] text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {u}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full max-w-7xl mx-auto px-8 md:px-16 xl:px-24 mb-20 text-center">
        <div className="glass-panel border border-primary/20 rounded-2xl p-10">
          <h2 className="text-2xl font-extrabold text-white mb-3">Ready to deploy your first queue?</h2>
          <p className="text-[14px] text-zinc-400 mb-6">Create a project, define a queue, attach workers, and start processing jobs in minutes.</p>
          <Link to="/login" className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-royal-glow">
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
