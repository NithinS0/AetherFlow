import { useState, useEffect } from "react";
import { useStore } from "../stores/store";
import { api } from "../services/api";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { 
  RefreshCw, 
  Settings, 
  Clock, 
  CheckCircle2,
  Wrench,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

export function RetryManagement() {
  const store = useStore();
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form states
  const [policyName, setPolicyName] = useState("");
  const [policyType, setPolicyType] = useState("exponential");
  const [maxRetries, setMaxRetries] = useState(3);
  const [initialDelay, setInitialDelay] = useState(5);
  const [backoffFactor, setBackoffFactor] = useState(2);
  const [useJitter, setUseJitter] = useState(true);

  const activeProj = store.projects[0];

  useEffect(() => {
    store.fetchRetryPolicies();
    if (activeProj) {
      store.fetchReliability(activeProj.id);
    }
  }, [activeProj]);

  const triggerRefresh = () => {
    store.fetchRetryPolicies();
    if (activeProj) store.fetchReliability(activeProj.id);
  };

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/retry-policies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("aetherflow_token")}`
        },
        body: JSON.stringify({
          name: policyName,
          type: policyType,
          max_retries: Number(maxRetries),
          initial_delay_seconds: Number(initialDelay),
          backoff_factor: Number(backoffFactor),
          jitter_enabled: useJitter
        })
      });

      if (!res.ok) throw new Error("Creation failed");
      toast.success(`Retry policy '${policyName}' created successfully`);
      setCreateModalOpen(false);
      resetForm();
      triggerRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to create policy");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPolicyName("");
    setPolicyType("exponential");
    setMaxRetries(3);
    setInitialDelay(5);
    setBackoffFactor(2);
    setUseJitter(true);
  };

  const handleManualHeal = async () => {
    try {
      const res = await api.triggerManualHeal();
      toast.success(res.message || "Manual healing check dispatched.");
      triggerRefresh();
    } catch {
      toast.error("Failed to run healing diagnostics");
    }
  };

  const policyColumns = [
    {
      key: "name",
      header: "Policy Name",
      render: (row: any) => (
        <span className="font-bold text-zinc-200">{row.name}</span>
      )
    },
    {
      key: "type",
      header: "Strategy Type",
      render: (row: any) => (
        <span className="font-mono text-[10px] uppercase font-bold text-zinc-400">{row.type}</span>
      )
    },
    {
      key: "max_retries",
      header: "Max Attempts",
      render: (row: any) => (
        <span className="font-mono text-zinc-300 font-bold">{row.max_retries} runs</span>
      )
    },
    {
      key: "initial_delay_seconds",
      header: "Initial Delay",
      render: (row: any) => (
        <span className="font-mono text-zinc-400">{row.initial_delay_seconds} seconds</span>
      )
    },
    {
      key: "backoff_factor",
      header: "Backoff Factor",
      render: (row: any) => (
        <span className="font-mono text-zinc-400">{row.backoff_factor}x</span>
      )
    },
    {
      key: "jitter_enabled",
      header: "Jitter",
      render: (row: any) => (
        <Badge variant={row.jitter_enabled ? "success" : "neutral"}>
          {row.jitter_enabled ? "Enabled" : "Disabled"}
        </Badge>
      )
    }
  ];

  const recoveriesColumns = [
    {
      key: "id",
      header: "Incident ID",
      render: (row: any) => (
        <span className="font-mono text-zinc-500 font-semibold">{row.id.slice(0, 8)}...</span>
      )
    },
    {
      key: "type",
      header: "Failure Trigger",
      render: (row: any) => (
        <span className="font-mono font-bold text-zinc-300 text-[10px]">{row.type.toUpperCase()}</span>
      )
    },
    {
      key: "success",
      header: "Outcome",
      render: (row: any) => (
        <Badge variant={row.success ? "success" : "danger"}>
          {row.success ? "Auto-Recovered" : "Limit Exceeded"}
        </Badge>
      )
    },
    {
      key: "duration_ms",
      header: "Replay Duration",
      render: (row: any) => (
        <span className="font-mono text-zinc-400">{row.duration_ms}ms</span>
      )
    },
    {
      key: "timestamp",
      header: "Recovered At",
      render: (row: any) => (
        <span className="font-mono text-[10px] text-zinc-500">{new Date(row.timestamp).toLocaleString()}</span>
      )
    }
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-50 bg-gradient-to-r from-zinc-50 to-zinc-400 bg-clip-text text-transparent">
            Retry Engine Management
          </h2>
          <p className="text-zinc-500 text-sm mt-1">
            Configure linear/exponential backoff strategies, map retry thresholds, and inspect auto-recovery timelines.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleManualHeal} variant="outline" size="sm">
            <Wrench className="w-4 h-4" /> Diagnostics
          </Button>
          <Button onClick={() => setCreateModalOpen(true)} size="sm">
            <Settings className="w-4 h-4" /> Create Policy
          </Button>
          <button
            onClick={triggerRefresh}
            className="p-2 bg-zinc-900 border border-border rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Policies List */}
        <div className="xl:col-span-2 space-y-6">
          <Card title="Active Retry Policies" subtitle="Logical backoff parameters mapped to scheduler queues">
            <Table columns={policyColumns} data={store.retryPolicies} />
          </Card>

          <Card title="Retry & Recovery Timeline" subtitle="Historical register of automated execution retry cycles">
            <Table columns={recoveriesColumns} data={store.recoveryEvents} />
          </Card>
        </div>

        {/* Info panel */}
        <div className="xl:col-span-1 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1 flex items-center gap-1.5">
            <Clock className="w-4.5 h-4.5 text-zinc-400" /> Backoff Math & Jitter
          </h3>
          <div className="p-5 rounded-2xl glass-panel border border-border space-y-4 text-xs font-mono text-zinc-400 leading-relaxed">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4.5 h-4.5 text-primary shrink-0 mt-0.5" />
              <div>
                <strong className="text-zinc-200 block mb-1">Exponential Backoff</strong>
                Each consecutive retry attempt multiplies the initial delay. Delay formula: Delay = Base * Factor^attempt.
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-zinc-200 block mb-1">Randomized Jitter</strong>
                Enabling Jitter adds a random offset to prevent the "thundering herd" problem where multiple workers retry simultaneously.
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Create Policy Modal */}
      <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Register Retry Policy">
        <form onSubmit={handleCreatePolicy} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-zinc-400 mb-1 font-semibold uppercase tracking-wider">Policy Identifier Name</label>
            <input
              type="text"
              required
              placeholder="e.g. exponential-critical-backoff"
              value={policyName}
              onChange={(e) => setPolicyName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-border rounded-lg text-zinc-200 focus:outline-none focus:border-primary text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 mb-1.5 font-semibold uppercase tracking-wider">Backoff Strategy</label>
              <select
                value={policyType}
                onChange={(e) => setPolicyType(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-border rounded-lg text-zinc-200 focus:outline-none focus:border-primary text-xs"
              >
                <option value="exponential">Exponential</option>
                <option value="linear">Linear</option>
                <option value="fixed">Fixed Delay</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1.5 font-semibold uppercase tracking-wider">Max Retries</label>
              <input
                type="number"
                required
                min={1}
                max={10}
                value={maxRetries}
                onChange={(e) => setMaxRetries(Number(e.target.value))}
                className="w-full px-3 py-2 bg-zinc-900 border border-border rounded-lg text-zinc-200 focus:outline-none focus:border-primary text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 mb-1.5 font-semibold uppercase tracking-wider">Initial Delay (seconds)</label>
              <input
                type="number"
                required
                min={1}
                max={300}
                value={initialDelay}
                onChange={(e) => setInitialDelay(Number(e.target.value))}
                className="w-full px-3 py-2 bg-zinc-900 border border-border rounded-lg text-zinc-200 focus:outline-none focus:border-primary text-xs"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1.5 font-semibold uppercase tracking-wider">Backoff Factor</label>
              <input
                type="number"
                required
                min={1}
                max={5}
                value={backoffFactor}
                onChange={(e) => setBackoffFactor(Number(e.target.value))}
                className="w-full px-3 py-2 bg-zinc-900 border border-border rounded-lg text-zinc-200 focus:outline-none focus:border-primary text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 py-2">
            <label className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors select-none cursor-pointer">
              <input
                type="checkbox"
                checked={useJitter}
                onChange={(e) => setUseJitter(e.target.checked)}
                className="rounded bg-zinc-900 border-border text-primary focus:ring-0"
              />
              Jitter Enabled
            </label>
          </div>

          <Button type="submit" loading={loading} className="w-full mt-2">
            Register Policy
          </Button>
        </form>
      </Modal>

    </div>
  );
}
