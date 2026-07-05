import { useEffect, useState } from "react";
import { useStore } from "../stores/store";
import {
  Bell, CheckCheck, AlertTriangle, CheckCircle2,
  Users, MessageSquare, ShieldCheck, Cpu
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../services/api";

const NOTIF_TYPE_CONFIG: Record<string, { icon: any; color: string }> = {
  worker_offline: { icon: Cpu, color: "#ef4444" },
  worker_registered: { icon: Cpu, color: "#22c55e" },
  job_failed: { icon: AlertTriangle, color: "#ef4444" },
  job_completed: { icon: CheckCircle2, color: "#22c55e" },
  incident_new: { icon: AlertTriangle, color: "#f97316" },
  approval_new: { icon: ShieldCheck, color: "#8b5cf6" },
  channel_message: { icon: MessageSquare, color: "#3b82f6" },
  team_update: { icon: Users, color: "#06b6d4" },
  default: { icon: Bell, color: "#6b7280" },
};

function NotificationItem({
  notif,
  onMarkRead,
}: {
  notif: any;
  onMarkRead: (id: string) => void;
}) {
  const cfg = NOTIF_TYPE_CONFIG[notif.notification_type || notif.type] || NOTIF_TYPE_CONFIG.default;
  const Icon = cfg.icon;
  const isUnread = !notif.read_at;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "14px 16px",
        borderBottom: "1px solid var(--border-subtle)",
        background: isUnread ? "rgba(139,92,246,0.05)" : "transparent",
        transition: "background 0.15s",
        position: "relative",
      }}
    >
      {/* Unread dot */}
      {isUnread && (
        <div
          style={{
            position: "absolute",
            left: 6,
            top: "50%",
            transform: "translateY(-50%)",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--accent-primary)",
          }}
        />
      )}

      {/* Icon */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: `${cfg.color}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={15} color={cfg.color} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: isUnread ? 700 : 500, fontSize: 13, color: "var(--text-primary)", marginBottom: 2 }}>
          {notif.title || notif.message?.substring(0, 80) || "Notification"}
        </div>
        {notif.message && (
          <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.4 }}>
            {notif.message}
          </div>
        )}
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
          {new Date(notif.created_at || notif.timestamp).toLocaleString()}
        </div>
      </div>

      {/* Mark read */}
      {isUnread && (
        <button
          onClick={() => onMarkRead(notif.id)}
          title="Mark as read"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            padding: "2px",
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <CheckCheck size={14} />
        </button>
      )}
    </div>
  );
}

export function NotificationCenter() {
  const store = useStore();
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 6000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      await store.fetchNotifications();
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      await store.fetchNotifications();
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      // Mark all unread notifications read
      const unread = store.notifications.filter((n: any) => !n.read_at);
      await Promise.all(unread.map((n: any) => api.markNotificationRead(n.id).catch(() => {})));
      await store.fetchNotifications();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const typeOptions = ["all", "worker_offline", "job_failed", "incident_new", "approval_new", "channel_message"];

  const filtered = store.notifications.filter((n: any) => {
    if (typeFilter === "all") return true;
    return (n.notification_type || n.type) === typeFilter;
  });

  const unreadCount = store.notifications.filter((n: any) => !n.read_at).length;

  return (
    <div style={{ padding: "24px 28px", background: "var(--bg-primary)", minHeight: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: 22, color: "var(--text-primary)", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
            <Bell size={22} style={{ color: "var(--accent-primary)" }} />
            Notification Center
            {unreadCount > 0 && (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  background: "var(--accent-gradient)",
                  color: "white",
                  padding: "2px 10px",
                  borderRadius: 20,
                  marginLeft: 4,
                }}
              >
                {unreadCount} unread
              </span>
            )}
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>
            Centralised feed for all platform events and alerts
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            style={{
              padding: "9px 16px",
              borderRadius: 9,
              border: "1px solid var(--border-subtle)",
              background: "var(--surface-glass)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <CheckCheck size={14} />
            Mark All Read
          </button>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Unread", value: unreadCount, color: "var(--accent-primary)" },
          { label: "Total Today", value: store.notifications.length, color: "#6b7280" },
          { label: "Critical Events", value: store.notifications.filter((n: any) => ["incident_new", "job_failed", "worker_offline"].includes(n.notification_type || n.type)).length, color: "#ef4444" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            style={{
              background: "var(--surface-glass)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 12,
              padding: "12px 18px",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Type Filter */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {typeOptions.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            style={{
              padding: "7px 14px",
              borderRadius: 9,
              border: "1px solid var(--border-subtle)",
              background: typeFilter === t ? "var(--accent-primary)" : "var(--surface-glass)",
              color: typeFilter === t ? "white" : "var(--text-secondary)",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 12,
              textTransform: "capitalize",
            }}
          >
            {t.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div
        style={{
          background: "var(--surface-glass)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        {loading && filtered.length === 0 ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60 }}>
            <div className="loading-spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
            <Bell size={48} style={{ opacity: 0.3, margin: "0 auto 12px" }} />
            <p style={{ fontSize: 14 }}>No notifications in this category</p>
          </div>
        ) : (
          filtered.map((notif: any) => (
            <NotificationItem key={notif.id} notif={notif} onMarkRead={handleMarkRead} />
          ))
        )}
      </div>
    </div>
  );
}
