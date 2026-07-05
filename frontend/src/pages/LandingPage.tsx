import { Link } from "react-router-dom";
import { ArrowRight, Shield, Zap, Activity, Users, Command, Terminal, Cpu, Server, Code, Sparkles, Globe, FileText } from "lucide-react";
import { BrandLogo } from "../components/BrandLogo";

export function LandingPage() {
  return (
    <div className="bg-background text-zinc-300 font-sans overflow-x-hidden w-full selection:bg-primary/30 selection:text-white">
      {/* Dynamic Ambient Background Mesh */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[1000px] h-[800px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 translate-x-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[900px] h-[900px] bg-secondary/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Grid Pattern overlay (force dark mode grid lines) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <nav className="w-full flex items-center justify-between px-8 md:px-16 xl:px-24 py-5">
          <div className="flex items-center gap-3">
            <BrandLogo variant="full" forceDark={true} className="h-16  md:h-20 w-auto object-contain" />
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/platform/queue-management" className="text-sm font-semibold text-zinc-400 hover:text-zinc-100 transition-colors">Platform</Link>
            <Link to="/docs" className="text-sm font-semibold text-zinc-400 hover:text-zinc-100 transition-colors">Documentation</Link>
            <Link to="/about" className="text-sm font-semibold text-zinc-400 hover:text-zinc-100 transition-colors">Company</Link>
          </div>

          <div className="flex items-center gap-6">
            <Link
              to="/login"
              className="text-sm font-semibold text-zinc-400 hover:text-zinc-100 transition-colors hidden sm:block"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-black text-sm font-bold rounded-xl shadow-xl transition-all flex items-center gap-2"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-8 md:px-16 xl:px-24 pt-32 pb-24 w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-white/10 text-xs uppercase font-bold tracking-widest text-zinc-400 mb-10 backdrop-blur-md shadow-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-450 pulse-active" />
          System Status: Fully Operational
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-[80px] font-extrabold tracking-tighter text-white mb-8 leading-[1.1] max-w-5xl font-sans">
          Distributed Orchestration <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary drop-shadow-lg">
            Engineered for Scale
          </span>
        </h1>

        <p className="text-base md:text-xl text-zinc-400 max-w-3xl mb-14 leading-relaxed font-sans font-medium">
          AetherFlow Enterprise unifies high-throughput job scheduling, real-time worker telemetry, failover resilience, and AI-driven observability into one premium distributed SaaS control plane.
        </p>

        <div className="flex flex-col sm:flex-row gap-5 mb-28">
          <Link
            to="/login"
            className="px-8 py-4 bg-white text-black hover:bg-zinc-200 hover:scale-105 text-base font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-2xl shadow-white/10 border border-white/10"
          >
            <Terminal className="w-5 h-5" /> Start Free Trial
          </Link>
          <Link
            to="/docs"
            className="px-8 py-4 bg-zinc-900/60 hover:bg-zinc-800 hover:scale-105 text-zinc-300 border border-white/10 text-base font-bold rounded-xl transition-all flex items-center justify-center gap-2 backdrop-blur-md"
          >
            <Command className="w-5 h-5" /> Explore Documentation
          </Link>
        </div>

        {/* Visual Architectural Preview Card */}
        <div className="w-full glass-panel border border-white/10 p-2.5 rounded-[2rem] shadow-card-glow mb-32 bg-zinc-950/40 backdrop-blur-xl relative mx-auto max-w-7xl">
          <div className="absolute -top-4 left-8 px-4 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-[11px] uppercase tracking-widest font-mono text-indigo-400 font-bold shadow-lg">
            Live Topology Visualizer
          </div>
          <div className="border border-white/5 rounded-[1.5rem] bg-zinc-950/80 p-10 flex flex-col md:flex-row items-center justify-around gap-8 min-h-[260px]">
            <div className="flex flex-col items-center p-6 rounded-2xl border border-white/5 bg-zinc-900/50 w-full md:w-64 text-left relative overflow-hidden transition-all hover:bg-zinc-900/80">
              <span className="w-2 h-2 rounded-full bg-indigo-400 absolute top-4 right-4 animate-ping" />
              <Server className="w-10 h-10 text-primary mb-4" />
              <h4 className="text-sm font-extrabold text-white uppercase font-mono tracking-tight">Job Coordinator</h4>
              <p className="text-xs text-zinc-500 mt-2 leading-relaxed font-sans text-center">SKIP LOCKED row claims. Concurrency tracking.</p>
            </div>

            <div className="hidden md:block text-zinc-700 font-mono text-2xl animate-pulse">➔</div>

            <div className="flex flex-col items-center p-6 rounded-2xl border border-white/5 bg-zinc-900/50 w-full md:w-64 text-left relative transition-all hover:bg-zinc-900/80">
              <Globe className="w-10 h-10 text-cyan-400 mb-4" />
              <h4 className="text-sm font-extrabold text-white uppercase font-mono tracking-tight">Operations Cluster</h4>
              <p className="text-xs text-zinc-500 mt-2 leading-relaxed font-sans text-center">Heartbeat monitor feed. Microsecond task routes.</p>
            </div>

            <div className="hidden md:block text-zinc-700 font-mono text-2xl animate-pulse">➔</div>

            <div className="flex flex-col items-center p-6 rounded-2xl border border-white/5 bg-zinc-900/50 w-full md:w-64 text-left relative transition-all hover:bg-zinc-900/80">
              <Code className="w-10 h-10 text-accent mb-4" />
              <h4 className="text-sm font-extrabold text-white uppercase font-mono tracking-tight">Self-Healing SRE</h4>
              <p className="text-xs text-zinc-500 mt-2 leading-relaxed font-sans text-center">Exponential backoff strategy. Dead letter cues.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Feature Section */}
      <section className="relative z-10 w-full px-8 md:px-16 xl:px-24 py-28 border-t border-white/5">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-extrabold text-white tracking-tight font-sans">Enterprise-Grade Performance</h2>
          <p className="text-lg text-zinc-500 max-w-2xl mx-auto mt-4 font-sans font-medium">
            Guaranteed zero duplicate executions, sub-millisecond task coordination, and deep self-healing capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Zap className="w-6 h-6 text-indigo-400" />}
            title="Atomic Task Claiming"
            desc="Row-level PostgreSQL locks (SKIP LOCKED) ensure that a single job is never executed by multiple competing workers simultaneously."
          />
          <FeatureCard
            icon={<Shield className="w-6 h-6 text-emerald-450" />}
            title="Self-Healing Recovery"
            desc="The Reliability Engine actively monitors worker heartbeats, instantly reassigning dead jobs to healthy nodes in the event of OOM crashes."
          />
          <FeatureCard
            icon={<Activity className="w-6 h-6 text-cyan-400" />}
            title="Real-Time Telemetry"
            desc="WebSocket streaming powers the Operations Center, allowing operators to monitor queue depths and execution throughput instantly."
          />
          <FeatureCard
            icon={<Cpu className="w-6 h-6 text-rose-400" />}
            title="AI Intelligence Layer"
            desc="LangGraph-powered AI agents continuously analyze failures, recommend configuration optimizations, and explain stack traces via OpsGPT."
          />
          <FeatureCard
            icon={<Users className="w-6 h-6 text-indigo-450" />}
            title="Native Collaboration"
            desc="Contextual incident management and team chat channels eliminate context-switching. Operators discuss and approve actions natively."
          />
          <FeatureCard
            icon={<Command className="w-6 h-6 text-purple-400" />}
            title="Extensible Architecture"
            desc="Write custom Python plugins, build interactive DAG workflows with React Flow, and manage API keys for programmatic external access."
          />
        </div>
      </section>

      {/* Metrics Highlights Section */}
      <section className="relative z-10 w-full px-8 md:px-16 xl:px-24 py-24 border-y border-white/5 bg-zinc-950/40 backdrop-blur-xl mb-32">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div className="space-y-2">
            <span className="text-5xl font-extrabold text-white font-mono tracking-tight">99.999%</span>
            <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest mt-2">Uptime SLA</p>
          </div>
          <div className="space-y-2">
            <span className="text-5xl font-extrabold text-primary font-mono tracking-tight">&lt; 1.2ms</span>
            <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest mt-2">Task Latency</p>
          </div>
          <div className="space-y-2">
            <span className="text-5xl font-extrabold text-accent font-mono tracking-tight">10M+</span>
            <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest mt-2">Daily Jobs Executed</p>
          </div>
          <div className="space-y-2">
            <span className="text-5xl font-extrabold text-emerald-450 font-mono tracking-tight">0</span>
            <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest mt-2">Duplicate Executions</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative z-10 w-full max-w-[1600px] mx-auto px-8 md:px-16 xl:px-24 py-28 text-center mb-32 border border-white/10 rounded-[2.5rem] bg-gradient-to-b from-zinc-900/80 to-background shadow-2xl backdrop-blur-xl">
        <Sparkles className="w-12 h-12 text-primary mx-auto mb-8 animate-pulse" />
        <h3 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6 font-sans">Ready to Scale Your Infrastructure?</h3>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Get started with AetherFlow Enterprise today and build fault-tolerant workflow scheduling pipelines that can scale infinitely.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/login"
            className="px-10 py-4 bg-primary hover:bg-primary-dark text-white font-bold text-lg rounded-xl transition-all shadow-royal-glow border border-white/10 hover:scale-105"
          >
            Access Operations Control
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 mt-16 border-t border-white/10 bg-zinc-950 px-8 md:px-16 xl:px-24 py-20 text-zinc-200 shadow-[0_-20px_80px_rgba(34,197,255,0.05)]">
        <div className="pointer-events-none absolute inset-0 border-t border-cyan-300/5" />
        <div className="pointer-events-none absolute -top-12 left-1/4 h-40 w-40 rounded-full bg-primary/10 blur-[100px]" />
        <div className="pointer-events-none absolute -top-10 right-1/4 h-36 w-36 rounded-full bg-accent/10 blur-[100px]" />

        <div className="relative flex w-full flex-col gap-16 lg:flex-row lg:justify-between items-start">

          {/* Brand Column - 40% */}
          <div className="lg:w-[40%] space-y-8">
            <div className="flex items-center gap-4">
              <BrandLogo variant="full" forceDark={true} className="h-16 w-auto object-contain" />
            </div>
            <p className="max-w-md text-lg font-bold leading-relaxed text-zinc-100">
              Enterprise AI-Native Distributed Job Scheduling &amp; Operations Platform.
            </p>
            <p className="max-w-md text-base font-medium leading-relaxed text-zinc-400">
              Build, schedule, monitor, and optimize distributed workloads with real-time operations, AI-powered insights, and enterprise-grade reliability.
            </p>
          </div>

          {/* Links Grid - 60% (3 Columns) */}
          <div className="lg:w-[60%] grid grid-cols-1 gap-12 sm:grid-cols-3">

            {/* Platform Column */}
            <div>
              <h5 className="mb-6 text-sm font-extrabold uppercase tracking-widest text-zinc-100">Platform</h5>
              <ul className="space-y-4 text-base font-medium text-zinc-400">
                <li>
                  <Link to="/platform/queue-management" className="inline-flex items-center gap-2.5 transition-colors hover:text-white">
                    <Server className="h-4 w-4" /> Queue Management
                  </Link>
                </li>
                <li>
                  <Link to="/platform/job-scheduler" className="inline-flex items-center gap-2.5 transition-colors hover:text-white">
                    <Terminal className="h-4 w-4" /> Job Scheduler
                  </Link>
                </li>
                <li>
                  <Link to="/platform/workers" className="inline-flex items-center gap-2.5 transition-colors hover:text-white">
                    <Cpu className="h-4 w-4" /> Worker Orchestration
                  </Link>
                </li>
                <li>
                  <Link to="/platform/analytics" className="inline-flex items-center gap-2.5 transition-colors hover:text-white">
                    <Activity className="h-4 w-4" /> Analytics &amp; Monitoring
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h5 className="mb-6 text-sm font-extrabold uppercase tracking-widest text-zinc-100">Resources</h5>
              <ul className="space-y-4 text-base font-medium text-zinc-400">
                <li>
                  <Link to="/docs" className="inline-flex items-center gap-2.5 transition-colors hover:text-white">
                    <FileText className="h-4 w-4" /> Documentation
                  </Link>
                </li>
                <li>
                  <Link to="/api-reference" className="inline-flex items-center gap-2.5 transition-colors hover:text-white">
                    <Code className="h-4 w-4" /> REST API
                  </Link>
                </li>
                <li>
                  <Link to="/status" className="inline-flex items-center gap-2.5 transition-colors hover:text-white">
                    <Globe className="h-4 w-4" /> System Status
                  </Link>
                </li>
                <li>
                  <Link to="/releases" className="inline-flex items-center gap-2.5 transition-colors hover:text-white">
                    <Sparkles className="h-4 w-4" /> Release Notes
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h5 className="mb-6 text-sm font-extrabold uppercase tracking-widest text-zinc-100">Company</h5>
              <ul className="space-y-4 text-base font-medium text-zinc-400">
                <li>
                  <Link to="/about" className="inline-flex items-center gap-2.5 transition-colors hover:text-white">
                    <Users className="h-4 w-4" /> About
                  </Link>
                </li>
                <li>
                  <Link to="/security" className="inline-flex items-center gap-2.5 transition-colors hover:text-white">
                    <Shield className="h-4 w-4" /> Security
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="inline-flex items-center gap-2.5 transition-colors hover:text-white">
                    <FileText className="h-4 w-4" /> Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="inline-flex items-center gap-2.5 transition-colors hover:text-white">
                    <FileText className="h-4 w-4" /> Terms
                  </Link>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Footer Bottom */}
        <div className="relative flex w-full flex-col gap-4 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-medium text-zinc-500">
            &copy; 2026 AetherFlow Enterprise. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm font-medium text-zinc-500">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500" /> All systems operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 bg-zinc-900/40 border border-white/5 rounded-[1.5rem] hover:bg-zinc-900/80 hover:border-primary/50 transition-all duration-300 group shadow-lg flex flex-col backdrop-blur-sm">
      <div className="w-12 h-12 bg-zinc-950 border border-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/20 transition-all shrink-0">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white mb-3 font-sans tracking-tight">{title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed font-sans">{desc}</p>
    </div>
  );
}
