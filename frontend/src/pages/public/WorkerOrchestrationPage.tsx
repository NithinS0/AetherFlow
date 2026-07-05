import { Link } from "react-router-dom";
import { PublicLayout } from "../../layouts/PublicLayout";
import { Cpu, Heart, ShieldCheck, AlertTriangle, RefreshCw, Activity, ArrowRight, CheckCircle2, Server } from "lucide-react";

const features = [
  { icon: <Cpu className="w-5 h-5 text-indigo-400" />, title: "Distributed Workers", desc: "Deploy stateless worker processes across any number of nodes. Each worker autonomously connects to the scheduler, claims jobs via SKIP LOCKED, and reports execution results." },
  { icon: <Heart className="w-5 h-5 text-rose-400" />, title: "Heartbeat Monitoring", desc: "Workers emit configurable heartbeats every N seconds. The Reliability Engine tracks heartbeat intervals and automatically marks workers as degraded or dead when intervals are missed." },
  { icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />, title: "Atomic Job Claiming", desc: "PostgreSQL SKIP LOCKED guarantees that each job is claimed by exactly one worker, even when hundreds of workers compete simultaneously. Zero duplicate execution by design." },
  { icon: <AlertTriangle className="w-5 h-5 text-amber-400" />, title: "Graceful Shutdown", desc: "Workers intercept SIGTERM and complete in-flight jobs before draining. The scheduler marks the worker offline and redistributes its claimed jobs to healthy workers immediately." },
  { icon: <RefreshCw className="w-5 h-5 text-cyan-400" />, title: "Automatic Recovery", desc: "When a worker crashes mid-execution, the Reliability Engine detects the missed heartbeat, resets the job status to pending, and re-enqueues it for another worker to pick up." },
  { icon: <Activity className="w-5 h-5 text-violet-400" />, title: "Worker Monitoring", desc: "Live dashboard shows each worker's CPU, memory, concurrency, jobs processed, error rate, and last heartbeat. Threshold-based alerts notify on-call engineers of degraded nodes." },
];

export function WorkerOrchestrationPage() {
  return (
    <PublicLayout breadcrumbs={[{ label: "Platform", href: "/platform/workers" }, { label: "Worker Orchestration" }]}>
      <section className="w-full mx-auto px-8 md:px-16 xl:px-24 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rose-400/20 bg-rose-400/5 text-[11px] font-bold uppercase tracking-widest text-rose-300 mb-6">
          <Cpu className="w-3.5 h-3.5" /> Worker Orchestration
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-5 leading-tight">
          Self-Healing Worker<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">Infrastructure</span>
        </h1>
        <p className="text-[16px] text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10">
          AetherFlow workers are stateless, horizontally scalable, and fully self-healing. Deploy as many workers as your workload demands and let the engine handle the rest.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/login" className="px-7 py-3 bg-primary text-white font-bold rounded-xl flex items-center gap-2 shadow-royal-glow">
            Deploy Workers <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/docs" className="px-7 py-3 border border-white/10 text-zinc-300 font-bold rounded-xl hover:bg-white/5 transition-colors">
            Worker Documentation
          </Link>
        </div>
      </section>

      {/* Architecture illustration */}
      <section className="w-full mx-auto px-8 md:px-16 xl:px-24 mb-20">
        <div className="glass-panel border border-white/10 rounded-2xl p-8">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-6">Worker Architecture</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Scheduler DB", "Worker Node A", "Worker Node B", "Worker Node C"].map((n, i) => (
              <div key={i} className={`p-4 rounded-xl border flex flex-col items-center gap-2 ${i === 0 ? "border-primary/30 bg-primary/5" : "border-white/10 bg-white/[0.02]"}`}>
                <Server className={`w-6 h-6 ${i === 0 ? "text-primary" : "text-emerald-400"}`} />
                <span className="text-[12px] font-bold text-white text-center">{n}</span>
                {i > 0 && <span className="text-[10px] text-emerald-400 font-mono">● ACTIVE</span>}
              </div>
            ))}
          </div>
          <p className="text-[12px] text-zinc-500 mt-4 text-center">All worker nodes connect to the same PostgreSQL scheduler database. SKIP LOCKED prevents concurrent claiming of the same job.</p>
        </div>
      </section>

      <section className="w-full mx-auto px-8 md:px-16 xl:px-24 mb-20">
        <h2 className="text-2xl font-extrabold text-white mb-2 text-center">Worker Engine Capabilities</h2>
        <p className="text-[14px] text-zinc-500 text-center mb-10">Enterprise-grade worker management from deployment to recovery.</p>
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

      <section className="w-full mx-auto px-8 md:px-16 xl:px-24 mb-20">
        <div className="glass-panel border border-white/10 rounded-2xl p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            "Horizontal scaling — add workers at any time",
            "Worker tags for routing specific job types",
            "Per-worker concurrency limits and slots",
            "Graceful drain on shutdown — no job loss",
            "Live CPU, memory, and throughput telemetry",
            "Automatic dead-job recovery on worker crash",
            "Custom worker plugins for specialized processing",
            "Multi-region worker cluster support",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-[14px] text-zinc-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {item}
            </div>
          ))}
        </div>
      </section>

      <section className="w-full max-w-7xl mx-auto px-8 md:px-16 xl:px-24 mb-20 text-center">
        <div className="glass-panel border border-primary/20 rounded-2xl p-10">
          <h2 className="text-2xl font-extrabold text-white mb-3">Scale to any workload.</h2>
          <p className="text-[14px] text-zinc-400 mb-6">Add new worker nodes in seconds. AetherFlow's scheduler automatically distributes load across all available workers.</p>
          <Link to="/login" className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-royal-glow">
            View Worker Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
