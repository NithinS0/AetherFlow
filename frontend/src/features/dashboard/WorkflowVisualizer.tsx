import { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MarkerType
} from "reactflow";
import type { Node, Edge } from "reactflow";
import "reactflow/dist/style.css";

interface VisualizerProps {
  metrics: any;
  queues: any[];
  workers: any[];
}

export function WorkflowVisualizer({ metrics, queues, workers }: VisualizerProps) {
  // Compute numbers for label nodes
  const totalBacklog = metrics?.backlog_size || 0;
  const runningJobs = metrics?.running_jobs || 0;
  const totalFailed = metrics?.failed_jobs || 0;
  const totalSuccess = metrics?.completed_jobs || 0;

  // React Flow Nodes
  const nodes = useMemo<Node[]>(() => {
    return [
      {
        id: "1",
        type: "input",
        data: {
          label: (
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-center shadow-lg">
              <div className="text-[10px] text-zinc-500 font-mono font-bold uppercase">Backlog Pool</div>
              <div className="text-xl font-extrabold text-blue-400 font-mono">{totalBacklog}</div>
              <div className="text-[9px] text-zinc-500 mt-0.5">Pending Execution</div>
            </div>
          )
        },
        position: { x: 50, y: 150 },
        style: { width: 150, padding: 0, border: "none" }
      },
      {
        id: "2",
        data: {
          label: (
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-center shadow-lg">
              <div className="text-[10px] text-zinc-500 font-mono font-bold uppercase">Active Queues</div>
              <div className="text-xl font-extrabold text-indigo-400 font-mono">{queues?.length || 0}</div>
              <div className="text-[9px] text-emerald-500 mt-0.5">Scheduler Loop OK</div>
            </div>
          )
        },
        position: { x: 280, y: 150 },
        style: { width: 160, padding: 0, border: "none" }
      },
      {
        id: "3",
        data: {
          label: (
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-center shadow-lg">
              <div className="text-[10px] text-zinc-500 font-mono font-bold uppercase">Worker Pool</div>
              <div className="text-xl font-extrabold text-cyan-400 font-mono">{workers?.length || 0}</div>
              <div className="text-[9px] text-zinc-400 mt-0.5">{runningJobs} Active Tasks</div>
            </div>
          )
        },
        position: { x: 520, y: 150 },
        style: { width: 160, padding: 0, border: "none" }
      },
      {
        id: "4",
        type: "output",
        data: {
          label: (
            <div className="p-3 bg-zinc-900 border border-emerald-900/50 rounded-lg text-center shadow-lg">
              <div className="text-[10px] text-zinc-500 font-mono font-bold uppercase">Success Registry</div>
              <div className="text-xl font-extrabold text-emerald-400 font-mono">{totalSuccess}</div>
              <div className="text-[9px] text-zinc-500 mt-0.5">Completed Jobs</div>
            </div>
          )
        },
        position: { x: 760, y: 50 },
        style: { width: 150, padding: 0, border: "none" }
      },
      {
        id: "5",
        type: "output",
        data: {
          label: (
            <div className="p-3 bg-zinc-900 border border-red-950/60 rounded-lg text-center shadow-lg">
              <div className="text-[10px] text-zinc-500 font-mono font-bold uppercase">Dead Letter (DLQ)</div>
              <div className="text-xl font-extrabold text-red-500 font-mono">{totalFailed}</div>
              <div className="text-[9px] text-zinc-500 mt-0.5">Failed Exceptions</div>
            </div>
          )
        },
        position: { x: 760, y: 250 },
        style: { width: 150, padding: 0, border: "none" }
      }
    ];
  }, [totalBacklog, queues?.length, workers?.length, runningJobs, totalSuccess, totalFailed]);

  // React Flow Edges
  const edges = useMemo<Edge[]>(() => {
    const isActivity = runningJobs > 0 || totalBacklog > 0;

    return [
      {
        id: "e1-2",
        source: "1",
        target: "2",
        animated: isActivity,
        style: { stroke: "#6366f1" },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#6366f1" }
      },
      {
        id: "e2-3",
        source: "2",
        target: "3",
        animated: isActivity,
        style: { stroke: "#06b6d4" },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#06b6d4" }
      },
      {
        id: "e3-4",
        source: "3",
        target: "4",
        animated: totalSuccess > 0 && isActivity,
        style: { stroke: "#10b981" },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#10b981" }
      },
      {
        id: "e3-5",
        source: "3",
        target: "5",
        animated: totalFailed > 0,
        style: { stroke: "#ef4444" },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#ef4444" }
      }
    ];
  }, [runningJobs, totalBacklog, totalSuccess, totalFailed]);

  return (
    <div className="h-[360px] w-full rounded-2xl glass-panel border border-border p-4 relative overflow-hidden">
      {/* Absolute Header Overlay */}
      <div className="absolute top-4 left-6 z-10">
        <h3 className="text-sm font-bold tracking-tight text-zinc-200">
          Orchestration Pipeline Topology
        </h3>
        <p className="text-[11px] text-zinc-500">
          Real-time execution routing and packet flow through the scheduler
        </p>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnScroll={false}
        panOnDrag={false}
      >
        <Background color="#27272a" gap={16} />
        <Controls showInteractive={false} position="bottom-right" />
      </ReactFlow>
    </div>
  );
}
