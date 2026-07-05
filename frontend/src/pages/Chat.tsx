import { useEffect, useRef, useState } from "react";
import { useStore } from "../stores/store";
import { api } from "../services/api";
import {
  Hash, Send, Trash2, MessageSquare,
  Users, Globe, GitBranch, Cpu, Layers, AlertTriangle,
  Circle
} from "lucide-react";
import { toast } from "sonner";

const CONTEXT_ICONS: Record<string, any> = {
  org: Globe,
  team: Users,
  project: GitBranch,
  queue: Layers,
  job: Cpu,
  incident: AlertTriangle,
};

const PRESENCE_COLORS: Record<string, string> = {
  online: "#22c55e",
  away: "#f59e0b",
  busy: "#ef4444",
  offline: "#6b7280",
};

const QUICK_REACTIONS = ["👍", "❤️", "🚀", "🔥", "✅", "🐛"];

function PresenceDot({ status }: { status: string }) {
  return (
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: PRESENCE_COLORS[status] || "#6b7280",
        display: "inline-block",
        marginRight: 4,
        flexShrink: 0,
      }}
    />
  );
}

function MessageBubble({
  msg,
  currentUserId,
  onReact,
  onDelete,
}: {
  msg: any;
  currentUserId?: string;
  onReact: (mid: string, emoji: string) => void;
  onDelete: (mid: string) => void;
}) {
  const isOwn = msg.user_id === currentUserId;
  const [showReactions, setShowReactions] = useState(false);

  const formatTime = (ts: string) =>
    new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (msg.is_deleted) {
    return (
      <div style={{ padding: "4px 12px", color: "var(--text-muted)", fontStyle: "italic", fontSize: 13 }}>
        — Message deleted —
      </div>
    );
  }

  return (
    <div
      className="message-row"
      onMouseEnter={() => setShowReactions(true)}
      onMouseLeave={() => setShowReactions(false)}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "6px 12px",
        borderRadius: 8,
        background: isOwn ? "rgba(139,92,246,0.07)" : "transparent",
        transition: "background 0.15s",
        position: "relative",
        marginBottom: 2,
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: isOwn ? "var(--accent-gradient)" : "var(--surface-raised)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          fontWeight: 700,
          color: "white",
          flexShrink: 0,
        }}
      >
        {isOwn ? "ME" : "U"}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <span style={{ fontWeight: 600, fontSize: 13, color: isOwn ? "var(--accent-primary)" : "var(--text-primary)" }}>
            {isOwn ? "You" : "Team Member"}
          </span>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{formatTime(msg.timestamp)}</span>
          {msg.is_edited && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>(edited)</span>}
        </div>
        <div style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.5, wordBreak: "break-word" }}>
          {msg.content}
        </div>
      </div>

      {/* Hover Actions */}
      {showReactions && (
        <div
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            gap: 4,
            background: "var(--surface-elevated)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 8,
            padding: "2px 6px",
            zIndex: 10,
          }}
        >
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onReact(msg.id, emoji)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 16,
                padding: "2px 3px",
                borderRadius: 4,
                transition: "transform 0.1s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.25)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              {emoji}
            </button>
          ))}
          {isOwn && (
            <button
              onClick={() => onDelete(msg.id)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: "2px 4px" }}
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function Chat() {
  const store = useStore();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingChannel, setLoadingChannel] = useState(false);
  const [contextFilter, setContextFilter] = useState("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Seed defaults then load all channels
    api.ensureDefaultChannels().finally(() => {
      store.fetchChannels();
    });
    store.fetchPresence();
    store.updatePresence("online", "chat");

    const interval = setInterval(() => {
      store.fetchPresence();
      if (store.activeChannelId) {
        store.setActiveChannel(store.activeChannelId).catch(() => {});
      }
    }, 4000);

    return () => {
      clearInterval(interval);
      store.updatePresence("offline");
    };
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [store.activeChannelMessages]);

  // Auto-select first channel
  useEffect(() => {
    if (store.channels.length > 0 && !store.activeChannelId) {
      handleSelectChannel(store.channels[0].id);
    }
  }, [store.channels]);

  const handleSelectChannel = async (channelId: string) => {
    setLoadingChannel(true);
    await store.setActiveChannel(channelId);
    setLoadingChannel(false);
  };

  const handleSend = async () => {
    if (!message.trim() || !store.activeChannelId || sending) return;
    setSending(true);
    try {
      await store.sendMessage(store.activeChannelId, message.trim());
      setMessage("");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReact = async (messageId: string, emoji: string) => {
    if (!store.activeChannelId) return;
    try {
      await api.reactToMessage(store.activeChannelId, messageId, emoji);
    } catch {
      toast.error("Reaction failed");
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!store.activeChannelId) return;
    try {
      await api.deleteMessage(store.activeChannelId, messageId);
      // Refresh messages
      store.setActiveChannel(store.activeChannelId);
    } catch {
      toast.error("Delete failed");
    }
  };

  const filteredChannels = store.channels.filter(
    (ch: any) => contextFilter === "all" || ch.context_type === contextFilter
  );

  const activeChannel = store.channels.find((ch: any) => ch.id === store.activeChannelId);

  const ContextIcon = activeChannel ? (CONTEXT_ICONS[activeChannel.context_type] || Hash) : Hash;

  return (
    <div style={{ display: "flex", height: "100%", background: "var(--bg-primary)", overflow: "hidden" }}>
      {/* ── Sidebar ── */}
      <div
        style={{
          width: 240,
          minWidth: 200,
          background: "var(--surface-glass)",
          borderRight: "1px solid var(--border-subtle)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Sidebar Header */}
        <div style={{ padding: "18px 16px 10px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <MessageSquare size={16} style={{ color: "var(--accent-primary)" }} />
            Channels
          </div>
          {/* Context filter pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {["all", "org", "team", "project", "queue", "incident"].map((c) => (
              <button
                key={c}
                onClick={() => setContextFilter(c)}
                style={{
                  fontSize: 10,
                  padding: "2px 8px",
                  borderRadius: 20,
                  border: "1px solid var(--border-subtle)",
                  background: contextFilter === c ? "var(--accent-primary)" : "transparent",
                  color: contextFilter === c ? "white" : "var(--text-muted)",
                  cursor: "pointer",
                  fontWeight: 600,
                  textTransform: "capitalize",
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Channel List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {filteredChannels.length === 0 && (
            <div style={{ padding: "16px", color: "var(--text-muted)", fontSize: 13, textAlign: "center" }}>
              No channels yet
            </div>
          )}
          {filteredChannels.map((ch: any) => {
            const CIcon = CONTEXT_ICONS[ch.context_type] || Hash;
            const isActive = ch.id === store.activeChannelId;
            return (
              <button
                key={ch.id}
                onClick={() => handleSelectChannel(ch.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px",
                  background: isActive ? "rgba(139,92,246,0.15)" : "transparent",
                  border: "none",
                  borderLeft: isActive ? "3px solid var(--accent-primary)" : "3px solid transparent",
                  cursor: "pointer",
                  color: isActive ? "var(--accent-primary)" : "var(--text-secondary)",
                  fontSize: 13,
                  textAlign: "left",
                  fontWeight: isActive ? 600 : 400,
                  transition: "all 0.15s",
                }}
              >
                <CIcon size={14} />
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  #{ch.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Presence section */}
        <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border-subtle)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Online Now
          </div>
          {store.presence
            .filter((p: any) => p.status === "online")
            .slice(0, 5)
            .map((p: any) => (
              <div key={p.user_id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "2px 0", fontSize: 12 }}>
                <PresenceDot status={p.status} />
                <span style={{ color: "var(--text-secondary)" }}>
                  {p.activity || "Active"}
                </span>
              </div>
            ))}
          {store.presence.filter((p: any) => p.status === "online").length === 0 && (
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>No one online</div>
          )}
        </div>
      </div>

      {/* ── Main Chat Area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "var(--surface-glass)",
            backdropFilter: "blur(12px)",
          }}
        >
          {activeChannel ? (
            <>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "var(--accent-gradient)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ContextIcon size={16} style={{ color: "white" }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
                  #{activeChannel.name}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {activeChannel.description || `${activeChannel.context_type} channel`}
                </div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
                <Circle size={8} fill="#22c55e" color="#22c55e" />
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {store.presence.filter((p: any) => p.status === "online").length} online
                </span>
              </div>
            </>
          ) : (
            <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Select a channel to start chatting</div>
          )}
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 0" }}>
          {!store.activeChannelId ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: 12,
              }}
            >
              <MessageSquare size={48} style={{ color: "var(--text-muted)", opacity: 0.4 }} />
              <p style={{ color: "var(--text-muted)" }}>Select a channel to begin collaboration</p>
            </div>
          ) : loadingChannel ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <div className="loading-spinner" />
            </div>
          ) : store.activeChannelMessages.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center" }}>
              <Hash size={32} style={{ color: "var(--text-muted)", opacity: 0.3, margin: "0 auto 8px" }} />
              <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
                This is the beginning of <strong>#{activeChannel?.name}</strong>. Say something!
              </p>
            </div>
          ) : (
            store.activeChannelMessages.map((msg: any) => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                currentUserId={store.user?.id}
                onReact={handleReact}
                onDelete={handleDelete}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Composer */}
        {store.activeChannelId && (
          <div
            style={{
              padding: "12px 16px",
              borderTop: "1px solid var(--border-subtle)",
              background: "var(--surface-glass)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 10,
                background: "var(--surface-raised)",
                borderRadius: 12,
                padding: "8px 12px",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <textarea
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message #${activeChannel?.name ?? "channel"} · Press Enter to send`}
                rows={1}
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  outline: "none",
                  color: "var(--text-primary)",
                  fontSize: 14,
                  resize: "none",
                  fontFamily: "inherit",
                  lineHeight: 1.5,
                  maxHeight: 120,
                  overflowY: "auto",
                }}
              />
              <button
                onClick={handleSend}
                disabled={!message.trim() || sending}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: message.trim() ? "var(--accent-gradient)" : "var(--surface-elevated)",
                  border: "none",
                  cursor: message.trim() ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  transition: "all 0.15s",
                  flexShrink: 0,
                }}
              >
                <Send size={15} />
              </button>
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, paddingLeft: 4 }}>
              Markdown supported · <kbd style={{ background: "var(--surface-elevated)", borderRadius: 3, padding: "0 4px" }}>Enter</kbd> to send · <kbd style={{ background: "var(--surface-elevated)", borderRadius: 3, padding: "0 4px" }}>Shift+Enter</kbd> for new line
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
