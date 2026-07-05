import { useEffect, useState, useRef } from "react";
import { useStore } from "../stores/store";
import { api } from "../services/api";
import {
  AlertTriangle, Plus, Activity, CheckCircle,
  Send, Zap, ShieldAlert,
  TrendingUp, BarChart2, Loader2, X
} from "lucide-react";
import { toast } from "sonner";

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  critical: { color: "#f53939ff", bg: "rgba(239,68,68,0.15)", label: "Critical" },
  high: { color: "#f97316", bg: "rgba(249,115,22,0.15)", label: "High" },
  medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.15)", label: "Medium" },
  low: { color: "#22c55e", bg: "rgba(34,197,94,0.12)", label: "Low" },
};

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  open: { color: "#ef4444", icon: AlertTriangle, label: "Open" },
  investigating: { color: "#f59e0b", icon: Activity, label: "Investigating" },
  in_progress: { color: "#3b82f6", icon: Loader2, label: "In Progress" },
  resolved: { color: "#22c55e", icon: CheckCircle, label: "Resolved" },
  closed: { color: "#6b7280", icon: X, label: "Closed" },
};

const TRIGGER_LABELS: Record<string, string> = {
  manual: "Manual",
  worker_crash: "Worker Crash",
  job_failure: "Job Failure",
  queue_congestion: "Queue Congestion",
  heartbeat_timeout: "Heartbeat Timeout",
};

