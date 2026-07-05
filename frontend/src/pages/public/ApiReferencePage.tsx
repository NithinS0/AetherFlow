import { Link } from "react-router-dom";
import { PublicLayout } from "../../layouts/PublicLayout";
import { Code, ArrowRight, Lock, ChevronDown } from "lucide-react";
import { useState } from "react";

const endpoints = [
  { method: "POST", path: "/api/v1/jobs", desc: "Enqueue a new job", auth: true },
  { method: "GET", path: "/api/v1/jobs", desc: "List jobs with filtering and pagination", auth: true },
  { method: "GET", path: "/api/v1/jobs/:id", desc: "Get a specific job by ID", auth: true },
  { method: "DELETE", path: "/api/v1/jobs/:id", desc: "Cancel a pending job", auth: true },
  { method: "GET", path: "/api/v1/queues", desc: "List all queues in the current project", auth: true },
  { method: "POST", path: "/api/v1/queues", desc: "Create a new queue", auth: true },
  { method: "PATCH", path: "/api/v1/queues/:id", desc: "Update queue configuration", auth: true },
  { method: "GET", path: "/api/v1/workers", desc: "List all registered workers", auth: true },
  { method: "GET", path: "/api/v1/analytics/throughput", desc: "Get throughput metrics", auth: true },
  { method: "GET", path: "/api/v1/health", desc: "Platform health check", auth: false },
];

const methodColor: Record<string, string> = {
  GET: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  POST: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  PATCH: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  DELETE: "text-rose-400 bg-rose-400/10 border-rose-400/20",
};

export function ApiReferencePage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <PublicLayout breadcrumbs={[{ label: "Resources" }, { label: "REST API Reference" }]}>
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-400/20 bg-amber-400/5 text-[11px] font-bold uppercase tracking-widest text-amber-300 mb-6">
          <Code className="w-3.5 h-3.5" /> REST API Reference
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-5">
          AetherFlow<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">API Reference</span>
        </h1>
        <p className="text-[16px] text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-8">
          Full REST API documentation for AetherFlow Enterprise. Authenticate with a Bearer token and start managing jobs, queues, and workers programmatically.
        </p>
        <div className="flex items-center justify-center gap-2 text-[13px] text-zinc-400 font-mono border border-white/10 rounded-xl px-5 py-3 bg-white/[0.02] w-fit mx-auto">
          <span className="text-zinc-600">Base URL</span>
          <span className="text-cyan-300">https://your-deployment.supabase.co/functions/v1</span>
        </div>
      </section>

      {/* Authentication */}
      <section className="max-w-4xl mx-auto px-6 mb-12">
        <h2 className="text-xl font-extrabold text-white mb-4">Authentication</h2>
        <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5 bg-white/[0.02] flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" />
            <span className="text-[13px] font-bold text-white">Bearer Token Authentication</span>
          </div>
          <div className="p-5 font-mono text-[13px] space-y-3">
            <p className="text-zinc-400">Generate an API key in Integration API → API Keys. Include it in every request header:</p>
            <div className="bg-black/30 rounded-xl p-4 text-zinc-300">
              <div className="text-zinc-500"># Include in request headers</div>
              <div><span className="text-indigo-300">Authorization</span>: <span className="text-emerald-300">Bearer YOUR_API_KEY</span></div>
              <div><span className="text-indigo-300">Content-Type</span>: <span className="text-emerald-300">application/json</span></div>
              <div><span className="text-indigo-300">X-Organization-ID</span>: <span className="text-emerald-300">your-org-id</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section className="max-w-4xl mx-auto px-6 mb-16">
        <h2 className="text-xl font-extrabold text-white mb-4">Endpoints</h2>
        <div className="space-y-2">
          {endpoints.map((ep, i) => (
            <div key={i} className="glass-panel border border-white/5 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full px-5 py-3.5 flex items-center gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors text-left"
              >
                <span className={`text-[11px] font-black px-2.5 py-0.5 rounded border font-mono ${methodColor[ep.method]}`}>{ep.method}</span>
                <span className="font-mono text-[13px] text-zinc-200 flex-1">{ep.path}</span>
                <span className="text-[12px] text-zinc-500 flex-1 hidden md:block">{ep.desc}</span>
                {ep.auth && <Lock className="w-3.5 h-3.5 text-amber-400/60" />}
                <ChevronDown className={`w-4 h-4 text-zinc-600 transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && (
                <div className="px-5 pb-5 border-t border-white/5 pt-4 font-mono text-[12px] space-y-3">
                  <p className="text-zinc-400 font-sans text-[13px]">{ep.desc}. Returns paginated results with cursor-based navigation.</p>
                  <div className="bg-black/30 rounded-xl p-4 text-zinc-300 overflow-x-auto">
                    <div className="text-zinc-500"># Example request</div>
                    <div><span className="text-cyan-300">curl</span> -X <span className="text-amber-300">{ep.method}</span> \</div>
                    <div>  -H <span className="text-emerald-300">"Authorization: Bearer $API_KEY"</span> \</div>
                    <div>  <span className="text-zinc-300">"https://api.aetherflow.io{ep.path}"</span></div>
                  </div>
                  <div className="bg-black/30 rounded-xl p-4 overflow-x-auto">
                    <div className="text-zinc-500 mb-2"># Response</div>
                    <div className="text-emerald-300">{"{ \"status\": \"success\", \"data\": [...], \"meta\": { \"total\": 100, \"cursor\": \"...\" } }"}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Status codes */}
      <section className="max-w-4xl mx-auto px-6 mb-16">
        <h2 className="text-xl font-extrabold text-white mb-4">Status Codes</h2>
        <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden">
          {[
            { code: "200", text: "OK", desc: "Request succeeded" },
            { code: "201", text: "Created", desc: "Resource created successfully" },
            { code: "400", text: "Bad Request", desc: "Invalid request payload or parameters" },
            { code: "401", text: "Unauthorized", desc: "Missing or invalid API key" },
            { code: "403", text: "Forbidden", desc: "API key lacks required permissions" },
            { code: "404", text: "Not Found", desc: "Resource does not exist" },
            { code: "429", text: "Rate Limited", desc: "Request rate limit exceeded" },
            { code: "500", text: "Server Error", desc: "Internal server error — contact support" },
          ].map((s, i) => (
            <div key={i} className={`flex items-center gap-5 px-5 py-3 text-[13px] ${i < 7 ? "border-b border-white/5" : ""}`}>
              <span className={`font-mono font-black w-10 ${parseInt(s.code) < 400 ? "text-emerald-400" : parseInt(s.code) < 500 ? "text-amber-400" : "text-rose-400"}`}>{s.code}</span>
              <span className="font-bold text-white w-32">{s.text}</span>
              <span className="text-zinc-400">{s.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 mb-20 text-center">
        <div className="glass-panel border border-primary/20 rounded-2xl p-10">
          <h2 className="text-2xl font-extrabold text-white mb-3">Generate your API key</h2>
          <p className="text-[14px] text-zinc-400 mb-6">Create an API key in the AetherFlow platform and start integrating in minutes.</p>
          <Link to="/login" className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-royal-glow">
            Open Integration API <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
