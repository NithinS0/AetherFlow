import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
export function ChatInterface() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I am OpsGPT. I've analyzed your cluster and detected 2 failing workers in the processing queue. How can I assist you?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { role: "user", content: input }]);
    setInput("");
    setIsTyping(true);

    // Simulate Streaming API Response
    // In production, this connects to the FastAPI SSE endpoint
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I recommend restarting the affected workers and temporarily increasing the concurrency limit on the processing queue to clear the backlog." 
      }]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[600px] border border-white/5 bg-zinc-950/50 rounded-xl overflow-hidden backdrop-blur-sm">
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === "user" ? "bg-primary text-white" : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/20"
            }`}>
              {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
            </div>
            
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
              msg.role === "user" ? "bg-primary text-white rounded-tr-none" : "bg-zinc-900 border border-white/5 text-zinc-200 rounded-tl-none"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <Bot size={16} />
            </div>
            <div className="bg-zinc-900 border border-white/5 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-indigo-400" />
              <span className="text-sm text-zinc-400">Analyzing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-zinc-900/80 border-t border-white/5">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask OpsGPT about your cluster health..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-full py-3 pl-4 pr-12 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}
