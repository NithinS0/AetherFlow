import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight, Shield, Zap, Activity, Users, Terminal,
  Cpu, Server, Code, Sparkles, Globe, FileText, ChevronRight,
  CheckCircle2, BarChart3, Bot, Lock, Layers, GitBranch,
  RefreshCw, AlertTriangle, TrendingUp, Database, Network,
  Play, ArrowUpRight,
} from "lucide-react";
import { BrandLogo } from "../components/BrandLogo";

/* ─── Reusable animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const staggerSlow = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

function SectionReveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? "visible" : "hidden"} variants={stagger} className={className}>
      {children}
    </motion.div>
  );
}

/* ─── Feature card ─── */
function FeatureCard({ icon, title, desc, accent = "indigo" }: {
  icon: React.ReactNode; title: string; desc: string; accent?: string;
}) {
  const accents: Record<string, string> = {
    indigo: "from-indigo-500/20 to-indigo-500/0 border-indigo-500/30 hover:border-indigo-400/60 group-hover:text-indigo-400",
    cyan: "from-cyan-500/20 to-cyan-500/0 border-cyan-500/30 hover:border-cyan-400/60 group-hover:text-cyan-400",
    emerald: "from-emerald-500/20 to-emerald-500/0 border-emerald-500/30 hover:border-emerald-400/60 group-hover:text-emerald-400",
    rose: "from-rose-500/20 to-rose-500/0 border-rose-500/30 hover:border-rose-400/60 group-hover:text-rose-400",
    violet: "from-violet-500/20 to-violet-500/0 border-violet-500/30 hover:border-violet-400/60 group-hover:text-violet-400",
    amber: "from-amber-500/20 to-amber-500/0 border-amber-500/30 hover:border-amber-400/60 group-hover:text-amber-400",
  };
  const a = accents[accent] || accents.indigo;
  return (
    <motion.div variants={fadeUp}
      className={`group relative p-7 rounded-2xl border bg-gradient-to-b from-white/[0.03] to-transparent
        backdrop-blur-sm hover:-translate-y-1.5 transition-all duration-300 cursor-default
        hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] ${a.split(" ").filter(c => c.includes("border")).join(" ")}`}
    >
      {/* gradient bg on hover */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${a.split(" ").slice(0, 2).join(" ")} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
      <div className="relative z-10">
        <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-[15px] font-bold text-white mb-2.5 tracking-tight">{title}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

/* ─── Stat card ─── */
function StatCard({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <motion.div variants={fadeUp} className="text-center space-y-1.5">
      <div className="text-4xl xl:text-5xl font-black text-white font-mono tracking-tighter tabular-nums">{value}</div>
      <div className="text-sm font-bold uppercase tracking-widest text-zinc-400">{label}</div>
      {sub && <div className="text-xs text-zinc-600 font-medium">{sub}</div>}
    </motion.div>
  );
}

/* ─── Step card for workflow ─── */
function StepCard({ step, title, desc, icon }: { step: string; title: string; desc: string; icon: React.ReactNode }) {
  return (
    <motion.div variants={fadeUp} className="relative flex gap-5">
      <div className="flex flex-col items-center shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-[0_0_20px_rgba(99,102,241,0.4)]">
          {step}
        </div>
        <div className="flex-1 w-px bg-gradient-to-b from-indigo-500/40 to-transparent mt-2" />
      </div>
      <div className="pb-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-primary">{icon}</span>
          <h4 className="text-base font-bold text-white tracking-tight">{title}</h4>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">{desc}</p>
      </div>
    </motion.div>
  );
}

/* ─── AI feature row ─── */
function AiFeatureRow({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <motion.div variants={fadeUp} className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/[0.02] transition-colors group">
      <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
        {icon}
      </div>
      <div>
        <div className="text-sm font-bold text-white mb-1">{title}</div>
        <div className="text-xs text-zinc-500 leading-relaxed">{desc}</div>
      </div>
    </motion.div>
  );
}

/* ─── Benefit card ─── */
function BenefitCard({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <motion.div variants={fadeUp}
      className="p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 group"
    >
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/10 border border-indigo-500/20 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
        {icon}
      </div>
      <h4 className="text-base font-bold text-white mb-4">{title}</h4>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            {item}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
export function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  // Force dark theme on html element for the landing page
  // so the light-mode CSS overrides in index.css don't affect dark backgrounds.
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.getAttribute("data-theme") ?? "dark";
    html.setAttribute("data-theme", "dark");
    return () => {
      html.setAttribute("data-theme", prev);
    };
  }, []);

  return (
    <div className="relative bg-[#03050c] text-zinc-300 font-sans overflow-x-hidden w-full selection:bg-indigo-500/30 selection:text-white">

      {/* ── Ambient background glows ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full bg-indigo-600/8 blur-[160px]" />
        <div className="absolute top-[40%] -right-20 w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-[140px]" />
        <div className="absolute bottom-0 left-1/4 w-[700px] h-[600px] rounded-full bg-violet-600/5 blur-[160px]" />
      </div>

      {/* ── Grid pattern ── */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:56px_56px]" />

      {/* ════════════════════════════════════════════
          HEADER
      ════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#03050c]/80 backdrop-blur-2xl">
        <nav className="w-full max-w-[1440px] mx-auto flex items-center justify-between px-8 md:px-12 xl:px-16 h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <BrandLogo variant="full" forceDark className="h-14 w-auto object-contain" />
          </Link>

          {/* Center nav */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { label: "Platform", to: "/platform/queue-management" },
              { label: "Documentation", to: "/docs" },
              { label: "API Reference", to: "/api-reference" },
              { label: "Status", to: "/status" },
              { label: "Company", to: "/about" },
            ].map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className="px-4 py-2 text-[13.5px] font-semibold text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.04] transition-all duration-200"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-[13.5px] font-semibold text-zinc-400 hover:text-white transition-colors hidden sm:block">
              Sign In
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-[13.5px] font-bold rounded-xl
                hover:bg-zinc-100 transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.12)]
                hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:-translate-y-px"
            >
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </nav>
      </header>

      {/* ════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative z-10 w-full min-h-[calc(100vh-72px)] flex flex-col items-center justify-center text-center px-6 md:px-12 pt-20 pb-16">

        {/* Status pill */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 mb-10 rounded-full border border-white/[0.08]
            bg-white/[0.03] backdrop-blur-sm text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          All Systems Operational · 99.999% Uptime
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl xl:text-[82px] font-black tracking-[-0.04em] text-white leading-[1.05] max-w-[1000px] mx-auto mb-7"
        >
          The Enterprise Platform for{" "}
          <span className="relative inline-block">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400">
              Distributed Job Orchestration
            </span>
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base md:text-xl text-zinc-400 max-w-[680px] mx-auto mb-10 leading-relaxed font-medium"
        >
          AetherFlow Enterprise unifies high-throughput job scheduling, real-time worker telemetry, AI-driven observability, and self-healing resilience into one premium control plane.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mb-16"
        >
          <Link
            to="/login"
            className="group flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[15px] font-bold rounded-xl
              hover:from-indigo-500 hover:to-blue-500 transition-all duration-300 shadow-[0_0_40px_rgba(99,102,241,0.35)]
              hover:shadow-[0_0_50px_rgba(99,102,241,0.5)] hover:-translate-y-0.5"
          >
            <Play className="w-4 h-4" />
            Start Free Trial
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/docs"
            className="flex items-center justify-center gap-2.5 px-8 py-4 text-[15px] font-bold text-zinc-300 rounded-xl border border-white/[0.08]
              bg-white/[0.03] hover:bg-white/[0.06] hover:text-white hover:border-white/[0.15] transition-all duration-300 backdrop-blur-sm hover:-translate-y-0.5"
          >
            <FileText className="w-4 h-4" />
            View Documentation
          </Link>
        </motion.div>

        {/* Hero Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-[1200px] mx-auto relative"
        >
          {/* Outer glow */}
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-b from-indigo-500/10 to-transparent blur-xl pointer-events-none" />

          <div className="relative rounded-[2rem] border border-white/[0.08] bg-[#080d18]/90 backdrop-blur-xl shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)] overflow-hidden">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.05] bg-white/[0.02]">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/70" />
                <span className="w-3 h-3 rounded-full bg-amber-500/70" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-2 px-4 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[11px] text-zinc-500 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  console.aetherflow.io — Operations Control Plane
                </div>
              </div>
              <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">AF_CLUSTER_01</div>
            </div>

            {/* Dashboard grid */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Job Coordinator */}
              <div className="relative p-5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors group">
                <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <Server className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-[11px] font-black text-white uppercase font-mono tracking-tight">Job Coordinator</div>
                    <div className="text-[10px] text-emerald-400 font-mono">● ACTIVE</div>
                  </div>
                </div>
                <div className="space-y-2 text-[11px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Queue depth</span>
                    <span className="text-indigo-300 font-bold">48,291</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Claimed/sec</span>
                    <span className="text-emerald-400 font-bold">1,840</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Lock contention</span>
                    <span className="text-emerald-400 font-bold">0</span>
                  </div>
                  <div className="mt-3 h-1 rounded-full bg-white/[0.05] overflow-hidden">
                    <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-indigo-500 to-blue-500" />
                  </div>
                </div>
              </div>

              {/* Operations Cluster */}
              <div className="relative p-5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-[11px] font-black text-white uppercase font-mono tracking-tight">Worker Cluster</div>
                    <div className="text-[10px] text-emerald-400 font-mono">● 24 Nodes Online</div>
                  </div>
                </div>
                <div className="space-y-2 text-[11px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Throughput</span>
                    <span className="text-cyan-300 font-bold">98.4k jobs/hr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Avg latency</span>
                    <span className="text-emerald-400 font-bold">1.1 ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Heartbeat</span>
                    <span className="text-emerald-400 font-bold">✓ Normal</span>
                  </div>
                  <div className="mt-3 flex gap-1">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className={`flex-1 h-5 rounded-sm ${i < 11 ? "bg-emerald-500/40" : "bg-amber-500/40"}`} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Self-Healing SRE */}
              <div className="relative p-5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <div className="text-[11px] font-black text-white uppercase font-mono tracking-tight">AI SRE Engine</div>
                    <div className="text-[10px] text-violet-400 font-mono">● Analyzing</div>
                  </div>
                </div>
                <div className="space-y-2 text-[11px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Anomalies</span>
                    <span className="text-emerald-400 font-bold">0 detected</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Requeued</span>
                    <span className="text-violet-300 font-bold">142 jobs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">DLQ</span>
                    <span className="text-emerald-400 font-bold">Clean</span>
                  </div>
                  <div className="mt-3 p-2 rounded-lg bg-violet-500/5 border border-violet-500/10 text-[10px] text-violet-300">
                    ⟳ Exponential backoff applied to 7 jobs
                  </div>
                </div>
              </div>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-4 border-t border-white/[0.05]">
              {[
                { value: "10.4M", label: "Jobs Today" },
                { value: "1.1ms", label: "P99 Latency" },
                { value: "99.999%", label: "Uptime" },
                { value: "0", label: "Duplicates" },
              ].map(({ value, label }) => (
                <div key={label} className="py-4 text-center border-r border-white/[0.04] last:border-r-0">
                  <div className="text-base font-black text-white font-mono tabular-nums">{value}</div>
                  <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════
          TRUST / SOCIAL PROOF BAR
      ════════════════════════════════════════════ */}
      <section className="relative z-10 w-full border-y border-white/[0.05] py-8 bg-white/[0.01]">
        <div className="max-w-[1400px] mx-auto px-8 md:px-12 xl:px-16">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-0 md:justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-600 shrink-0 md:mr-12">
              Trusted by engineering teams at
            </p>
            <div className="flex flex-wrap justify-center md:justify-between items-center gap-x-10 gap-y-4 flex-1">
              {["Acme Corp", "NexaCloud", "Orbital AI", "Vertex Systems", "DataForge", "PulseOps"].map((name) => (
                <span key={name} className="text-[13px] font-black text-zinc-600 hover:text-zinc-400 transition-colors tracking-tight font-sans">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FEATURES GRID
      ════════════════════════════════════════════ */}
      <section className="relative z-10 w-full py-32">
        <div className="max-w-[1400px] mx-auto px-8 md:px-12 xl:px-16">
          <SectionReveal>
            <motion.div variants={fadeUp} className="text-center mb-16 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/[0.06] text-indigo-400 text-[11px] font-bold uppercase tracking-widest mb-6">
                <Zap className="w-3 h-3" /> Core Platform
              </div>
              <h2 className="text-3xl md:text-4xl xl:text-5xl font-black text-white tracking-tight mb-5 leading-tight">
                Enterprise-Grade Infrastructure,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                  Zero Compromise
                </span>
              </h2>
              <p className="text-base text-zinc-400 leading-relaxed">
                Built on PostgreSQL SKIP LOCKED primitives for atomic job claiming, with AI observability and real-time telemetry baked in.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <FeatureCard accent="indigo" icon={<Zap className="w-5 h-5 text-indigo-400" />}
                title="Atomic Task Claiming"
                desc="Row-level PostgreSQL SKIP LOCKED ensures a single job is never executed by multiple workers simultaneously — zero duplicate executions guaranteed."
              />
              <FeatureCard accent="emerald" icon={<Shield className="w-5 h-5 text-emerald-400" />}
                title="Self-Healing Recovery"
                desc="The reliability engine monitors worker heartbeats and instantly reassigns stalled jobs to healthy nodes on OOM crashes or network partitions."
              />
              <FeatureCard accent="cyan" icon={<Activity className="w-5 h-5 text-cyan-400" />}
                title="Real-Time Telemetry"
                desc="WebSocket streaming powers the operations center — monitor queue depths, execution throughput, and worker CPU/memory live without page refreshes."
              />
              <FeatureCard accent="violet" icon={<Bot className="w-5 h-5 text-violet-400" />}
                title="AI Intelligence Layer"
                desc="LangGraph-powered agents continuously analyze failures, recommend configuration optimizations, and explain stack traces via natural language via OpsGPT."
              />
              <FeatureCard accent="rose" icon={<Users className="w-5 h-5 text-rose-400" />}
                title="Native Collaboration"
                desc="Contextual incident management and team channels eliminate context-switching. Operators discuss, approve, and act on alerts natively inside the platform."
              />
              <FeatureCard accent="amber" icon={<Layers className="w-5 h-5 text-amber-400" />}
                title="Extensible Architecture"
                desc="Write custom Python plugins, build interactive DAG workflows with React Flow, and manage API keys for programmatic external access through the developer portal."
              />
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          METRICS / STATS SECTION
      ════════════════════════════════════════════ */}
      <section className="relative z-10 w-full py-24 border-y border-white/[0.05] bg-gradient-to-r from-indigo-950/20 via-transparent to-cyan-950/20">
        <div className="max-w-[1400px] mx-auto px-8 md:px-12 xl:px-16">
          <SectionReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
              <StatCard value="99.999%" label="Uptime SLA" sub="5-nines guaranteed" />
              <StatCard value="< 1.2ms" label="P99 Task Latency" sub="Avg 0.8ms observed" />
              <StatCard value="10M+" label="Daily Jobs Executed" sub="Peak 14M on record" />
              <StatCard value="0" label="Duplicate Executions" sub="Atomic claiming enforced" />
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          ARCHITECTURE / PLATFORM OVERVIEW
      ════════════════════════════════════════════ */}
      <section className="relative z-10 w-full py-32">
        <div className="max-w-[1400px] mx-auto px-8 md:px-12 xl:px-16">
          <SectionReveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left: Copy */}
              <div>
                <motion.div variants={fadeUp}>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/[0.06] text-cyan-400 text-[11px] font-bold uppercase tracking-widest mb-6">
                    <Network className="w-3 h-3" /> Architecture
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-6 leading-tight">
                    Distributed by Design,{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                      Resilient by Default
                    </span>
                  </h2>
                  <p className="text-base text-zinc-400 leading-relaxed mb-8">
                    AetherFlow's multi-layer architecture separates concerns cleanly — coordination, execution, and observation operate independently, enabling horizontal scaling at any layer without cascading failures.
                  </p>
                </motion.div>

                <motion.div variants={stagger} className="space-y-4">
                  {[
                    { icon: <Database className="w-4 h-4 text-indigo-400" />, title: "PostgreSQL Coordination Layer", desc: "SKIP LOCKED row claims with transaction isolation" },
                    { icon: <Cpu className="w-4 h-4 text-cyan-400" />, title: "Worker Execution Plane", desc: "Horizontally scalable, heartbeat-monitored nodes" },
                    { icon: <Activity className="w-4 h-4 text-emerald-400" />, title: "Real-Time Observation", desc: "WebSocket streams, metrics, and distributed traces" },
                    { icon: <Bot className="w-4 h-4 text-violet-400" />, title: "AI Intelligence Layer", desc: "LangGraph agents for anomaly detection & remediation" },
                  ].map(({ icon, title, desc }) => (
                    <motion.div key={title} variants={fadeUp}
                      className="flex items-start gap-3.5 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                        {icon}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white mb-0.5">{title}</div>
                        <div className="text-xs text-zinc-500">{desc}</div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Right: Architecture diagram */}
              <motion.div variants={fadeUp} className="relative">
                <div className="relative rounded-2xl border border-white/[0.07] bg-[#080d18] p-8 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />

                  {/* Layers */}
                  {[
                    { label: "API Gateway & Auth", color: "indigo", items: ["REST API", "WebSocket", "JWT / OAuth2"] },
                    { label: "Coordination Engine", color: "blue", items: ["Queue Manager", "Job Scheduler", "SKIP LOCKED"] },
                    { label: "Worker Fleet", color: "cyan", items: ["Node 01–12", "Heartbeat Monitor", "Auto-Scale"] },
                    { label: "AI & Observability", color: "violet", items: ["LangGraph Agents", "OpsGPT", "Anomaly Detect"] },
                  ].map(({ label, color, items }, idx) => (
                    <div key={label} className="mb-3 last:mb-0">
                      <div className={`relative p-3.5 rounded-xl border bg-gradient-to-r
                        ${color === "indigo" ? "border-indigo-500/20 from-indigo-500/8 to-transparent" : ""}
                        ${color === "blue" ? "border-blue-500/20 from-blue-500/8 to-transparent" : ""}
                        ${color === "cyan" ? "border-cyan-500/20 from-cyan-500/8 to-transparent" : ""}
                        ${color === "violet" ? "border-violet-500/20 from-violet-500/8 to-transparent" : ""}
                      `}>
                        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">{label}</div>
                        <div className="flex gap-2 flex-wrap">
                          {items.map(item => (
                            <span key={item} className="text-[10px] px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-zinc-300 font-mono font-semibold">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                      {idx < 3 && (
                        <div className="flex justify-center my-1">
                          <div className="w-px h-4 bg-gradient-to-b from-white/20 to-white/5" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SCHEDULER WORKFLOW
      ════════════════════════════════════════════ */}
      <section className="relative z-10 w-full py-32 bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent">
        <div className="max-w-[1400px] mx-auto px-8 md:px-12 xl:px-16">
          <SectionReveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              {/* Right: Steps */}
              <div className="order-2 lg:order-1">
                <motion.div variants={fadeUp}>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/[0.06] text-indigo-400 text-[11px] font-bold uppercase tracking-widest mb-6">
                    <GitBranch className="w-3 h-3" /> Scheduler Workflow
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-10 leading-tight">
                    How AetherFlow Processes{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">
                      Millions of Jobs
                    </span>
                  </h2>
                </motion.div>

                <motion.div variants={staggerSlow}>
                  <StepCard step="1" icon={<Code className="w-4 h-4" />}
                    title="Job Submission"
                    desc="Clients submit jobs via REST API or SDK. Jobs are atomically persisted to the PostgreSQL queue with priority, retry config, and metadata."
                  />
                  <StepCard step="2" icon={<Server className="w-4 h-4" />}
                    title="Atomic Claiming"
                    desc="Workers poll using SELECT … FOR UPDATE SKIP LOCKED — a database-native mechanism that guarantees exactly-once delivery without external lock managers."
                  />
                  <StepCard step="3" icon={<Cpu className="w-4 h-4" />}
                    title="Worker Execution"
                    desc="Healthy workers execute jobs and stream telemetry via WebSocket. CPU, memory, and status are visible in real-time on the operations dashboard."
                  />
                  <StepCard step="4" icon={<RefreshCw className="w-4 h-4" />}
                    title="Self-Healing & Retry"
                    desc="On failure, the reliability engine applies exponential backoff and re-enqueues the job. Exhausted retries route to the Dead Letter Queue for inspection."
                  />
                  <StepCard step="5" icon={<TrendingUp className="w-4 h-4" />}
                    title="AI Observability"
                    desc="AI agents continuously analyze execution patterns, detect anomalies, explain failures in plain language, and recommend config optimizations proactively."
                  />
                </motion.div>
              </div>

              {/* Left: Visual code terminal */}
              <motion.div variants={fadeUp} className="order-1 lg:order-2 sticky top-32">
                <div className="rounded-2xl border border-white/[0.07] bg-[#080d18] overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.05] bg-white/[0.02]">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest ml-2">AF_SCHEDULER_SHELL</span>
                  </div>
                  <div className="p-5 font-mono text-[11px] space-y-2 text-zinc-400">
                    <div className="flex gap-2"><span className="text-zinc-600">$</span><span className="text-zinc-200">aetherflow jobs submit --queue critical</span></div>
                    <div className="text-emerald-400">✓ Job JB_94821 queued (priority: HIGH)</div>
                    <div className="text-zinc-600">──────────────────────────────</div>
                    <div className="flex gap-2"><span className="text-zinc-600">$</span><span className="text-zinc-200">aetherflow workers status --all</span></div>
                    <div className="text-indigo-400">AF_NODE_01 ➔ IDLE   (CPU: 12% | MEM: 38%)</div>
                    <div className="text-indigo-400">AF_NODE_02 ➔ BUSY   (CPU: 67% | MEM: 52%)</div>
                    <div className="text-indigo-400">AF_NODE_03 ➔ IDLE   (CPU:  9% | MEM: 41%)</div>
                    <div className="text-zinc-600">──────────────────────────────</div>
                    <div className="flex gap-2"><span className="text-zinc-600">$</span><span className="text-zinc-200">aetherflow queue verify --skip-locked</span></div>
                    <div className="text-emerald-400">✓ Claim validation: ATOMIC</div>
                    <div className="text-emerald-400">✓ Lock contention: 0 detected</div>
                    <div className="text-emerald-400">✓ Duplicate executions: 0</div>
                    <div className="text-zinc-600">──────────────────────────────</div>
                    <div className="flex gap-2"><span className="text-zinc-600">$</span><span className="text-zinc-200">aetherflow ai analyze --recent-failures</span></div>
                    <div className="text-violet-400">⟳ Analyzing 7 recent failures...</div>
                    <div className="text-violet-300">→ Root cause: memory pressure on NODE_02</div>
                    <div className="text-violet-300">→ Recommendation: Scale worker fleet +2</div>
                    <div className="flex items-center gap-1 text-zinc-600">
                      <span className="animate-pulse">█</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          AI FEATURES
      ════════════════════════════════════════════ */}
      <section className="relative z-10 w-full py-32">
        <div className="max-w-[1400px] mx-auto px-8 md:px-12 xl:px-16">
          <SectionReveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left: AI panel */}
              <motion.div variants={fadeUp} className="relative">
                <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-b from-violet-500/[0.05] to-transparent overflow-hidden">
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-violet-500/10">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                      <div className="text-[11px] font-black text-white uppercase font-mono tracking-tight">OpsGPT — AI Assistant</div>
                      <div className="text-[10px] text-violet-400">LangGraph · GPT-4o · RAG-enhanced</div>
                    </div>
                    <div className="ml-auto flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Online
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex justify-end">
                      <div className="max-w-[75%] px-3.5 py-2.5 rounded-2xl rounded-tr-sm bg-indigo-600/20 border border-indigo-500/20 text-[12px] text-zinc-300">
                        Why did job JB_94103 fail 3 times in the last hour?
                      </div>
                    </div>
                    <div className="flex gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/20 flex items-center justify-center shrink-0">
                        <Bot className="w-3.5 h-3.5 text-violet-400" />
                      </div>
                      <div className="max-w-[80%] px-3.5 py-2.5 rounded-2xl rounded-tl-sm bg-white/[0.03] border border-white/[0.06] text-[12px] text-zinc-300 leading-relaxed">
                        Analysis complete. <span className="text-violet-300 font-semibold">Root cause:</span> NODE_02 experienced OOM at 22:14, 22:31, and 22:47 UTC. The job requires 2.4 GB peak memory but NODE_02 was capped at 2 GB. <span className="text-emerald-400">Recommendation:</span> Route this queue to NODE_01 or NODE_03 (4 GB cap). I've prepared a config patch — want me to apply it?
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="max-w-[75%] px-3.5 py-2.5 rounded-2xl rounded-tr-sm bg-indigo-600/20 border border-indigo-500/20 text-[12px] text-zinc-300">
                        Yes, apply the patch and notify the on-call team.
                      </div>
                    </div>
                    <div className="flex gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/20 flex items-center justify-center shrink-0">
                        <Bot className="w-3.5 h-3.5 text-violet-400" />
                      </div>
                      <div className="max-w-[80%] px-3.5 py-2.5 rounded-2xl rounded-tl-sm bg-white/[0.03] border border-white/[0.06] text-[12px] text-zinc-300">
                        <span className="text-emerald-400">✓ Done.</span> Queue routing updated. On-call Slack channel notified. JB_94103 re-queued on NODE_01 — monitoring for success.
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <div className="flex-1 px-3.5 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-[12px] text-zinc-600">
                        Ask OpsGPT anything...
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center">
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right: AI features list */}
              <div>
                <motion.div variants={fadeUp}>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/[0.06] text-violet-400 text-[11px] font-bold uppercase tracking-widest mb-6">
                    <Sparkles className="w-3 h-3" /> AI-Powered
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-5 leading-tight">
                    Your AI Operations{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                      Co-Pilot
                    </span>
                  </h2>
                  <p className="text-base text-zinc-400 leading-relaxed mb-8">
                    LangGraph-orchestrated AI agents monitor your infrastructure 24/7, explain failures in plain English, and take autonomous remediation actions — with your approval.
                  </p>
                </motion.div>

                <motion.div variants={stagger} className="space-y-1">
                  <AiFeatureRow icon={<AlertTriangle className="w-4 h-4 text-violet-400" />}
                    title="Failure Analysis Agent"
                    desc="Automatically correlates logs, metrics, and traces to identify root causes and suggest fixes with confidence scores."
                  />
                  <AiFeatureRow icon={<TrendingUp className="w-4 h-4 text-violet-400" />}
                    title="Optimization Agent"
                    desc="Analyzes throughput patterns and recommends queue priorities, worker scaling, and retry configuration changes."
                  />
                  <AiFeatureRow icon={<Shield className="w-4 h-4 text-violet-400" />}
                    title="Security Advisor"
                    desc="Continuously audits API key usage, permission anomalies, and unusual access patterns with real-time alerts."
                  />
                  <AiFeatureRow icon={<FileText className="w-4 h-4 text-violet-400" />}
                    title="Documentation Agent"
                    desc="Auto-generates runbooks, incident post-mortems, and architecture docs from real operational data."
                  />
                  <AiFeatureRow icon={<MessageSquare className="w-4 h-4 text-violet-400" />}
                    title="OpsGPT Chat Interface"
                    desc="Natural language interface to your entire infrastructure — ask questions, issue commands, and get insights conversationally."
                  />
                </motion.div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          ENTERPRISE BENEFITS
      ════════════════════════════════════════════ */}
      <section className="relative z-10 w-full py-32 border-y border-white/[0.05]">
        <div className="max-w-[1400px] mx-auto px-8 md:px-12 xl:px-16">
          <SectionReveal>
            <motion.div variants={fadeUp} className="text-center mb-16 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400 text-[11px] font-bold uppercase tracking-widest mb-6">
                <CheckCircle2 className="w-3 h-3" /> Enterprise-Ready
              </div>
              <h2 className="text-3xl md:text-4xl xl:text-5xl font-black text-white tracking-tight mb-5 leading-tight">
                Built for Teams That{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  Can't Afford Downtime
                </span>
              </h2>
              <p className="text-base text-zinc-400 leading-relaxed">
                Every feature is designed for production workloads at scale, with the governance, security, and reliability guarantees that enterprise teams demand.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              <BenefitCard icon={<Shield className="w-5 h-5 text-indigo-400" />}
                title="Security & Compliance"
                items={[
                  "Role-based access control (RBAC)",
                  "Full audit log trail",
                  "API key rotation & scoping",
                  "SOC 2 ready architecture",
                ]}
              />
              <BenefitCard icon={<Activity className="w-5 h-5 text-cyan-400" />}
                title="Observability"
                items={[
                  "Real-time WebSocket streams",
                  "Distributed tracing support",
                  "Custom metrics & dashboards",
                  "Incident timeline & alerts",
                ]}
              />
              <BenefitCard icon={<RefreshCw className="w-5 h-5 text-emerald-400" />}
                title="Reliability"
                items={[
                  "99.999% uptime SLA",
                  "Automatic failover & retry",
                  "Dead letter queue inspection",
                  "Chaos engineering toolkit",
                ]}
              />
              <BenefitCard icon={<Lock className="w-5 h-5 text-violet-400" />}
                title="Governance"
                items={[
                  "Multi-org workspace isolation",
                  "Team-level permissions",
                  "Approval workflows",
                  "Plugin sandboxing",
                ]}
              />
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          CTA SECTION
      ════════════════════════════════════════════ */}
      <section className="relative z-10 w-full py-8 px-6 md:px-12 mb-0">
        <div className="max-w-[1400px] mx-auto">
          <SectionReveal>
            <motion.div variants={fadeUp}
              className="relative rounded-3xl overflow-hidden border border-indigo-500/20 bg-gradient-to-br from-indigo-950/80 via-[#080d18] to-blue-950/60 p-14 md:p-20 text-center"
            >
              {/* bg glow */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/15 rounded-full blur-[100px]" />
                <div className="absolute -bottom-10 right-1/4 w-[400px] h-[300px] bg-blue-600/10 rounded-full blur-[80px]" />
              </div>

              <div className="relative z-10">
                <div className="flex justify-center mb-8">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/25 bg-indigo-500/[0.08]">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">Start Building Today</span>
                  </div>
                </div>

                <h2 className="text-4xl md:text-5xl xl:text-6xl font-black text-white tracking-tight mb-6 leading-tight max-w-3xl mx-auto">
                  Ready to Scale Your{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400">
                    Infrastructure?
                  </span>
                </h2>

                <p className="text-base md:text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                  Get started with AetherFlow Enterprise today. Build fault-tolerant, AI-powered workflow scheduling pipelines that scale from hundreds to millions of jobs.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/login"
                    className="group flex items-center justify-center gap-2.5 px-10 py-4 bg-white text-black text-base font-black rounded-xl
                      hover:bg-zinc-100 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.15)]
                      hover:shadow-[0_0_60px_rgba(255,255,255,0.25)] hover:-translate-y-0.5"
                  >
                    Access Operations Control
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                  <Link
                    to="/docs"
                    className="flex items-center justify-center gap-2.5 px-10 py-4 text-base font-bold text-zinc-300 rounded-xl border border-white/[0.1]
                      bg-white/[0.03] hover:bg-white/[0.07] hover:text-white hover:border-white/[0.18] transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <ChevronRight className="w-4 h-4" />
                    Read the Docs
                  </Link>
                </div>
              </div>
            </motion.div>
          </SectionReveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════ */}
      <footer className="relative z-10 w-full border-t border-white/[0.06] bg-[#03050c] pt-20 pb-10 mt-20">
        <div className="max-w-[1400px] mx-auto px-8 md:px-12 xl:px-16">

          {/* 4-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-12 mb-16">

            {/* Brand column */}
            <div className="xl:col-span-1 space-y-5">
              <Link to="/">
                <BrandLogo variant="full" forceDark className="h-[72px] w-auto object-contain" />
              </Link>
              <p className="text-sm font-semibold text-white leading-snug max-w-[240px]">
                Enterprise AI-Native Distributed Job Scheduling &amp; Operations Platform.
              </p>
              <p className="text-[13px] text-zinc-500 leading-relaxed max-w-[260px]">
                Build, schedule, monitor, and optimize distributed workloads with real-time AI-powered insights and enterprise-grade reliability.
              </p>
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-zinc-500">All systems operational</span>
              </div>
            </div>

            {/* Platform column */}
            <div>
              <h5 className="mb-6 text-[11px] font-black uppercase tracking-[0.14em] text-zinc-300">Platform</h5>
              <ul className="space-y-3.5">
                {[
                  { label: "Queue Management", to: "/platform/queue-management", icon: <Server className="h-3.5 w-3.5" /> },
                  { label: "Job Scheduler", to: "/platform/job-scheduler", icon: <Terminal className="h-3.5 w-3.5" /> },
                  { label: "Worker Orchestration", to: "/platform/workers", icon: <Cpu className="h-3.5 w-3.5" /> },
                  { label: "Analytics & Monitoring", to: "/platform/analytics", icon: <BarChart3 className="h-3.5 w-3.5" /> },
                ].map(({ label, to, icon }) => (
                  <li key={to}>
                    <Link to={to} className="flex items-center gap-2.5 text-[13px] text-zinc-500 hover:text-zinc-200 transition-colors group">
                      <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors">{icon}</span>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources column */}
            <div>
              <h5 className="mb-6 text-[11px] font-black uppercase tracking-[0.14em] text-zinc-300">Resources</h5>
              <ul className="space-y-3.5">
                {[
                  { label: "Documentation", to: "/docs", icon: <FileText className="h-3.5 w-3.5" /> },
                  { label: "REST API Reference", to: "/api-reference", icon: <Code className="h-3.5 w-3.5" /> },
                  { label: "System Status", to: "/status", icon: <Globe className="h-3.5 w-3.5" /> },
                  { label: "Release Notes", to: "/releases", icon: <Sparkles className="h-3.5 w-3.5" /> },
                ].map(({ label, to, icon }) => (
                  <li key={to}>
                    <Link to={to} className="flex items-center gap-2.5 text-[13px] text-zinc-500 hover:text-zinc-200 transition-colors group">
                      <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors">{icon}</span>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company column */}
            <div>
              <h5 className="mb-6 text-[11px] font-black uppercase tracking-[0.14em] text-zinc-300">Company</h5>
              <ul className="space-y-3.5">
                {[
                  { label: "About AetherFlow", to: "/about", icon: <Users className="h-3.5 w-3.5" /> },
                  { label: "Security", to: "/security", icon: <Shield className="h-3.5 w-3.5" /> },
                  { label: "Privacy Policy", to: "/privacy", icon: <FileText className="h-3.5 w-3.5" /> },
                  { label: "Terms of Service", to: "/terms", icon: <FileText className="h-3.5 w-3.5" /> },
                ].map(({ label, to, icon }) => (
                  <li key={to}>
                    <Link to={to} className="flex items-center gap-2.5 text-[13px] text-zinc-500 hover:text-zinc-200 transition-colors group">
                      <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors">{icon}</span>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/[0.05]">
            <p className="text-[12px] text-zinc-600 font-medium">
              &copy; 2026 AetherFlow Enterprise, Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-[12px] text-zinc-600">
              <Link to="/privacy" className="hover:text-zinc-400 transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-zinc-400 transition-colors">Terms</Link>
              <Link to="/security" className="hover:text-zinc-400 transition-colors">Security</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* Local icon used inside component only */
function MessageSquare({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
