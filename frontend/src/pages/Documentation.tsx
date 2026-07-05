import { BookOpen, Server, Activity, Shield, Code, Plug, Cpu, GitMerge } from "lucide-react";

export function Documentation() {
  const sections = [
    {
      title: "Getting Started",
      icon: BookOpen,
      content: "AetherFlow Enterprise is a distributed job scheduling and reliability platform. To get started, create a Project, define a Queue, and attach Worker nodes to begin processing payloads."
    },
    {
      title: "Architecture & Scalability",
      icon: Server,
      content: "The system is built on a scalable, event-driven architecture using Python (FastAPI) and React. It supports high-concurrency workloads via async job processing and Redis-backed state management."
    },
    {
      title: "Worker Execution Engine",
      icon: Cpu,
      content: "Workers pull jobs from specific Queues using long-polling. The engine guarantees 'at-least-once' delivery and uses atomic locking to prevent duplicate job execution across the distributed cluster."
    },
    {
      title: "Reliability & Chaos Engineering",
      icon: Shield,
      content: "The Reliability module automatically detects crashed workers and dead-letter queues failed jobs. Chaos Engineering allows administrators to inject artificial faults to test platform resilience."
    },
    {
      title: "API Integration",
      icon: Code,
      content: "AetherFlow provides a complete REST API. Generate API keys in Integration API settings to authenticate external services. The platform follows OpenAPI v3 specifications."
    },
    {
      title: "Workflow Automation",
      icon: GitMerge,
      content: "Use the React Flow drag-and-drop builder to construct complex DAGs (Directed Acyclic Graphs). Support conditional branching and parallel execution sequences."
    },
    {
      title: "Operations & Analytics",
      icon: Activity,
      content: "The Operations Center provides real-time telemetry. The Analytics BI engine aggregates historical data, calculating KPIs, throughput trends, and AI-driven resource recommendations."
    },
    {
      title: "Plugin Ecosystem",
      icon: Plug,
      content: "Extend AetherFlow without modifying core code. Install isolated plugins for specific tasks like Email Delivery, Webhook Dispatch, or custom data transformations."
    }
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-[1000px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-6">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Platform Documentation</h1>
            <p className="text-gray-400 text-sm mt-1">Official guide for administrators, operators, and viewers.</p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <div key={idx} className="bg-gray-800/40 border border-white/10 rounded-xl p-6 hover:border-blue-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">{section.title}</h2>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {section.content}
                </p>
                <div className="mt-6 flex justify-end">
                  <button className="text-blue-400 text-xs font-semibold hover:text-blue-300">
                    Read More &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/30 rounded-xl p-8 text-center mt-12">
          <h2 className="text-xl font-bold text-white mb-2">Need API Specifications?</h2>
          <p className="text-blue-200/70 text-sm mb-6">
            Interactive Swagger documentation and endpoint schemas are available via the Integration API workspace.
          </p>
          <a href="/docs" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">
            <Code className="w-4 h-4" /> Open Swagger UI
          </a>
        </div>
      </div>
    </div>
  );
}
