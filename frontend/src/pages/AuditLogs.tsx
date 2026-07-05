import { useEffect, useState } from "react";
import { useStore } from "../stores/store";

import { Table } from "../components/Table";
import { Card } from "../components/Card";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function AuditLogs() {
  const store = useStore();
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      await store.fetchAuditLogs();
    } catch {
      toast.error("Failed to load audit trails");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    store.fetchAuditLogs();
  }, []);

  const columns = [
    { 
      key: "action", 
      header: "Action Event",
      render: (row: any) => (
        <span className="font-mono text-primary font-bold uppercase text-[10px]">
          {row.action}
        </span>
      )
    },
    { key: "entity_type", header: "Entity Scope" },
    { key: "entity_id", header: "Entity UUID" },
    { key: "details", header: "Log Description" },
    { 
      key: "timestamp", 
      header: "Executed Time",
      render: (row: any) => (
        <span className="font-mono text-zinc-500 text-[10px]">
          {new Date(row.timestamp).toLocaleString()}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-50 bg-gradient-to-r from-zinc-50 to-zinc-400 bg-clip-text text-transparent">
            Workspace Audit Trails
          </h2>
          <p className="text-zinc-500 text-sm mt-1">
            Immutable security log registers recording all operator commands and metadata adjustments.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="p-2 bg-zinc-900 border border-border rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter panel */}
      <div className="p-4 rounded-xl glass-panel border border-border flex flex-wrap gap-4 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 uppercase tracking-wider font-semibold">Filter Event:</span>
          <input
            type="text"
            placeholder="e.g. user_login"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-zinc-900 border border-border rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 uppercase tracking-wider font-semibold">Filter Scope:</span>
          <input
            type="text"
            placeholder="e.g. organization"
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-zinc-900 border border-border rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-primary"
          />
        </div>
        <button
          onClick={fetchLogs}
          className="px-4 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-semibold cursor-pointer transition-all"
        >
          Search Logs
        </button>
      </div>

      {/* Table Card */}
      <Card title="Immutable Audit Registry" subtitle="Immutable logs stored in Supabase PostgreSQL cluster">
        <Table columns={columns} data={store.auditLogs} loading={loading} />
      </Card>
    </div>
  );
}
