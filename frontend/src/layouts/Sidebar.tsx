
import { LayoutDashboard, Users, Folders, Workflow, Activity, TerminalSquare, MessageSquare, ShieldAlert, Settings } from "lucide-react";
import { BrandLogo } from "../components/BrandLogo";

export function Sidebar() {
  const items = [
    { label: "Dashboard", icon: <LayoutDashboard size={18} />, active: true },
    { label: "Workspace", icon: <Users size={18} /> },
    { label: "Projects", icon: <Folders size={18} /> },
    { label: "Queues & Jobs", icon: <Workflow size={18} /> },
    { label: "Workers", icon: <TerminalSquare size={18} /> },
    { label: "Operations Center", icon: <Activity size={18} /> },
    { label: "Collaboration", icon: <MessageSquare size={18} /> },
    { label: "Incidents", icon: <ShieldAlert size={18} /> },
    { label: "Settings", icon: <Settings size={18} /> },
  ];

  return (
    <aside className="w-64 h-screen border-r border-white/5 bg-zinc-950/80 backdrop-blur-xl flex flex-col fixed left-0 top-0">
      <div className="h-20 flex items-center justify-center px-6 border-b border-white/5">
        <div className="flex items-center justify-center">
          <BrandLogo variant="full" className="h-20 w-auto object-contain" />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1">
        {items.map((item, idx) => (
          <button 
            key={idx}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${item.active 
                ? "bg-primary/10 text-primary shadow-[inset_2px_0_0_0_rgba(59,130,246,1)]" 
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
              }
            `}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  );
}
