import { useState, useEffect } from "react";
import { useStore } from "../stores/store";
import { Badge } from "../components/Badge";
import { Card } from "../components/Card";
import { 
  RefreshCw, 
  Terminal, 
  User, 
  Activity, 
  Zap, 
  ShieldAlert, 
  Clock 
} from "lucide-react";

export function ActivityFeed() {
  const store = useStore();
  const [filterType, setFilterType] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    store.fetchActivityFeed(filterType || undefined);
    const interval = setInterval(() => {
      store.fetchActivityFeed(filterType || undefined);
    }, 4000);
    return () => clearInterval(interval);
  }, [filterType]);

  const filteredFeed = store.activityFeed.filter(evt => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      evt.event_type.toLowerCase().includes(query) ||
      evt.entity_type.toLowerCase().includes(query) ||
      (evt.details && evt.details.toLowerCase().includes(query))
    );
  });

  const getEventIcon = (type: string) => {
    if (type.startsWith("worker_")) return User;
    if (type.startsWith("job_")) return Activity;
    if (type.startsWith("queue_")) return Zap;
    if (type.includes("crashed") || type.includes("halt")) return ShieldAlert;
    return Terminal;
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-50 bg-gradient-to-r from-zinc-50 to-zinc-400 bg-clip-text text-transparent">
            System Activity Feed
          </h2>
          <p className="text-zinc-500 text-sm mt-1">
            Real-time audit log and transaction timeline of distributed scheduler events.
          </p>
        </div>
        <button
          onClick={() => store.fetchActivityFeed(filterType || undefined)}
          className="p-2 bg-zinc-900 border border-border rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center p-4 rounded-xl glass-panel border border-border">
        <input
          type="text"
          placeholder="Filter by event, details, or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 w-full bg-zinc-950 border border-border rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-primary"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-full sm:w-48 bg-zinc-950 border border-border rounded-lg px-3 py-2 text-xs font-mono text-zinc-400 focus:outline-none focus:border-primary"
        >
          <option value="">All Event Categories</option>
          <option value="worker_registered">Worker Registered</option>
          <option value="worker_offline">Worker Offline</option>
          <option value="job_claimed">Job Claimed</option>
          <option value="job_completed">Job Completed</option>
          <option value="job_failed">Job Failed</option>
          <option value="queue_paused">Queue Paused</option>
          <option value="queue_resumed">Queue Resumed</option>
        </select>
      </div>

      {/* Timeline list */}
      <Card title="Event Timeline" subtitle="Live stream of scheduling activities">
        {filteredFeed.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 font-mono text-xs">
            No system events matched the filter query.
          </div>
        ) : (
          <div className="relative pl-6 border-l border-border/80 ml-4 space-y-8 my-4">
            {filteredFeed.map((evt) => {
              const IconComponent = getEventIcon(evt.event_type);
              const isAlert = evt.event_type.includes("failed") || evt.event_type.includes("offline") || evt.event_type.includes("halt");
              
              return (
                <div key={evt.id} className="relative group">
                  {/* Bullet */}
                  <span className={`absolute -left-[35px] top-0.5 p-1.5 rounded-full border shadow-md transition-all duration-300 ${
                    isAlert ? "bg-red-950/20 border-red-500/30 text-red-400 group-hover:bg-red-900/20" : 
                    "bg-zinc-900 border-border text-zinc-400 group-hover:bg-zinc-800"
                  }`}>
                    <IconComponent className="w-3.5 h-3.5" />
                  </span>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pl-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs uppercase tracking-wide text-zinc-200">
                          {evt.event_type.replace(/_/g, " ")}
                        </span>
                        <Badge variant={isAlert ? "danger" : "neutral"}>
                          {evt.entity_type}
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 font-mono">{evt.details || "No details provided."}</p>
                    </div>

                    <div className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

    </div>
  );
}
