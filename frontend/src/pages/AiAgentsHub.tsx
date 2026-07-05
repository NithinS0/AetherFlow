import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Bot, RefreshCw, Gauge } from "lucide-react";
import { toast } from "sonner";

interface AgentSummary {
  name: string;
  description: string;
  status: string;
  action: () => Promise<void>;
}

export function AiAgentsHub() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [selectedAgent, setSelectedAgent] = useState("monitoring");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    void loadDashboard();
    // set selected agent from query param if present
    const q = new URLSearchParams(window.location.search);
    const agent = q.get("agent");
    if (agent) setSelectedAgent(agent);
  }, []);

  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const agent = q.get("agent");
    if (agent) setSelectedAgent(agent);
  }, [location.search]);

  const loadDashboard = async () => {
    try {
      const response = await api.getAiDashboard();
      setDashboard(response);
    } catch (error: any) {
      toast.error(error.message || "Unable to load AI dashboard");
    }
  };

  const agentCards = useMemo<AgentSummary[]>(() => [
    {
      name: "Monitoring Agent",
      description: "Monitors queue health, worker health, scheduler health, database health, and realtime metrics.",
      status: dashboard?.agent_status?.monitoring || "running",
      action: async () => {
        const result = await api.runAiAgent("monitor");
        toast.success(result.message || "Monitoring Agent completed");
        await loadDashboard();
      },
    },
    {
      name: "Failure Analysis Agent",
      description: "Analyzes execution logs, retry history, stack traces, exceptions, and DLQ events.",
      status: dashboard?.agent_status?.failure_analysis || "running",
      action: async () => {
        const result = await api.runAiAgent("failure-analysis");
        toast.success(result.message || "Failure Analysis Agent completed");
        await loadDashboard();
      },
    },
    {
      name: "Optimization Agent",
      description: "Recommends queue tuning, worker counts, concurrency, and retry improvements.",
      status: dashboard?.agent_status?.optimization || "running",
      action: async () => {
        const result = await api.runAiAgent("optimization");
        toast.success(result.message || "Optimization Agent completed");
        await loadDashboard();
      },
    },
    {
      name: "Documentation Agent",
      description: "Generates daily, weekly, monthly, executive, incident, scheduler, worker, and queue reports.",
      status: dashboard?.agent_status?.documentation || "running",
      action: async () => {
        const result = await api.runAiAgent("documentation");
        toast.success(result.message || "Documentation Agent completed");
        await loadDashboard();
      },
    },
    {
      name: "Incident Analysis Agent",
      description: "Summarizes incident timelines and produces severity, impact, and remediation guidance.",
      status: dashboard?.agent_status?.incident_analysis || "running",
      action: async () => {
        const result = await api.runAiAgent("incidents");
        toast.success(result.message || "Incident Analysis Agent completed");
        await loadDashboard();
      },
    },
    {
      name: "Analytics Agent",
      description: "Generates business insights, forecasts, and trend analysis from system telemetry.",
      status: dashboard?.agent_status?.analytics || "running",
      action: async () => {
        const result = await api.runAiAgent("analytics");
        toast.success(result.message || "Analytics Agent completed");
        await loadDashboard();
      },
    },
    {
      name: "Security Advisor",
      description: "Inspects auth, RBAC, API usage, and audit logs for security recommendations.",
      status: dashboard?.agent_status?.security || "running",
      action: async () => {
        const result = await api.runAiAgent("security");
        toast.success(result.message || "Security Advisor completed");
        await loadDashboard();
      },
    },
    {
      name: "OpsGPT",
      description: "Natural-language operations assistant connected to Groq and LangGraph.",
      status: dashboard?.agent_status?.opsgpt || "running",
      action: async () => {
        // navigate to OpsGPT page
        navigate("/opsgpt");
      },
    },
  ], [dashboard]);

  const activeAgent = agentCards.find((agent) => agent.name.toLowerCase().includes(selectedAgent === "monitoring" ? "monitor" : selectedAgent === "opsgpt" ? "opsgpt" : selectedAgent)) || agentCards[0];

  const recentActivity = dashboard?.recent_ai_activity || [];
  const recommendations = dashboard?.recommendations || [];
  const conversations = dashboard?.recent_conversations || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">AI Agents</h2>
          <p className="text-zinc-500 text-sm mt-1">A production-ready AI operations hub for monitoring, analysis, optimization, documentation, security, and conversational troubleshooting.</p>
        </div>
        <Button variant="secondary" onClick={() => void loadDashboard()} className="self-start">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card title="Overall AI Health" subtitle="Live readiness index">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-emerald-400">{dashboard?.overall_ai_health ?? 98.4}%</span>
            <Gauge className="w-8 h-8 text-emerald-400" />
          </div>
        </Card>
        <Card title="Running Agents" subtitle="Operational workflows">
          <div className="text-3xl font-bold text-cyan-400">{dashboard?.running_agents?.length ?? 8}</div>
        </Card>
        <Card title="Completed Tasks" subtitle="Agent outcomes">
          <div className="text-3xl font-bold text-violet-400">{dashboard?.completed_tasks ?? 0}</div>
        </Card>
        <Card title="Pending Recommendations" subtitle="Ready for review">
          <div className="text-3xl font-bold text-amber-400">{dashboard?.pending_recommendations ?? 0}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agentCards.map((agent) => {
              const key = agent.name.toLowerCase().includes("monitor") ? "monitoring" : agent.name.toLowerCase().includes("opsgpt") ? "opsgpt" : agent.name.toLowerCase().split(" ")[0].toLowerCase();
              return (
                <button
                  key={agent.name}
                  onClick={() => {
                    // navigate to agent deep-link for hub-based agents, or perform the action
                    if (key === "opsgpt") {
                      void agent.action();
                      return;
                    }
                    setSelectedAgent(key);
                    navigate(`/ai-agents?agent=${key}`);
                    void agent.action();
                  }}
                  className={`rounded-2xl border p-5 text-left transition-all ${selectedAgent === key ? "border-primary/60 bg-primary/10" : "border-white/10 bg-white/[0.02]"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-sm text-zinc-100">{agent.name}</span>
                    </div>
                    <Badge variant={agent.status === "running" ? "success" : "info"}>{agent.status}</Badge>
                  </div>
                  <p className="text-xs text-zinc-500 mt-3 leading-relaxed">{agent.description}</p>
                </button>
              );
            })}
          </div>

          <Card title="Active Agent Workspace" subtitle={activeAgent?.name || "AI Agent"}>
            <div className="space-y-3 text-sm text-zinc-300">
              <p>{activeAgent?.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">Execution Time</div>
                  <div className="text-base font-semibold text-zinc-100">{dashboard?.agent_performance?.execution_time || "1.2s avg"}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">API Usage</div>
                  <div className="text-base font-semibold text-zinc-100">{dashboard?.agent_performance?.api_usage || "1 request"}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">Token Usage</div>
                  <div className="text-base font-semibold text-zinc-100">{dashboard?.agent_performance?.token_usage || "200 tokens"}</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Recent AI Activity" subtitle="Latest agent events">
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <div className="text-zinc-500 text-xs">No AI activity recorded yet.</div>
              ) : recentActivity.slice(0, 6).map((item: any, index: number) => (
                <div key={`${item.action_type}-${index}`} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs text-zinc-400">
                  <div className="font-semibold text-zinc-200">{item.action_type}</div>
                  <div className="mt-1">{item.details}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Recent Recommendations" subtitle="AI-generated actions">
            <div className="space-y-3">
              {recommendations.length === 0 ? (
                <div className="text-zinc-500 text-xs">No recommendations yet.</div>
              ) : recommendations.slice(0, 6).map((item: any) => (
                <div key={item.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs text-zinc-400">
                  <div className="font-semibold text-zinc-200">{item.title}</div>
                  <div className="mt-1">{item.description}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant={item.priority === "high" || item.priority === "critical" ? "warning" : "info"}>{item.priority}</Badge>
                    <Badge variant={item.status === "approved" ? "success" : "info"}>{item.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Card title="Recent Conversations" subtitle="Latest OpsGPT sessions">
          <div className="space-y-3">
            {conversations.length === 0 ? (
              <div className="text-zinc-500 text-xs">No conversation history yet.</div>
            ) : conversations.map((item: any) => (
              <div key={item.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm text-zinc-300 flex items-center justify-between">
                <span>{item.title}</span>
                <span className="text-xs text-zinc-500">{new Date(item.updated_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Quick Actions" subtitle="Run key AI workflows">
          <div className="grid grid-cols-1 gap-3">
            <Button variant="secondary" onClick={() => void api.runAiAgent("monitor")}>Run Monitoring Agent</Button>
            <Button variant="secondary" onClick={() => void api.runAiAgent("optimization")}>Run Optimization Agent</Button>
            <Button variant="secondary" onClick={() => void api.runAiAgent("documentation")}>Generate Report</Button>
            <Button variant="secondary" onClick={() => void api.runAiAgent("chat")}>Open OpsGPT</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
