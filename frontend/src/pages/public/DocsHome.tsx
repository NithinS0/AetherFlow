import { Link } from "react-router-dom";
import { PublicLayout } from "../../layouts/PublicLayout";
import { BookOpen, Zap, Server, Cpu, Bot, Code, BarChart2, ArrowRight, ChevronRight } from "lucide-react";

const sections = [
  { icon: <Zap className="w-5 h-5 text-yellow-400" />, title: "Getting Started", desc: "Install AetherFlow, configure your Supabase database, and process your first job in under 5 minutes.", href: "/docs#getting-started" },
  { icon: <BookOpen className="w-5 h-5 text-indigo-400" />, title: "Architecture Overview", desc: "Understand the scheduler engine, worker pool, queue router, and reliability layer components.", href: "/docs#architecture" },
  { icon: <Server className="w-5 h-5 text-cyan-400" />, title: "Queue Management", desc: "Create queues, set priorities, configure concurrency limits, and attach retry policies.", href: "/platform/queue-management" },
  { icon: <Zap className="w-5 h-5 text-emerald-400" />, title: "Job Scheduling", desc: "Schedule immediate, delayed, cron, batch, and dependency-graph jobs via REST API.", href: "/platform/job-scheduler" },
  { icon: <Cpu className="w-5 h-5 text-rose-400" />, title: "Worker Configuration", desc: "Deploy stateless workers, configure heartbeats, set concurrency limits, and enable graceful shutdown.", href: "/platform/workers" },
  { icon: <Bot className="w-5 h-5 text-violet-400" />, title: "AI Operations", desc: "Use OpsGPT for natural language queue diagnostics, AI recommendations, and automated incident triage.", href: "/docs#ai" },
  { icon: <Code className="w-5 h-5 text-amber-400" />, title: "REST API Reference", desc: "Complete API documentation with authentication, endpoints, request/response examples, and SDKs.", href: "/api-reference" },
  { icon: <BarChart2 className="w-5 h-5 text-teal-400" />, title: "Analytics & Monitoring", desc: "Set up throughput dashboards, configure alert thresholds, and integrate with Grafana or Datadog.", href: "/platform/analytics" },
];

const quickstart = [
  { step: "1", title: "Create a Project", desc: "Organise your queues and workers under a named project." },
  { step: "2", title: "Define a Queue", desc: "Configure priority, concurrency, and retry policy." },
  { step: "3", title: "Register Workers", desc: "Deploy stateless worker processes pointing at your queue." },
  { step: "4", title: "Enqueue Jobs", desc: "POST job payloads to the REST API and watch them execute." },
];

export function DocsHome() {
  return (
    <PublicLayout breadcrumbs={[{ label: "Documentation" }]}>
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-400/20 bg-indigo-400/5 text-[11px] font-bold uppercase tracking-widest text-indigo-300 mb-6">
          <BookOpen className="w-3.5 h-3.5" /> Documentation
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-5">
          AetherFlow Enterprise<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Documentation</span>
        </h1>
        <p className="text-[16px] text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-8">
          Everything you need to build, deploy, and operate distributed job scheduling pipelines with AetherFlow Enterprise.
        </p>
        <div className="relative max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search documentation..."
            className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200 placeholder-zinc-600 text-[14px] focus:outline-none focus:border-primary/50"
          />
        </div>
      </section>

      {/* Quickstart */}
      <section className="max-w-5xl mx-auto px-6 mb-20">
        <div className="glass-panel border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-extrabold text-white mb-6">Quickstart — 5 minutes to first job</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {quickstart.map((s, i) => (
              <div key={i} className="flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary">{s.step}</div>
                <h3 className="text-[14px] font-bold text-white">{s.title}</h3>
                <p className="text-[12px] text-zinc-400 leading-relaxed">{s.desc}</p>
                {i < 3 && <ChevronRight className="hidden md:block absolute text-zinc-700 translate-x-[calc(100%+1rem)]" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doc sections */}
      <section className="max-w-6xl mx-auto px-6 mb-20">
        <h2 className="text-2xl font-extrabold text-white mb-2 text-center">Documentation Sections</h2>
        <p className="text-[14px] text-zinc-500 text-center mb-10">Deep-dive guides for every component of the AetherFlow platform.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sections.map((s, i) => (
            <Link key={i} to={s.href} className="glass-panel border border-white/5 rounded-2xl p-5 hover:border-primary/20 transition-all duration-300 group flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">{s.icon}</div>
              <h3 className="text-[14px] font-bold text-white group-hover:text-primary transition-colors">{s.title}</h3>
              <p className="text-[12px] text-zinc-400 leading-relaxed">{s.desc}</p>
              <span className="text-primary text-[12px] font-semibold flex items-center gap-1 mt-auto">Read more <ArrowRight className="w-3 h-3" /></span>
            </Link>
          ))}
        </div>
      </section>

      {/* Installation code */}
      <section className="max-w-3xl mx-auto px-6 mb-20">
        <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-white/[0.02]">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Installation</span>
            <div className="flex gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500/60" /><span className="w-3 h-3 rounded-full bg-amber-500/60" /><span className="w-3 h-3 rounded-full bg-emerald-500/60" /></div>
          </div>
          <div className="p-5 font-mono text-[13px] space-y-2">
            <div className="text-zinc-500"># Clone and install</div>
            <div><span className="text-emerald-400">$</span> <span className="text-zinc-300">git clone https://github.com/aetherflow/enterprise</span></div>
            <div><span className="text-emerald-400">$</span> <span className="text-zinc-300">cd enterprise && cp .env.example .env</span></div>
            <div><span className="text-emerald-400">$</span> <span className="text-zinc-300">docker compose up --build</span></div>
            <div className="text-emerald-400 mt-3">✓ AetherFlow running at http://localhost:3000</div>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 mb-20 text-center">
        <div className="glass-panel border border-primary/20 rounded-2xl p-10">
          <h2 className="text-2xl font-extrabold text-white mb-3">Need Help?</h2>
          <p className="text-[14px] text-zinc-400 mb-6">Check the API reference for endpoint details or access the in-platform OpsGPT assistant for AI-powered guidance.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/api-reference" className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-royal-glow text-[13px]">
              API Reference <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 px-6 py-2.5 border border-white/10 text-zinc-300 font-bold rounded-xl hover:bg-white/5 transition-colors text-[13px]">
              Open OpsGPT
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
