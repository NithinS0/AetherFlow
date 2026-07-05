import { useState, useEffect, useRef } from "react";
import { useStore } from "../stores/store";
import { api } from "../services/api";
import { 
  Send, 
  Bot, 
  User as UserIcon, 
  Plus, 
  MessageSquare
} from "lucide-react";
import { toast } from "sonner";

export function OpsGpt() {
  const store = useStore();
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [inputMsg, setInputMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    store.fetchAiConversations();
  }, []);

  useEffect(() => {
    if (activeConvId) {
      store.fetchAiMessages(activeConvId);
    }
  }, [activeConvId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [store.activeConversationMessages, loading]);

  const handleStartChat = async () => {
    try {
      const conv = await api.createAiConversation("New Chat");
      setActiveConvId(conv.id);
      store.fetchAiConversations();
    } catch {
      toast.error("Failed to initialize conversation session");
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    let convId = activeConvId;
    if (!convId) {
      // Start new chat automatically if none exists
      try {
        const conv = await api.createAiConversation("New Chat");
        convId = conv.id;
        setActiveConvId(conv.id);
        store.fetchAiConversations();
      } catch {
        toast.error("Failed to initialize chat");
        return;
      }
    }

    if (!convId) return; // Narrow to non-null

    setInputMsg("");
    setLoading(true);
    try {
      await api.sendAiMessage(convId, text);
      store.fetchAiMessages(convId);
      store.fetchAiConversations();
    } catch {
      toast.error("Failed to deliver message");
    } finally {
      setLoading(false);
    }
  };

  const suggestionChips = [
    "Show unhealthy queues.",
    "Why did the last job fail?",
    "Recommend optimization suggestions."
  ];

  return (
    <div className="flex h-[calc(100vh-140px)] gap-8 overflow-hidden">
      
      {/* Conversations Sidebar */}
      <div className="w-80 shrink-0 glass-panel border border-border rounded-2xl flex flex-col justify-between overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-border/80 flex items-center justify-between">
          <h3 className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider">Chat History</h3>
          <button
            onClick={handleStartChat}
            className="p-1.5 bg-primary/10 border border-primary/20 hover:bg-primary/25 text-primary hover:text-white rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[10px] font-mono font-bold"
          >
            <Plus className="w-3.5 h-3.5" /> New
          </button>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {store.aiConversations.length === 0 ? (
            <div className="text-[10px] text-zinc-500 font-mono text-center py-6">No previous conversations recorded.</div>
          ) : (
            store.aiConversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveConvId(c.id)}
                className={`w-full p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer font-mono text-[11px] ${
                  activeConvId === c.id 
                    ? "bg-zinc-900 border-primary text-zinc-200" 
                    : "bg-zinc-950/20 border-border/40 hover:border-border text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <MessageSquare className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="truncate">{c.title}</span>
              </button>
            ))
          )}
        </div>

      </div>

      {/* Chat Pane */}
      <div className="flex-1 glass-panel border border-border rounded-2xl flex flex-col justify-between overflow-hidden">
        
        {/* Messages timeline */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!activeConvId && store.activeConversationMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-6">
              <Bot className="w-12 h-12 text-zinc-400 animate-pulse" />
              <div>
                <h4 className="font-bold text-zinc-200 font-mono text-sm uppercase tracking-wider">OpsGPT SRE Assistant</h4>
                <p className="text-zinc-500 text-xs mt-2 leading-relaxed font-mono">
                  Troubleshoot cluster executions, read system logs, and inspect active worker telemetry in real time.
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full pt-4">
                {suggestionChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(chip)}
                    className="p-3 bg-zinc-950 border border-border/80 hover:border-primary/50 text-zinc-400 hover:text-zinc-200 rounded-xl transition-all text-xs font-mono text-left cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {store.activeConversationMessages.map((msg) => {
                const isAi = msg.sender === "assistant";
                return (
                  <div key={msg.id} className={`flex gap-4 items-start ${isAi ? "max-w-3xl" : "max-w-2xl ml-auto flex-row-reverse"}`}>
                    <div className={`p-2 border rounded-xl shrink-0 ${
                      isAi ? "bg-zinc-900 border-border text-emerald-400" : "bg-primary/10 border-primary/20 text-primary"
                    }`}>
                      {isAi ? <Bot className="w-4.5 h-4.5" /> : <UserIcon className="w-4.5 h-4.5" />}
                    </div>
                    <div className={`p-4 rounded-2xl text-[11px] font-mono leading-relaxed border shadow-md ${
                      isAi ? "bg-zinc-900/60 border-border text-zinc-300" : "bg-primary/5 border-primary/25 text-zinc-200"
                    }`}>
                      <pre className="whitespace-pre-wrap font-sans font-medium">{msg.content}</pre>
                    </div>
                  </div>
                );
              })}
              {loading && (
                <div className="flex gap-4 items-start max-w-3xl">
                  <div className="p-2 bg-zinc-900 border border-border text-emerald-400 rounded-xl shrink-0">
                    <Bot className="w-4.5 h-4.5 animate-bounce" />
                  </div>
                  <div className="p-3 px-4 bg-zinc-900/60 border border-border rounded-2xl text-[10px] text-zinc-500 font-mono">
                    OpsGPT is querying active node schemas...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </>
          )}
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-border/80 flex gap-2 items-center bg-zinc-950/20">
          <input
            type="text"
            placeholder="Type SRE diagnostic queries (e.g. why did the last job fail?)..."
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage(inputMsg)}
            className="flex-1 bg-zinc-950 border border-border rounded-xl px-4 py-3 text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-primary"
          />
          <button
            onClick={() => handleSendMessage(inputMsg)}
            className="p-3 bg-primary hover:bg-primary-dark text-white rounded-xl transition-all cursor-pointer shadow-lg shadow-primary/20"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </div>

      </div>

    </div>
  );
}
