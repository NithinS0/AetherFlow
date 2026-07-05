import { useEffect } from "react";
import { useStore } from "../stores/store";
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  MarkerType
} from "reactflow";
import "reactflow/dist/style.css";
import { RefreshCw, Radio } from "lucide-react";

export function Topology() {
  const store = useStore();

  useEffect(() => {
    store.fetchTopology();
    const interval = setInterval(() => {
      store.fetchTopology();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const rawTopo = store.topologyData || { nodes: [], edges: [] };

  // Organize coordinates to lay them out horizontally cleanly
  // Column 1: API (x=50, y=250)
  // Column 2: DB (x=250, y=250)
  // Column 3: Queues (x=450, y=100 + i * 180)
  // Column 4: Workers (x=700, y=50 + i * 150)
  let queueIndex = 0;
  let workerIndex = 0;

  const nodes = rawTopo.nodes.map((n: any) => {
    let position = { x: 50, y: 250 };
    let color = "border-emerald-500/30 text-emerald-400 bg-emerald-950/10";
    
    if (n.data.status === "warning") {
      color = "border-amber-500/30 text-amber-400 bg-amber-950/10";
    } else if (n.data.status === "offline" || n.data.status === "critical") {
      color = "border-red-500/30 text-red-400 bg-red-950/10";
    } else if (n.data.status === "busy") {
      color = "border-blue-500/30 text-blue-400 bg-blue-950/10";
    }

    if (n.id === "api") {
      position = { x: 50, y: 250 };
    } else if (n.id === "db") {
      position = { x: 250, y: 250 };
    } else if (n.id.startsWith("q-")) {
      position = { x: 450, y: 100 + queueIndex * 180 };
      queueIndex++;
    } else if (n.id.startsWith("w-")) {
      position = { x: 700, y: 50 + workerIndex * 150 };
      workerIndex++;
    }

    return {
      id: n.id,
      position,
      data: { 
        label: (
          <div className="flex flex-col items-center">
            <span className="font-bold text-[10px] font-mono tracking-wide">{n.data.label}</span>
            <div className="flex items-center gap-1 mt-1 text-[8px] opacity-75 font-mono">
              <span className={`w-1.5 h-1.5 rounded-full ${
                n.data.status === 'healthy' || n.data.status === 'online' || n.data.status === 'idle' ? 'bg-emerald-500' :
                n.data.status === 'busy' ? 'bg-blue-500' :
                n.data.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
              }`} />
              <span>{n.data.status.toUpperCase()}</span>
            </div>
          </div>
        )
      },
      className: `p-3 border rounded-xl glass-panel text-[11px] font-mono flex items-center justify-center text-center shadow-lg transition-all duration-300 ${color}`,
      style: { width: 140 }
    };
  });

  const edges = rawTopo.edges.map((e: any) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    animated: e.animated,
    style: { 
      stroke: e.animated ? "#3b82f6" : "#27272a", 
      strokeWidth: e.animated ? 2 : 1 
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: e.animated ? "#3b82f6" : "#27272a"
    }
  }));

  return (
    <div className="space-y-8 h-full flex flex-col">
      {/* Title */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-50 bg-gradient-to-r from-zinc-50 to-zinc-400 bg-clip-text text-transparent">
            System Topology Twin
          </h2>
          <p className="text-zinc-500 text-sm mt-1">
            Visual map of pipeline routes, database connections, and worker assignments updating in real time.
          </p>
        </div>
        <button
          onClick={() => store.fetchTopology()}
          className="p-2 bg-zinc-900 border border-border rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* React Flow Box */}
      <div className="flex-1 min-h-[500px] border border-border rounded-2xl glass-panel relative overflow-hidden bg-zinc-950/40">
        
        {/* Status Indicator */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 p-2 px-3 bg-zinc-900/80 border border-border rounded-xl backdrop-blur-md text-[10px] font-mono text-zinc-400">
          <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span>Live Infrastructure Streams</span>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          maxZoom={1.5}
          minZoom={0.5}
        >
          <Background color="#18181b" gap={16} />
          <Controls className="!bg-zinc-900 !border-border !text-zinc-400 fill-zinc-400 [&_button]:!bg-zinc-900 [&_button]:!border-border [&_button]:!text-zinc-400" />
          <MiniMap 
            nodeColor={() => "#27272a"}
            maskColor="rgba(0, 0, 0, 0.6)"
            className="!bg-zinc-900/60 !border-border !rounded-xl"
          />
        </ReactFlow>
      </div>
    </div>
  );
}
