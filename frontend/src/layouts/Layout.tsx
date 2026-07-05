import { useState, useEffect } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useStore } from "../stores/store";
import { api } from "../services/api";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { SearchInput } from "../components/SearchInput";
import { Avatar } from "../components/Avatar";
import { BrandLogo } from "../components/BrandLogo";
import { Modal } from "../components/Modal";
import { Button } from "../components/Button";
import { ThemeToggle } from "../components/ThemeToggle";
import { 
  LayoutDashboard, 
  Folder, 
  Bell, 
  ShieldAlert, 
  Settings, 
  ChevronDown, 
  Plus, 
  LogOut, 
  CloudLightning,
  Check,
  Clock,
  Workflow,
  Cpu,
  Terminal,
  Heart,
  Zap,
  Radio,
  Activity,
  Bot,
  MessageSquare,
  AlertTriangle,
  BarChart2,
  PlugZap,
  Search,
  FileText,
  RefreshCw,
  Building2
} from "lucide-react";
import { toast } from "sonner";

export function Layout() {
  const store = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const notifications = Array.isArray(store.notifications) ? store.notifications : [];
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [createOrgOpen, setCreateOrgOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgSlug, setNewOrgSlug] = useState("");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem("af_sidebar_open");
      if (raw) return JSON.parse(raw);
    } catch {}
    // default: expand Core Scheduler and AI Operations
    return {
      "Core Scheduler": true,
      "AI Operations": true,
      "Operations": true,
      "Platform": true,
    };
  });

  const toggleSection = (title: string) => {
    const next = { ...openSections, [title]: !openSections[title] };
    setOpenSections(next);
    try {
      localStorage.setItem("af_sidebar_open", JSON.stringify(next));
    } catch {}
  };

  const sections = [
    // Reorganized sections to reflect enterprise scheduler lifecycle
    // Section 1: Core Scheduler (exact order required)
    {
      title: "Core Scheduler",
      items: [
        { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { name: "Projects", path: "/projects", icon: Folder },
        { name: "Queue Management", path: "/queues", icon: CloudLightning },
        { name: "Job Scheduler", path: "/jobs", icon: Clock },
        { name: "Scheduled Jobs", path: "/scheduled-jobs", icon: Clock },
        { name: "Job Explorer", path: "/job-explorer", icon: Search },
        { name: "Workers", path: "/workers", icon: Cpu },
        { name: "Worker Monitoring", path: "/worker-monitoring", icon: Activity },
        { name: "Job Executions", path: "/executions", icon: Terminal },
        { name: "Retry Management", path: "/retry-management", icon: RefreshCw },
        { name: "Dead Letter Queue", path: "/dlq", icon: ShieldAlert },
        { name: "Queue Analytics", path: "/queue-analytics", icon: BarChart2 },
        { name: "System Health", path: "/system-health", icon: Heart },
      ]
    },

    // Section 2: AI Operations
    {
      title: "AI Operations",
      items: [
        // ai-agents hub is the parent; include deep links that open specific agent views in the hub via query param
        { name: "AI Agents", path: "/ai-agents", icon: Bot },
        { name: "Monitoring Agent", path: "/ai-agents?agent=monitoring", icon: Activity },
        { name: "Failure Analysis", path: "/ai-agents?agent=failure-analysis", icon: AlertTriangle },
        { name: "Optimization Agent", path: "/ai-agents?agent=optimization", icon: Check },
        { name: "Documentation Agent", path: "/ai-agents?agent=documentation", icon: FileText },
        { name: "Security Advisor", path: "/ai-agents?agent=security", icon: ShieldAlert },
        { name: "OpsGPT", path: "/opsgpt", icon: MessageSquare },
        { name: "AI Recommendations", path: "/ai-dashboard", icon: Bot },
        { name: "AI Reports", path: "/ai-reports", icon: FileText },
      ]
    },

    // Section 3: Operations
    {
      title: "Operations",
      items: [
        { name: "Operations Center", path: "/command-center", icon: Radio },
        { name: "Digital Twin", path: "/topology", icon: Workflow },
        { name: "Activity Timeline", path: "/activity", icon: Activity },
        { name: "Reports", path: "/analytics", icon: BarChart2 },
        { name: "Notifications", path: "/notifications", icon: Bell },
        { name: "Incidents", path: "/incidents", icon: AlertTriangle },
        { name: "Security Audit", path: "/audit-logs", icon: ShieldAlert },
        { name: "Chaos Engineering", path: "/chaos", icon: Zap },
        { name: "Reliability Center", path: "/reliability", icon: Heart },
      ]
    },

    // Section 4: Platform
    {
      title: "Platform",
      items: [
        { name: "Organizations", path: "/organizations", icon: Building2 },
        { name: "Teams", path: "/teams", icon: AlertTriangle },
        { name: "Workflow Builder", path: "/visualizer", icon: Workflow },
        { name: "Plugins", path: "/plugins", icon: PlugZap },
        { name: "Settings", path: "/settings", icon: Settings },
      ]
    }
  ];


  useEffect(() => {
    store.fetchOrgs();
    store.fetchNotifications();
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // Clear the local session even if the backend logout request fails.
    } finally {
      store.logout();
      navigate("/login", { replace: true });
      toast.success("Signed out successfully.");
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newOrg = await api.createOrganization({
        name: newOrgName,
        slug: newOrgSlug
      });
      toast.success("Organization created successfully");
      setCreateOrgOpen(false);
      setNewOrgName("");
      setNewOrgSlug("");
      await store.fetchOrgs();
      await store.setActiveOrg(newOrg);
    } catch (e: any) {
      toast.error(e.message || "Failed to create organization");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      toast.success("All notifications marked as read");
      store.fetchNotifications();
    } catch (e: any) {
      toast.error("Failed to mark notifications read");
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background p-4 gap-4">
      
      {/* Sidebar navigation */}
      <aside className="w-64 glass-panel flex flex-col justify-between shrink-0 relative z-25 overflow-hidden">
        <div>
          {/* Brand Logo Header */}
          <div className="px-6 pt-5 pb-3 flex items-center justify-center">
            <BrandLogo variant="full" className="h-20 w-auto object-contain" />
          </div>
          
          {/* Workspace Switcher / Dropdown */}
          <div className="p-4 pt-1 border-b border-white/5 relative">
            <button
              onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
              className="flex items-center justify-between w-full p-2.5 bg-white/[0.02] border border-white/5 rounded-xl text-zinc-300 hover:text-white hover:bg-white/[0.05] transition-all text-xs font-semibold cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <div className="w-5 h-5 bg-gradient-to-tr from-primary to-accent rounded text-[10px] text-white flex items-center justify-center font-bold shadow-royal-glow">
                  {store.activeOrg?.name?.slice(0, 2).toUpperCase() || "AF"}
                </div>
                <span className="truncate">{store.activeOrg?.name || "Select Workspace"}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />
            </button>

            {/* Switcher overlay list */}
            {orgDropdownOpen && (
              <div className="absolute top-full mt-2 left-0 right-0 opaque-panel rounded-2xl overflow-hidden py-1.5 z-50">
                <span className="px-3.5 py-2 text-[9px] font-bold uppercase tracking-wider text-zinc-500 block border-b border-white/5 mb-1">Switch Workspace</span>
                {store.organizations.map((org) => {
                  const isActive = org.id === store.activeOrg?.id;
                  return (
                    <button
                      key={org.id}
                      onClick={() => {
                        store.setActiveOrg(org);
                        setOrgDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-mono text-zinc-300 hover:bg-white/[0.03] transition-colors flex items-center justify-between"
                    >
                      <span className="truncate">{org.name}</span>
                      {isActive && <Check className="w-3.5 h-3.5 text-primary shrink-0 animate-fade-in" />}
                    </button>
                  );
                })}
                <button
                  onClick={() => {
                    setCreateOrgOpen(true);
                    setOrgDropdownOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-zinc-400 hover:bg-white/[0.03] transition-colors flex items-center gap-1.5 border-t border-white/5 mt-1.5 pt-2"
                >
                  <Plus className="w-3.5 h-3.5" /> Create Organization
                </button>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-270px)]">
            {sections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                {sIdx > 0 && <div className="border-t border-white/5 my-3 pt-2" />}
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center justify-between px-4 py-1.5"
                >
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                    {section.title}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${openSections[section.title] ? "rotate-180" : "rotate-0"}`} />
                </button>

                {openSections[section.title] && section.items.map((item) => {
                  const Icon = item.icon;
                  // Determine active state: if item includes a query (e.g. ?agent=foo) require both path and query match
                  const [basePath, queryPart] = item.path.split("?");
                  let isActive = false;
                  if (queryPart) {
                    // parse query key/value
                    try {
                      const qp = new URLSearchParams(queryPart);
                      // only support agent param for now
                      const agent = qp.get("agent");
                      const currentAgent = new URLSearchParams(location.search).get("agent");
                      isActive = location.pathname === basePath && agent === currentAgent;
                    } catch {
                      isActive = location.pathname === basePath;
                    }
                  } else {
                    isActive = location.pathname === basePath || (basePath === "/dashboard" && location.pathname === "/");
                  }

                  return (
                    <Link
                      key={`${item.path}-${item.name}`}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 relative ${
                        isActive
                          ? "bg-white/[0.03] text-white shadow-royal-glow"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.015] hover:translate-x-0.5"
                      }`}
                    >
                      {isActive && <span className="absolute left-1 top-2.5 bottom-2.5 w-1 rounded-full bg-gradient-to-b from-primary to-accent" />}
                      <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-zinc-500"}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* User profile / Sign out */}
        <div className="p-4 border-t border-white/5 space-y-3">
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-2.5">
              <Avatar src={store.user?.avatar_url} name={store.user?.full_name || store.user?.email || "User"} size="sm" />
              <div className="text-[11px] leading-tight">
                <div className="font-bold text-zinc-200 truncate max-w-[110px]">
                  {store.user?.full_name || store.user?.email?.split("@")[0]}
                </div>
                <div className="text-[9px] text-zinc-500 font-mono tracking-wider uppercase">
                  {store.user?.email}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-white/[0.02] border border-white/5 rounded-xl text-zinc-400 hover:text-rose-400 hover:border-rose-950/30 hover:bg-rose-550/5 text-xs font-semibold transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out Session
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative gap-4">
        {/* Header — z-40 keeps notification/org dropdowns above the content panel */}
        <header className="relative z-40 h-16 glass-panel flex items-center justify-between px-8 shrink-0">
          <Breadcrumbs />

          {/* Search, Notifications & Actions */}
            <div className="flex items-center gap-3">
              <SearchInput />
              <ThemeToggle size="sm" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 bg-white/[0.02] border border-white/5 rounded-xl text-zinc-400 hover:text-rose-400 hover:border-rose-950/30 hover:bg-rose-550/5 transition-colors text-xs font-semibold cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            {/* Notification Bell */}
            <div className="relative z-50">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-2 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] text-zinc-400 hover:text-zinc-200 transition-colors relative cursor-pointer"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center border-2 border-background shadow-royal-glow">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown overlay */}
              {notifDropdownOpen && (
                <div className="absolute right-0 top-12 w-80 opaque-panel rounded-2xl py-1 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-white/10 bg-[var(--bg-surface)] flex justify-between items-center">
                    <span className="text-xs font-bold text-zinc-200">Notification Center</span>
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] text-primary hover:underline font-semibold cursor-pointer"
                    >
                      Mark all read
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-white/5">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-zinc-500 text-xs font-mono">
                        All caught up! No notifications.
                      </div>
                    ) : (
                      notifications.map((n) => (
                          <div key={n.id} className={`p-3.5 text-left space-y-1.5 transition-colors hover:bg-white/[0.01] ${n.is_read ? "opacity-60" : "bg-primary/5"}`}>
                            <div className="flex justify-between text-[9px]">
                              <span className="font-bold text-zinc-400">{n.title}</span>
                              <span className="text-zinc-650 font-mono">{new Date(n.created_at).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-[11px] text-zinc-500 leading-normal">{n.message}</p>
                          </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Cloud connection link */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 border border-white/5 px-3 py-1.5 rounded-xl bg-white/[0.02]">
              <span className="w-1.5 h-1.5 rounded-full bg-accent pulse-active" />
              <span className="font-mono text-[10px] tracking-wide">AF_CLUSTER_01</span>
            </div>
          </div>
        </header>

        {/* View content window */}
        <div className="relative z-0 flex-1 overflow-y-auto p-8 glass-panel">
          <Outlet />
        </div>
      </main>

      {/* Create Org Modal */}
      <Modal open={createOrgOpen} onClose={() => setCreateOrgOpen(false)} title="Create New Organization">
        <form onSubmit={handleCreateOrg} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-zinc-400 mb-1 font-semibold uppercase tracking-wider">Org Name</label>
            <input
              type="text"
              required
              placeholder="e.g. AetherFlow Enterprise"
              value={newOrgName}
              onChange={(e) => {
                setNewOrgName(e.target.value);
                setNewOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
              }}
              className="w-full px-3 py-2 bg-zinc-900 border border-border rounded-lg text-zinc-200 focus:outline-none focus:border-primary text-xs"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1 font-semibold uppercase tracking-wider">Org Slug</label>
            <input
              type="text"
              required
              placeholder="e.g. aetherflow-enterprise"
              value={newOrgSlug}
              onChange={(e) => setNewOrgSlug(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-border rounded-lg text-zinc-200 focus:outline-none focus:border-primary text-xs"
            />
          </div>

          <Button type="submit" className="w-full mt-2">
            Register Workspace
          </Button>
        </form>
      </Modal>

    </div>
  );
}
