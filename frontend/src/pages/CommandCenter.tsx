import { useState } from "react";
import { api } from "../services/api";
import { Card } from "../components/Card";
import { 
  ShieldAlert, 
  Play, 
  Pause, 
  RotateCw
} from "lucide-react";
import { toast } from "sonner";

export function CommandCenter() {
  const [loading, setLoading] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "SRE Command gateway initialized.",
    "AetherFlow Node Cluster connected."
  ]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setConsoleLogs(prev => [`[${time}] ${msg}`, ...prev]);
  };

  const handleCommand = async (command: string, label: string) => {
    const confirm = window.confirm(`OPERATOR CLEARANCE REQUIRED: Confirm dispatching [${label}] command to SRE cluster?`);
    if (!confirm) return;

    setLoading(true);
    addLog(`Dispatching emergency cluster call: ${command.toUpperCase()}`);
    try {
      const res = await api.dispatchCommand(command);
      toast.success(res.details || "Command executed successfully.");
      addLog(`SYSTEM REPORT: ${res.details}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to dispatch command.");
      addLog(`FAILURE SIGNAL: Command execution aborted: ${e.message || "Network exception"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-zinc-50 bg-gradient-to-r from-zinc-50 to-zinc-400 bg-clip-text text-transparent">
          Operations Command Center
        </h2>
        <p className="text-zinc-500 text-sm mt-1">
          Authorized SRE console. Execute pipeline emergency halts, node drains, and worker restarts.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Actions grid */}
        <div className="xl:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Emergency Halt */}
            <div className="p-6 rounded-2xl glass-panel border border-red-950/20 bg-red-950/5 flex flex-col justify-between space-y-4">
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-red-900/10 border border-red-950 rounded-xl text-red-500">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-red-400 text-sm tracking-wide font-mono">Emergency Stop (Halt)</h4>
                  <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                    Instantly pauses all scheduling channels. Workers finish active executions, but no new jobs are dispatched.
                  </p>
                </div>
              </div>
              <button
                disabled={loading}
                onClick={() => handleCommand("emergency_stop", "EMERGENCY STOP")}
                className="w-full py-2.5 bg-red-900 hover:bg-red-800 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-red-950/50 cursor-pointer"
              >
                Trigger Cluster Halt
              </button>
            </div>

            {/* Resume Scheduling */}
            <div className="p-6 rounded-2xl glass-panel border border-emerald-950/20 bg-emerald-950/5 flex flex-col justify-between space-y-4">
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-emerald-900/10 border border-emerald-950 rounded-xl text-emerald-500">
                  <Play className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-400 text-sm tracking-wide font-mono">Resume Pipelines</h4>
                  <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                    Resumes all paused queue channels back to active status, triggering immediate worker claiming.
                  </p>
                </div>
              </div>
              <button
                disabled={loading}
                onClick={() => handleCommand("resume_all_queues", "RESUME ALL QUEUES")}
                className="w-full py-2.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 hover:text-white font-bold rounded-xl text-xs border border-emerald-900/50 transition-all cursor-pointer"
              >
                Resume Scheduling
              </button>
            </div>

            {/* Pause Scheduling */}
            <div className="p-6 rounded-2xl glass-panel border border-border flex flex-col justify-between space-y-4">
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-zinc-900 border border-border rounded-xl text-zinc-400">
                  <Pause className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-300 text-sm tracking-wide font-mono">Pause All Queues</h4>
                  <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                    Pauses scheduling without invoking emergency shutdown thresholds.
                  </p>
                </div>
              </div>
              <button
                disabled={loading}
                onClick={() => handleCommand("pause_all_queues", "PAUSE QUEUES")}
                className="w-full py-2.5 bg-zinc-900 border border-border text-zinc-400 hover:text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Pause Pipelines
              </button>
            </div>

            {/* Restart Engine */}
            <div className="p-6 rounded-2xl glass-panel border border-border flex flex-col justify-between space-y-4">
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-zinc-900 border border-border rounded-xl text-zinc-400">
                  <RotateCw className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-300 text-sm tracking-wide font-mono">Restart Scheduler</h4>
                  <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                    Issues a soft-reboot command to the scheduler process core.
                  </p>
                </div>
              </div>
              <button
                disabled={loading}
                onClick={() => handleCommand("restart_scheduler", "RESTART SCHEDULER")}
                className="w-full py-2.5 bg-zinc-900 border border-border text-zinc-400 hover:text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Reboot Core Engine
              </button>
            </div>

          </div>
        </div>

        {/* Live console logs */}
        <div className="xl:col-span-1">
          <Card title="Operator Telemetry stdout" subtitle="Live stream of issued commands audit trail">
            <div className="p-4 bg-zinc-950 border border-border rounded-xl font-mono text-[10px] text-emerald-400 h-[280px] overflow-y-auto space-y-2 leading-relaxed">
              {consoleLogs.map((log, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-zinc-600 select-none">&gt;</span>
                  <span className="text-zinc-300">{log}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
