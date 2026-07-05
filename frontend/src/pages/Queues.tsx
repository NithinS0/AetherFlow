import { useState, useEffect } from "react";
import { API_URL } from "../services/api";
import { useStore } from "../stores/store";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { 
  Plus, 
  Play, 
  Pause, 
  Archive, 
  Copy, 
  Download, 
  Upload, 
  Heart, 
  LayoutGrid
} from "lucide-react";
import { toast } from "sonner";

export function Queues() {
  const store = useStore();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importJson, setImportJson] = useState("");

  // Form Fields
  const [qName, setQName] = useState("");
  const [qDesc, setQDesc] = useState("");
  const [qPriority, setQPriority] = useState("medium");
  const [qConcurrency, setQConcurrency] = useState(5);
  const [qMaxCapacity, setQMaxCapacity] = useState(1000);
  const [qDlq, setQDlq] = useState(true);
  const [qRetry, setQRetry] = useState(true);
  const [selectedPolicyId, setSelectedPolicyId] = useState("");
  const [qTags, setQTags] = useState("");

  const [loading, setLoading] = useState(false);

  const activeOrg = store.activeOrg;
  const activeProj = store.projects[0]; // main project or active context

  useEffect(() => {
    if (activeProj) {
      store.fetchQueues(activeProj.id);
    }
  }, [activeProj]);

  const handleCreateQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg || !activeProj) {
      toast.error("Select an organization and project context first.");
      return;
    }
    setLoading(true);

    const tagsArray = qTags.split(",").map(t => t.trim()).filter(Boolean);

    try {
      // Direct REST API create call
      const res = await fetch(`${API_URL}/queues`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("aetherflow_token")}`
        },
        body: JSON.stringify({
          name: qName,
          description: qDesc,
          organization_id: activeOrg.id,
          project_id: activeProj.id,
          priority: qPriority,
          concurrency_limit: Number(qConcurrency),
          max_queue_size: Number(qMaxCapacity),
          dlq_enabled: qDlq,
          auto_retry: qRetry,
          retry_policy_id: selectedPolicyId || null,
          tags: tagsArray
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Create failed");
      }

      toast.success(`Queue '${qName}' registered successfully`);
      setCreateModalOpen(false);
      resetForm();
      store.fetchQueues(activeProj.id);
    } catch (err: any) {
      toast.error(err.message || "Failed to register execution queue");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setQName("");
    setQDesc("");
    setQPriority("medium");
    setQConcurrency(5);
    setQMaxCapacity(1000);
    setQDlq(true);
    setQRetry(true);
    setSelectedPolicyId("");
    setQTags("");
  };

  const handleToggleStatus = async (queueId: string, currentPaused: boolean) => {
    const action = currentPaused ? "resume" : "pause";
    try {
      const res = await fetch(`${API_URL}/queues/${queueId}/status?status=${action}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("aetherflow_token")}`
        }
      });
      if (!res.ok) throw new Error("Toggle status failed");
      toast.success(`Queue status set to ${action}d`);
      if (activeProj) store.fetchQueues(activeProj.id);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleArchive = async (queueId: string) => {
    const confirm = window.confirm("Are you sure you want to archive this execution queue? Stored jobs inside will be frozen.");
    if (!confirm) return;

    try {
      const res = await fetch(`${API_URL}/queues/${queueId}/archive`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("aetherflow_token")}`
        }
      });
      if (!res.ok) throw new Error("Archive failed");
      toast.success("Execution queue archived");
      if (activeProj) store.fetchQueues(activeProj.id);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleClone = async (queueId: string) => {
    try {
      const res = await fetch(`${API_URL}/queues/${queueId}/clone`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("aetherflow_token")}`
        }
      });
      if (!res.ok) throw new Error("Clone failed");
      toast.success("Execution queue cloned successfully");
      if (activeProj) store.fetchQueues(activeProj.id);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Export JSON configuration file
  const handleExport = async (queue: any) => {
    try {
      const res = await fetch(`${API_URL}/queues/${queue.id}/export`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("aetherflow_token")}`
        }
      });
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${queue.name}-config.json`;
      a.click();
      toast.success("Queue configuration exported successfully");
    } catch {
      toast.error("Export failed");
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg || !activeProj) return;
    setLoading(true);

    try {
      const parsed = JSON.parse(importJson);
      const res = await fetch(`${API_URL}/queues/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("aetherflow_token")}`
        },
        body: JSON.stringify({
          config: parsed,
          organization_id: activeOrg.id,
          project_id: activeProj.id
        })
      });

      if (!res.ok) throw new Error("Import failed");
      toast.success("Config imported successfully");
      setImportModalOpen(false);
      setImportJson("");
      store.fetchQueues(activeProj.id);
    } catch (err: any) {
      toast.error(err.message || "Invalid JSON syntax");
    } finally {
      setLoading(false);
    }
  };

  // Templates
  const templates = [
    { name: "Email Relay Queue", desc: "Seeded for transaction notifications and campaigns", concurrency: 5, capacity: 1000, priority: "medium", tags: "email, smtp" },
    { name: "Image Optimization Batch", desc: "Batch processes media uploads into modern responsive assets", concurrency: 3, capacity: 2000, priority: "high", tags: "media, optimization" },
    { name: "Background Sync Logger", desc: "Siphon and stream application tracing logs into S3", concurrency: 2, capacity: 5000, priority: "low", tags: "background, sync" },
  ];

  const handleLoadTemplate = (tpl: any) => {
    setQName(tpl.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
    setQDesc(tpl.desc);
    setQConcurrency(tpl.concurrency);
    setQMaxCapacity(tpl.capacity);
    setQPriority(tpl.priority);
    setQTags(tpl.tags);
    setCreateModalOpen(true);
    toast.info(`Loaded template: ${tpl.name}`);
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-50 bg-gradient-to-r from-zinc-50 to-zinc-400 bg-clip-text text-transparent">
            Queue Configuration
          </h2>
          <p className="text-zinc-500 text-sm mt-1">
            Build execution channels, configure concurrency boundaries, and define retry backoff policies.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setImportModalOpen(true)} variant="outline" size="sm">
            <Upload className="w-4 h-4" /> Import JSON
          </Button>
          <Button onClick={() => setCreateModalOpen(true)} size="sm">
            <Plus className="w-4 h-4" /> Create Queue
          </Button>
        </div>
      </div>

      {/* Grid splits active queues vs templates */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Active queues */}
        <div className="xl:col-span-2 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">Active Execution Queues</h3>
          {store.queues.length === 0 ? (
            <div className="p-12 text-center border border-border rounded-2xl glass-panel text-zinc-500 font-medium font-mono text-xs">
              No queues registered in this project. Create a queue or import a config.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {store.queues.map((q) => {
                const healthColor = q.health_score > 80 ? "text-emerald-400 border-emerald-950/45 bg-emerald-500/5" :
                                    q.health_score > 50 ? "text-amber-400 border-amber-950/45 bg-amber-500/5" :
                                    "text-red-400 border-red-950/45 bg-red-500/5";
                return (
                  <div key={q.id} className="p-6 rounded-2xl glass-panel border border-border flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden transition-all duration-300 hover:border-primary/20">
                    
                    {/* Header info */}
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-zinc-200 text-sm tracking-wide">{q.name}</h4>
                          <span className="text-[10px] font-mono text-zinc-500 mt-1 block">Priority: <span className="uppercase text-primary font-bold">{q.priority}</span></span>
                        </div>
                        <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 ${healthColor}`}>
                          <Heart className="w-2.5 h-2.5 fill-current" /> {q.health_score}%
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-3.5 leading-relaxed truncate">{q.description || "No description provided."}</p>
                    </div>

                    {/* Stats & Metadata parameters */}
                    <div className="grid grid-cols-2 gap-4 py-3.5 border-y border-border/40 text-[10px] font-mono text-zinc-500">
                      <div>
                        <span>Concurrency Limit:</span>
                        <span className="text-zinc-300 font-bold block mt-0.5">{q.concurrency_limit} concurrent runs</span>
                      </div>
                      <div>
                        <span>Max Capacity:</span>
                        <span className="text-zinc-300 font-bold block mt-0.5">{q.max_queue_size} items</span>
                      </div>
                    </div>

                    {/* Actions bar */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleStatus(q.id, q.is_paused)}
                        className="flex-1 py-2 bg-zinc-900 border border-border text-zinc-400 hover:text-zinc-200 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {q.is_paused ? (
                          <>
                            <Play className="w-3.5 h-3.5" /> Resume
                          </>
                        ) : (
                          <>
                            <Pause className="w-3.5 h-3.5" /> Pause
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleClone(q.id)}
                        className="p-2 bg-zinc-900 border border-border text-zinc-500 hover:text-cyan-400 hover:border-cyan-950 rounded-lg transition-colors cursor-pointer"
                        title="Clone Configuration"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleExport(q)}
                        className="p-2 bg-zinc-900 border border-border text-zinc-500 hover:text-indigo-400 hover:border-indigo-950 rounded-lg transition-colors cursor-pointer"
                        title="Export JSON Configuration"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleArchive(q.id)}
                        className="p-2 bg-zinc-900 border border-border text-zinc-500 hover:text-red-400 hover:border-red-950 rounded-lg transition-colors cursor-pointer"
                        title="Archive"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Templates Panel */}
        <div className="xl:col-span-1 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">Pre-Seeded Templates</h3>
          <div className="space-y-4">
            {templates.map((tpl, idx) => (
              <div key={idx} className="p-4 rounded-xl glass-panel border border-border flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="font-bold text-zinc-200 text-xs flex items-center gap-1.5">
                    <LayoutGrid className="w-3.5 h-3.5 text-primary" /> {tpl.name}
                  </h4>
                  <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">{tpl.desc}</p>
                </div>
                <button
                  onClick={() => handleLoadTemplate(tpl)}
                  className="w-full py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/25 text-primary hover:text-white font-bold rounded-lg text-[10px] transition-colors cursor-pointer"
                >
                  Import Template Configuration
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Create Queue Modal */}
      <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create Execution Queue">
        <form onSubmit={handleCreateQueue} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-zinc-400 mb-1 font-semibold uppercase tracking-wider">Queue Name</label>
            <input
              type="text"
              required
              placeholder="e.g. email-relay-cluster"
              value={qName}
              onChange={(e) => setQName(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}
              className="w-full px-3 py-2 bg-zinc-900 border border-border rounded-lg text-zinc-200 focus:outline-none focus:border-primary text-xs"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1 font-semibold uppercase tracking-wider">Description</label>
            <textarea
              rows={2}
              placeholder="Provide queue contextual description..."
              value={qDesc}
              onChange={(e) => setQDesc(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-border rounded-lg text-zinc-200 focus:outline-none focus:border-primary text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 mb-1.5 font-semibold uppercase tracking-wider">Priority Tier</label>
              <select
                value={qPriority}
                onChange={(e) => setQPriority(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-border rounded-lg text-zinc-200 focus:outline-none focus:border-primary text-xs"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1.5 font-semibold uppercase tracking-wider">Map Retry Policy</label>
              <select
                value={selectedPolicyId}
                onChange={(e) => setSelectedPolicyId(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-border rounded-lg text-zinc-200 focus:outline-none focus:border-primary text-xs"
              >
                <option value="">-- No policy (default 3 retries) --</option>
                {store.retryPolicies.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 mb-1.5 font-semibold uppercase tracking-wider">Concurrency Limit</label>
              <input
                type="number"
                required
                min={1}
                max={50}
                value={qConcurrency}
                onChange={(e) => setQConcurrency(Number(e.target.value))}
                className="w-full px-3 py-2 bg-zinc-900 border border-border rounded-lg text-zinc-200 focus:outline-none focus:border-primary text-xs"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1.5 font-semibold uppercase tracking-wider">Max Size Capacity</label>
              <input
                type="number"
                required
                min={100}
                max={10000}
                value={qMaxCapacity}
                onChange={(e) => setQMaxCapacity(Number(e.target.value))}
                className="w-full px-3 py-2 bg-zinc-900 border border-border rounded-lg text-zinc-200 focus:outline-none focus:border-primary text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1 font-semibold uppercase tracking-wider">Queue Tags (comma-separated)</label>
            <input
              type="text"
              placeholder="e.g. smtp, system, critical"
              value={qTags}
              onChange={(e) => setQTags(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-border rounded-lg text-zinc-200 focus:outline-none focus:border-primary text-xs"
            />
          </div>

          <div className="flex items-center gap-6 py-2">
            <label className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors select-none cursor-pointer">
              <input
                type="checkbox"
                checked={qDlq}
                onChange={(e) => setQDlq(e.target.checked)}
                className="rounded bg-zinc-900 border-border text-primary focus:ring-0"
              />
              DLQ Enabled
            </label>

            <label className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors select-none cursor-pointer">
              <input
                type="checkbox"
                checked={qRetry}
                onChange={(e) => setQRetry(e.target.checked)}
                className="rounded bg-zinc-900 border-border text-primary focus:ring-0"
              />
              Auto Retry Enabled
            </label>
          </div>

          <Button type="submit" loading={loading} className="w-full mt-2">
            Register Channel
          </Button>
        </form>
      </Modal>

      {/* Import Modal */}
      <Modal open={importModalOpen} onClose={() => setImportModalOpen(false)} title="Import JSON Configuration">
        <form onSubmit={handleImport} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-zinc-400 mb-1.5 font-semibold uppercase tracking-wider">JSON Content</label>
            <textarea
              rows={8}
              required
              placeholder='{ "name": "custom-imported", "priority": "high", "concurrency_limit": 5, "tags": ["imported"] }'
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-border rounded-lg text-zinc-200 focus:outline-none focus:border-primary text-xs font-mono"
            />
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Process Import
          </Button>
        </form>
      </Modal>

    </div>
  );
}
