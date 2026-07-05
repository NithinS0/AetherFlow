import { Link } from "react-router-dom";
import { PublicLayout } from "../../layouts/PublicLayout";
import { Zap, Shield, Bot, Activity, Server, Code, ArrowRight, CheckCircle2 } from "lucide-react";

const stack = [
  { name: "FastAPI", role: "Backend API", desc: "High-performance async Python API framework with automatic OpenAPI generation." },
  { name: "React 19", role: "Frontend", desc: "Modern reactive UI with TypeScript, TailwindCSS, and Zustand state management." },
  { name: "PostgreSQL", role: "Scheduler Database", desc: "SKIP LOCKED row-level locking for atomic job claiming at scale." },
  { name: "Supabase", role: "Auth & Realtime", desc: "Row-level security, JWT authentication, realtime subscriptions, and managed storage." },
  { name: "LangGraph", role: "AI Orchestration", desc: "Multi-agent AI graph execution for OpsGPT, recommendations, and incident triage." },
  { name: "Groq LLM", role: "AI Inference", desc: "Ultra-low latency LLM inference for real-time operational intelligence." },
];

const values = [
  { icon: <Zap className="w-5 h-5 text-yellow-400" />, title: "Zero Duplicate Executions", desc: "Atomic job claiming guarantees each job executes exactly once, regardless of cluster size." },
  { icon: <Shield className="w-5 h-5 text-emerald-400" />, title: "Enterprise Reliability", desc: "Self-healing workers, automatic job recovery, and configurable retry policies for uninterrupted operation." },
  { icon: <Bot className="w-5 h-5 text-violet-400" />, title: "AI-Native Operations", desc: "AI agents analyse failures, recommend optimisations, and assist operators through natural language interfaces." },
  { icon: <Activity className="w-5 h-5 text-cyan-400" />, title: "Real-Time Observability", desc: "WebSocket-powered dashboards with live queue depth, worker health, and execution telemetry." },
];

export function AboutPage() {
  return (
    <PublicLayout breadcrumbs={[{ label: "Company" }, { label: "About AetherFlow" }]}>
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-400/20 bg-indigo-400/5 text-[11px] font-bold uppercase tracking-widest text-indigo-300 mb-6">
          <Server className="w-3.5 h-3.5" /> About AetherFlow
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-5">
          The Enterprise Platform for<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Distributed Job Operations</span>
        </h1>
        <p className="text-[16px] text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10">
          AetherFlow Enterprise was built to solve the hard problems of distributed job scheduling — exactly-once execution, self-healing workers, and AI-powered operational intelligence — in a single unified platform.
        </p>
        <Link to="/login" className="inline-flex items-center gap-2 px-7 py-3 bg-primary text-white font-bold rounded-xl shadow-royal-glow">
          Enter Platform <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Mission */}
      <section className="max-w-4xl mx-auto px-6 mb-20">
        <div className="glass-panel border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-extrabold text-white mb-4">Our Mission</h2>
          <p className="text-[15px] text-zinc-300 leading-relaxed mb-4">
            Modern distributed systems rely on background jobs for everything from payment processing to AI inference. Yet most teams operate these systems with fragile cron scripts, opaque error logs, and manual recovery procedures.
          </p>
          <p className="text-[15px] text-zinc-300 leading-relaxed mb-4">
            AetherFlow was designed from the ground up to change this. By combining a battle-tested PostgreSQL scheduling engine with a real-time operations platform and an AI intelligence layer, we give engineering teams complete control and visibility over their distributed workloads.
          </p>
          <p className="text-[15px] text-zinc-300 leading-relaxed">
            Our mission is to make distributed job operations as reliable, observable, and intelligent as the rest of the modern software stack.
          </p>
        </div>
      </section>

      {/* Core values */}
      <section className="max-w-6xl mx-auto px-6 mb-20">
        <h2 className="text-2xl font-extrabold text-white mb-2 text-center">Platform Principles</h2>
        <p className="text-[14px] text-zinc-500 text-center mb-10">The foundational commitments that drive every architectural decision.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {values.map((v, i) => (
            <div key={i} className="glass-panel border border-white/5 rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4">{v.icon}</div>
              <h3 className="text-[14px] font-bold text-white mb-2">{v.title}</h3>
              <p className="text-[13px] text-zinc-400 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech stack */}
      <section className="max-w-5xl mx-auto px-6 mb-20">
        <h2 className="text-2xl font-extrabold text-white mb-2 text-center">Technology Stack</h2>
        <p className="text-[14px] text-zinc-500 text-center mb-10">Built on battle-tested open source infrastructure.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stack.map((s, i) => (
            <div key={i} className="glass-panel border border-white/5 rounded-2xl p-5 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Code className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-[14px] font-extrabold text-white">{s.name}</div>
                <div className="text-[11px] text-primary font-semibold mb-1">{s.role}</div>
                <div className="text-[12px] text-zinc-400 leading-relaxed">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Platform goals */}
      <section className="max-w-4xl mx-auto px-6 mb-20">
        <div className="glass-panel border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-extrabold text-white mb-6">Platform Goals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "Process 10M+ jobs per day with zero duplicates",
              "99.999% platform availability SLA",
              "Sub-2ms job claim-to-execute latency",
              "AI-assisted operational decision making",
              "Enterprise-grade security and compliance",
              "Developer-first API and documentation",
              "Self-healing infrastructure with no manual intervention",
              "Full observability from queue depth to worker telemetry",
            ].map((g, i) => (
              <div key={i} className="flex items-center gap-3 text-[14px] text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {g}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 mb-20 text-center">
        <div className="glass-panel border border-primary/20 rounded-2xl p-10">
          <h2 className="text-2xl font-extrabold text-white mb-3">Build on AetherFlow today.</h2>
          <p className="text-[14px] text-zinc-400 mb-6">Join engineering teams running mission-critical workloads on AetherFlow Enterprise.</p>
          <Link to="/login" className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-royal-glow">
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