function SeverityBadge({ severity }: { severity: string }) {
  const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.medium;
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: "2px 8px",
        borderRadius: 20,
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.color}30`,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
      }}
    >
      {cfg.label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.open;
  const Icon = cfg.icon;
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: 20,
        background: `${cfg.color}18`,
        color: cfg.color,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      <Icon size={10} />
      {cfg.label}
    </span>
  );
}

function TimelineItem({ comment }: { comment: any }) {
  const isSystemEvent = comment.comment_type !== "comment";
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        padding: "8px 0",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: isSystemEvent ? "rgba(139,92,246,0.15)" : "var(--surface-raised)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: 13,
        }}
      >
        {isSystemEvent ? "⚡" : "💬"}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5 }}>
          {comment.content}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
          {new Date(comment.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
}

function CreateIncidentModal({ onClose, onCreate }: { onClose: () => void; onCreate: (data: any) => void }) {
  const [form, setForm] = useState({ title: "", description: "", severity: "medium", trigger: "manual" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title is required");
    onCreate(form);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          background: "var(--surface-elevated)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 16,
          padding: 28,
          width: 500,
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
        }}
      >
        <h3 style={{ fontWeight: 700, fontSize: 17, color: "var(--text-primary)", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
          <AlertTriangle size={18} color="#ef4444" />
          Declare Incident
        </h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Briefly describe the incident"
              style={{
                width: "100%",
                padding: "9px 12px",
                background: "var(--surface-raised)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                color: "var(--text-primary)",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What is happening? Include as much context as possible."
              rows={3}
              style={{
                width: "100%",
                padding: "9px 12px",
                background: "var(--surface-raised)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                color: "var(--text-primary)",
                fontSize: 14,
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Severity</label>
              <select
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value })}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  background: "var(--surface-raised)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 8,
                  color: "var(--text-primary)",
                  fontSize: 14,
                  outline: "none",
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Trigger</label>
              <select
                value={form.trigger}
                onChange={(e) => setForm({ ...form, trigger: e.target.value })}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  background: "var(--surface-raised)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 8,
                  color: "var(--text-primary)",
                  fontSize: 14,
                  outline: "none",
                }}
              >
                <option value="manual">Manual Declaration</option>
                <option value="worker_crash">Worker Crash</option>
                <option value="job_failure">Job Failure</option>
                <option value="queue_congestion">Queue Congestion</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "9px 20px",
                borderRadius: 8,
                border: "1px solid var(--border-subtle)",
                background: "transparent",
                color: "var(--text-secondary)",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: "9px 24px",
                borderRadius: 8,
                border: "none",
                background: "linear-gradient(135deg, #ef4444, #b91c1c)",
                color: "white",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              Declare Incident
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Incidents() {
  const store = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [comment, setComment] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const timelineEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    store.fetchIncidents();
    const interval = setInterval(() => store.fetchIncidents(), 6000);
    return () => clearInterval(interval);
  }, []);

  // Auto-select first
  useEffect(() => {
    if (store.incidents.length > 0 && !store.activeIncidentId) {
      store.setActiveIncidentId(store.incidents[0].id);
    }
  }, [store.incidents]);

  useEffect(() => {
    timelineEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [(store.incidents.find((i: any) => i.id === store.activeIncidentId) as any)?.comments]);

  const selectedIncident = store.incidents.find((i: any) => i.id === store.activeIncidentId);

  const filteredIncidents = store.incidents.filter((i: any) =>
    statusFilter === "all" || i.status === statusFilter
  );

  const stats = {
    open: store.incidents.filter((i: any) => ["open", "investigating", "in_progress"].includes(i.status)).length,
    critical: store.incidents.filter((i: any) => i.severity === "critical").length,
    resolved: store.incidents.filter((i: any) => i.status === "resolved").length,
    total: store.incidents.length,
  };

  const handleAction = async (action: string) => {
    if (!selectedIncident) return;
    setActionLoading(action);
    try {
      if (action === "acknowledge") await store.acknowledgeIncident(selectedIncident.id);
      if (action === "resolve") await store.resolveIncident(selectedIncident.id, "Resolved by operator.");
      if (action === "close") await store.closeIncident(selectedIncident.id);
      if (action === "escalate") await store.escalateIncident(selectedIncident.id, "Manual escalation");
      toast.success(`Incident ${action}d`);
    } catch (e: any) {
      toast.error(e.message || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAIAnalysis = async () => {
    if (!selectedIncident) return;
    setAiAnalysisLoading(true);
    try {
      await api.triggerAIAnalysis(selectedIncident.id);
      await store.fetchIncidents();
      toast.success("AI analysis complete");
    } catch {
      toast.error("AI analysis failed");
    } finally {
      setAiAnalysisLoading(false);
    }
  };

  const handleComment = async () => {
    if (!comment.trim() || !selectedIncident) return;
    try {
      await store.addIncidentComment(selectedIncident.id, comment.trim());
      setComment("");
    } catch {
      toast.error("Failed to add comment");
    }
  };

  const handleCreate = async (data: any) => {
    try {
      await store.createIncident(data);
      toast.success("Incident declared");
    } catch (e: any) {
      toast.error(e.message || "Failed to create incident");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-primary)", overflow: "hidden" }}>
      {showCreate && <CreateIncidentModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}

      {/* ── Stats Bar ── */}
      <div style={{ display: "flex", gap: 12, padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", flexShrink: 0 }}>
        {[
          { label: "Active", value: stats.open, color: "#ef4444", icon: AlertTriangle },
          { label: "Critical", value: stats.critical, color: "#f97316", icon: ShieldAlert },
          { label: "Resolved Today", value: stats.resolved, color: "#22c55e", icon: CheckCircle },
          { label: "Total", value: stats.total, color: "var(--accent-primary)", icon: BarChart2 },
        ].map(({ label, value, color, icon: Icon }) => (
          <div
            key={label}
            style={{
              background: "var(--surface-glass)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 12,
              padding: "12px 18px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              minWidth: 120,
            }}
          >
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon size={15} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>{label}</div>
            </div>
          </div>
        ))}
        <button
          onClick={() => setShowCreate(true)}
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 18px",
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(135deg, #ef4444, #b91c1c)",
            color: "white",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          <Plus size={14} /> Declare Incident
        </button>
      </div>

      {/* ── Split View ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Incident List */}
        <div style={{ width: 300, minWidth: 240, borderRight: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Status Filters */}
          <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-subtle)", display: "flex", flexWrap: "wrap", gap: 4 }}>
            {["all", "open", "investigating", "in_progress", "resolved", "closed"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  fontSize: 10,
                  padding: "2px 8px",
                  borderRadius: 20,
                  border: "1px solid var(--border-subtle)",
                  background: statusFilter === s ? "var(--accent-primary)" : "transparent",
                  color: statusFilter === s ? "white" : "var(--text-muted)",
                  cursor: "pointer",
                  fontWeight: 600,
                  textTransform: "capitalize",
                }}
              >
                {s.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {filteredIncidents.length === 0 && (
              <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                {statusFilter === "all" ? "No incidents recorded" : `No ${statusFilter} incidents`}
              </div>
            )}
            {filteredIncidents.map((inc: any) => {
              const isActive = inc.id === store.activeIncidentId;
              const sev = SEVERITY_CONFIG[inc.severity] || SEVERITY_CONFIG.medium;
              return (
                <button
                  key={inc.id}
                  onClick={() => store.setActiveIncidentId(inc.id)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "12px 14px",
                    background: isActive ? "rgba(139,92,246,0.1)" : "transparent",
                    borderLeft: isActive ? `3px solid var(--accent-primary)` : `3px solid ${sev.color}`,
                    border: "none",
                    borderBottom: "1px solid var(--border-subtle)",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>
                      {inc.title}
                    </span>
                    <SeverityBadge severity={inc.severity} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <StatusBadge status={inc.status} />
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {TRIGGER_LABELS[inc.trigger] || inc.trigger}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                    {new Date(inc.created_at).toLocaleString()}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Incident Detail */}
        {selectedIncident ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Incident Header */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", background: "var(--surface-glass)", backdropFilter: "blur(8px)", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <SeverityBadge severity={selectedIncident.severity} />
                    <StatusBadge status={selectedIncident.status} />
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{TRIGGER_LABELS[selectedIncident.trigger]}</span>
                  </div>
                  <h2 style={{ fontWeight: 800, fontSize: 18, color: "var(--text-primary)", margin: 0 }}>
                    {selectedIncident.title}
                  </h2>
                  {selectedIncident.description && (
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "6px 0 0", lineHeight: 1.5 }}>
                      {selectedIncident.description}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {selectedIncident.status === "open" && (
                    <button onClick={() => handleAction("acknowledge")} disabled={!!actionLoading} className="btn-warning" style={{ fontSize: 12, padding: "7px 14px", borderRadius: 8, border: "none", background: "rgba(245,158,11,0.2)", color: "#f59e0b", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                      <Activity size={13} />{actionLoading === "acknowledge" ? "..." : "Acknowledge"}
                    </button>
                  )}
                  {["open", "investigating", "in_progress"].includes(selectedIncident.status) && (
                    <>
                      <button onClick={() => handleAction("escalate")} disabled={!!actionLoading} style={{ fontSize: 12, padding: "7px 14px", borderRadius: 8, border: "none", background: "rgba(249,115,22,0.2)", color: "#f97316", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                        <TrendingUp size={13} />{actionLoading === "escalate" ? "..." : "Escalate"}
                      </button>
                      <button onClick={() => handleAction("resolve")} disabled={!!actionLoading} style={{ fontSize: 12, padding: "7px 14px", borderRadius: 8, border: "none", background: "rgba(34,197,94,0.15)", color: "#22c55e", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                        <CheckCircle size={13} />{actionLoading === "resolve" ? "..." : "Resolve"}
                      </button>
                      <button onClick={handleAIAnalysis} disabled={aiAnalysisLoading} style={{ fontSize: 12, padding: "7px 14px", borderRadius: 8, border: "none", background: "rgba(139,92,246,0.15)", color: "var(--accent-primary)", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                        <Zap size={13} />{aiAnalysisLoading ? "Analyzing..." : "AI Analysis"}
                      </button>
                    </>
                  )}
                  {selectedIncident.status === "resolved" && (
                    <button onClick={() => handleAction("close")} disabled={!!actionLoading} style={{ fontSize: 12, padding: "7px 14px", borderRadius: 8, border: "none", background: "rgba(107,114,128,0.2)", color: "#9ca3af", cursor: "pointer", fontWeight: 600 }}>
                      {actionLoading === "close" ? "..." : "Close Incident"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Scrollable content: AI Analysis + Timeline */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
              {/* AI Analysis Panel */}
              {selectedIncident.ai_analysis && (
                <div
                  style={{
                    background: "rgba(139,92,246,0.08)",
                    border: "1px solid rgba(139,92,246,0.25)",
                    borderRadius: 12,
                    padding: 16,
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 13, color: "var(--accent-primary)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <Zap size={14} /> AI Failure Analysis
                  </div>
                  <pre style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, whiteSpace: "pre-wrap", margin: 0, fontFamily: "inherit" }}>
                    {typeof selectedIncident.ai_analysis === 'string' 
                      ? selectedIncident.ai_analysis 
                      : JSON.stringify(selectedIncident.ai_analysis, null, 2)}
                  </pre>
                </div>
              )}

              {/* Timeline */}
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Timeline
                </div>
                {(selectedIncident.comments || []).length === 0 ? (
                  <div style={{ color: "var(--text-muted)", fontSize: 13 }}>No activity yet. Acknowledge or comment to begin.</div>
                ) : (
                  (selectedIncident.comments || []).map((c: any) => <TimelineItem key={c.id} comment={c} />)
                )}
                <div ref={timelineEndRef} />
              </div>
            </div>

            {/* Comment composer */}
            {!["closed"].includes(selectedIncident.status) && (
              <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border-subtle)", background: "var(--surface-glass)", flexShrink: 0 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleComment()}
                    placeholder="Add a comment or update to the timeline..."
                    style={{
                      flex: 1,
                      padding: "9px 14px",
                      background: "var(--surface-raised)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: 9,
                      color: "var(--text-primary)",
                      fontSize: 13,
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={handleComment}
                    disabled={!comment.trim()}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 9,
                      border: "none",
                      background: comment.trim() ? "var(--accent-gradient)" : "var(--surface-elevated)",
                      color: "white",
                      cursor: comment.trim() ? "pointer" : "not-allowed",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
            <AlertTriangle size={48} style={{ color: "var(--text-muted)", opacity: 0.3 }} />
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Select an incident to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
