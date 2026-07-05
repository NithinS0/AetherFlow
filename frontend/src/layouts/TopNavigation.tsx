import { Search, Bell, Sparkles } from "lucide-react";

export function TopNavigation() {
  return (
    <header className="h-16 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-10">
      
      {/* Command Palette Trigger */}
      <div className="flex-1 max-w-md">
        <button className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900/50 border border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors text-sm">
          <Search size={16} />
          <span>Search or type a command...</span>
          <div className="ml-auto flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-mono border border-zinc-700">Ctrl</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-mono border border-zinc-700">K</kbd>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-4">
        {/* AI Copilot Action */}
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors text-sm font-medium border border-indigo-500/20">
          <Sparkles size={14} />
          <span>OpsGPT</span>
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger border-2 border-background"></span>
        </button>

        {/* User Profile */}
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-accent border border-white/10 shadow-lg cursor-pointer"></div>
      </div>
    </header>
  );
}
