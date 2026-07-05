import { useEffect, useState } from "react";
import { useStore } from "../stores/store";
import {
  ShieldCheck, Clock, CheckCircle2, XCircle,
  RefreshCw, MessageSquare, Bot, Wrench, Server
} from "lucide-react";
import { toast } from "sonner";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#f59e0b",
  low: "#22c55e",
};

const TYPE_ICONS: Record<string, any> = {
  ai_recommendation: Bot,
  queue_change: MessageSquare,
  worker_restart: Server,
  maintenance_mode: Wrench,
};

const TYPE_LABELS: Record<string, string> = {
  ai_recommendation: "AI Recommendation",
  queue_change: "Queue Change",
  worker_restart: "Worker Restart",
  maintenance_mode: "Maintenance Mode",
};

function ApprovalCard({
  approval,
  onApprove,
  onReject,
}: {
  approval: any;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const [reviewNote, setReviewNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const Icon = TYPE_ICONS[approval.approval_type] || ShieldCheck;
  const sevColor = SEVERITY_COLORS[approval.severity] || SEVERITY_COLORS.medium;
  const isPending = approval.status === "pending";

  return (
    <div
      style={{
        background: "var(--surface-glass)",
        border: `1px solid ${isPending ? "var(--border-subtle)" : approval.status === "approved" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
        borderRadius: 14,
        padding: 20,
        position: "relative",
        overflow: "hidden",
        transition: "all 0.2s",
      }}
    >
      {/* Severity accent */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: sevColor, borderRadius: "14px 0 0 14px" }} />

      <div style={{ paddingLeft: 8 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: `${sevColor}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon size={16} color={sevColor} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>
                {approval.title}
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: `${sevColor}18`, color: sevColor, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {approval.severity}
              </span>
              <span style={{ fontSize: 11, color: "var(--text-muted)", background: "var(--surface-raised)", padding: "2px 8px", borderRadius: 20 }}>
                {TYPE_LABELS[approval.approval_type] || approval.approval_type}
              </span>
            </div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              {approval.description}
            </div>
          </div>
          <div style={{ flexShrink: 0 }}>
            {approval.status === "pending" ? (
              <span style={{ fontSize: 12, fontWeight: 600, color: "#f59e0b", background: "rgba(245,158,11,0.15)", padding: "4px 10px", borderRadius: 20, display: "flex", alignItems: "center", gap: 4 }}>
                <Clock size={11} /> Pending
              </span>
            ) : approval.status === "approved" ? (
              <span style={{ fontSize: 12, fontWeight: 600, color: "#22c55e", background: "rgba(34,197,94,0.15)", padding: "4px 10px", borderRadius: 20, display: "flex", alignItems: "center", gap: 4 }}>
                <CheckCircle2 size={11} /> Approved
              </span>
            ) : (
              <span style={{ fontSize: 12, fontWeight: 600, color: "#ef4444", background: "rgba(239,68,68,0.12)", padding: "4px 10px", borderRadius: 20, display: "flex", alignItems: "center", gap: 4 }}>
                <XCircle size={11} /> Rejected
              </span>
            )}
          </div>
        </div>

        {/* Meta */}
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: isPending ? 14 : 0 }}>
          Requested · {new Date(approval.created_at).toLocaleString()}
          {approval.reviewed_at && ` · Reviewed ${new Date(approval.reviewed_at).toLocaleString()}`}
        </div>

        {approval.review_note && (
          <div style={{ fontSize: 13, color: "var(--text-secondary)", background: "var(--surface-raised)", borderRadius: 8, padding: "8px 12px", marginTop: 8 }}>
            <strong>Review note:</strong> {approval.review_note}
          </div>
        )}

        {/* Actions */}
        {isPending && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {showNote && (
              <input
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Optional review note..."
                style={{
                  padding: "8px 12px",
                  background: "var(--surface-raised)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 8,
                  color: "var(--text-primary)",
                  fontSize: 13,
                  outline: "none",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setShowNote(!showNote)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "1px solid var(--border-subtle)",
                  background: "transparent",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {showNote ? "Hide Note" : "Add Note"}
              </button>
              <button
                onClick={() => onReject(approval.id)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid rgba(239,68,68,0.4)",
                  background: "rgba(239,68,68,0.08)",
                  color: "#ef4444",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <XCircle size={13} /> Reject
              </button>
              <button
                onClick={() => onApprove(approval.id)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <CheckCircle2 size={13} /> Approve
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ApprovalCenter() {
  const store = useStore();
  const [statusFilter, setStatusFilter] = useState("pending");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadApprovals();
    const interval = setInterval(loadApprovals, 8000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const loadApprovals = async () => {
    setLoading(true);
    try {
      await store.fetchApprovals(statusFilter === "all" ? undefined : statusFilter);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await store.approveRequest(id);
      toast.success("Request approved and action executed");
    } catch (e: any) {
      toast.error(e.message || "Approval failed. Check your permissions.");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await store.rejectRequest(id);
      toast.success("Request rejected");
    } catch (e: any) {
      toast.error(e.message || "Rejection failed");
    }
  };

  const stats = {
    pending: store.approvals.filter((a: any) => a.status === "pending").length,
    approved: store.approvals.filter((a: any) => a.status === "approved").length,
    rejected: store.approvals.filter((a: any) => a.status === "rejected").length,
  };

  return (
    <div style={{ padding: "24px 28px", background: "var(--bg-primary)", minHeight: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: 22, color: "var(--text-primary)", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
            <ShieldCheck size={22} style={{ color: "var(--accent-primary)" }} />
            Approval Center
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>
            Review and authorize operational change requests — approvals require Administrator access
          </p>
        </div>
        <button
          onClick={loadApprovals}
          style={{ padding: "9px 16px", borderRadius: 9, border: "1px solid var(--border-subtle)", background: "var(--surface-glass)", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600 }}
        >
          <RefreshCw size={13} className={loading ? "spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Pending Review", value: stats.pending, color: "#f59e0b", icon: Clock },
          { label: "Approved", value: stats.approved, color: "#22c55e", icon: CheckCircle2 },
          { label: "Rejected", value: stats.rejected, color: "#ef4444", icon: XCircle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div
            key={label}
            style={{
              background: "var(--surface-glass)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 12,
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div style={{ width: 34, height: 34, borderRadius: 8, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon size={15} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {["all", "pending", "approved", "rejected"].map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            style={{
              padding: "8px 18px",
              borderRadius: 9,
              border: "1px solid var(--border-subtle)",
              background: statusFilter === f ? "var(--accent-primary)" : "var(--surface-glass)",
              color: statusFilter === f ? "white" : "var(--text-secondary)",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
              textTransform: "capitalize",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Approvals List */}
      {loading && store.approvals.length === 0 ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200 }}>
          <div className="loading-spinner" />
        </div>
      ) : store.approvals.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
          <ShieldCheck size={48} style={{ opacity: 0.3, margin: "0 auto 12px" }} />
          <p style={{ fontSize: 14 }}>No approval requests in this queue</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>
            Requests appear here when AI agents or operators propose operational changes.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {store.approvals.map((approval: any) => (
            <ApprovalCard
              key={approval.id}
              approval={approval}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
