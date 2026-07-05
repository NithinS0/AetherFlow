import { Link } from "react-router-dom";
import { PublicLayout } from "../../layouts/PublicLayout";
import { Clock, Repeat, CalendarClock, Layers, GitBranch, Zap, ArrowRight, CheckCircle2 } from "lucide-react";

const jobTypes = [
  { icon: <Zap className="w-5 h-5 text-yellow-400" />, title: "Immediate Jobs", badge: "Real-time", desc: "Enqueue and execute within milliseconds. Workers claim jobs using PostgreSQL SKIP LOCKED ensuring exactly-once execution even under high concurrency." },
  { icon: <Clock className="w-5 h-5 text-blue-400" />, title: "Delayed Jobs", badge: "Scheduled", desc: "Schedule jobs to run at any future timestamp. The scheduler engine polls with microsecond precision and enqueues into the active worker pool at the exact configured time." },
  { icon: <Repeat className="w-5 h-5 text-emerald-400" />, title: "Recurring Jobs", badge: "Interval", desc: "Define fixed-interval recurring jobs in seconds, minutes, or hours. The engine automatically re-enqueues after each execution with configurable drift correction." },
  { icon: <CalendarClock className="w-5 h-5 text-purple-400" />, title: "Cron Jobs", badge: "Cron", desc: "Full cron expression support (seconds to years). AetherFlow evaluates cron schedules with timezone awareness and handles daylight-saving transitions correctly." },
  { icon: <Layers className="w-5 h-5 text-cyan-400" />, title: "Batch Jobs", badge: "Bulk", desc: "Group thousands of payloads into a single batch submission. The engine fans out to worker pool automatically with configurable chunk size and parallelism." },
  { icon: <GitBranch className="w-5 h-5 text-rose-400" />, title: "Dependency Jobs", badge: "DAG", desc: "Define directed acyclic graphs of job dependencies. Jobs execute only after all upstream dependencies complete successfully, enabling complex multi-stage workflows." },
];

export function JobSchedulerPage() {
  return (
    <PublicLayout breadcrumbs={[{ label: "Platform", href: "/platform/job-scheduler" }, { label: "Job Scheduler" }]}>
      <section className="w-full mx-auto px-8 md:px-16 xl:px-24 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-400/20 bg-indigo-400/5 text-[11px] font-bold uppercase tracking-widest text-indigo-300 mb-6">
          <Clock className="w-3.5 h-3.5" /> Job Scheduler
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-5 leading-tight">
          Every Job Type.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">One Unified Engine.</span>
        </h1>
        <p className="text-[16px] text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10">
          From fire-and-forget immediate tasks to complex DAG-based workflows, AetherFlow's scheduler engine handles every execution pattern at enterprise scale.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/login" className="px-7 py-3 bg-primary text-white font-bold rounded-xl flex items-center gap-2 shadow-royal-glow">
            Schedule Your First Job <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/api-reference" className="px-7 py-3 border border-white/10 text-zinc-300 font-bold rounded-xl hover:bg-white/5 transition-colors">
            View API Reference
          </Link>
        </div>
      </section>

      {/* Workflow diagram */}
      <section className="w-full mx-auto px-8 md:px-16 xl:px-24 mb-20">
        <div className="glass-panel border border-white/10 rounded-2xl p-6">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-5">Job Lifecycle</h3>
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {["Enqueue", "Queue Router", "Worker Claim", "Execution", "Result / Retry", "Complete"].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-[13px]">{i + 1}</div>
                  <span className="text-[11px] text-zinc-400 font-semibold mt-1 text-center leading-tight max-w-[70px]">{step}</span>
                </div>
                {i < 5 && <span className="text-zinc-700 text-lg hidden md:block">→</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Job types */}
      <section className="w-full mx-auto px-8 md:px-16 xl:px-24 mb-20">
        <h2 className="text-2xl font-extrabold text-white mb-2 text-center">Supported Job Types</h2>
        <p className="text-[14px] text-zinc-500 text-center mb-10">Every scheduling pattern your distributed system needs, natively supported.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobTypes.map((j, i) => (
            <div key={i} className="glass-panel border border-white/5 rounded-2xl p-6 hover:border-primary/20 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">{j.icon}</div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border border-white/10 rounded-full px-2 py-0.5">{j.badge}</span>
              </div>
              <h3 className="text-[15px] font-bold text-white mb-2">{j.title}</h3>
              <p className="text-[13px] text-zinc-400 leading-relaxed">{j.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Capabilities */}
      <section className="w-full mx-auto px-8 md:px-16 xl:px-24 mb-20">
        <div className="glass-panel border border-white/10 rounded-2xl p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            "Timezone-aware scheduling with DST handling",
            "Sub-second scheduling precision",
            "Atomic SKIP LOCKED job claiming — zero duplicates",
            "Configurable retry with exponential backoff",
            "Dead-letter queue for exhausted jobs",
            "Job payload validation with custom schemas",
            "Real-time execution logs and status streaming",
            "API-first design — schedule jobs from any service",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-[14px] text-zinc-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {item}
            </div>
          ))}
        </div>
      </section>

      <section className="w-full max-w-7xl mx-auto px-8 md:px-16 xl:px-24 mb-20 text-center">
        <div className="glass-panel border border-primary/20 rounded-2xl p-10">
          <h2 className="text-2xl font-extrabold text-white mb-3">One API. Every Schedule Pattern.</h2>
          <p className="text-[14px] text-zinc-400 mb-6">Schedule jobs from any language with AetherFlow's REST API. Immediate, delayed, cron, and batch — all through a single endpoint.</p>
          <Link to="/api-reference" className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-royal-glow">
            Explore API Reference <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
