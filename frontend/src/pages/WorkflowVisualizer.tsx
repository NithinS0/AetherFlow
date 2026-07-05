import { useState, useCallback } from "react";
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  addEdge, 
  useNodesState, 
  useEdgesState
} from "reactflow";
import type { Connection, Edge } from "reactflow";
import "reactflow/dist/style.css";
import { Save, Upload, Undo2, Redo2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/Button";

const initialNodes = [
  { 
    id: "start", 
    type: "input", 
    data: { label: "Start Workflow" }, 
    position: { x: 250, y: 50 },
    style: { background: "#10b981", color: "#fff", border: "none", fontWeight: "bold" }
  }
];

export function WorkflowVisualizer() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [history, setHistory] = useState<{nodes: any[], edges: any[]}[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const saveToHistory = useCallback(() => {
    const current = { nodes, edges };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(current);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [nodes, edges, history, historyIndex]);

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: "#6366f1" } }, eds));
      saveToHistory();
    },
    [setEdges, saveToHistory]
  );

  const addNode = (_type: string, label: string, color: string) => {
    const newNode = {
      id: `node-${Date.now()}`,
      data: { label },
      position: { x: 250 + Math.random() * 100, y: 150 + Math.random() * 100 },
      style: { background: color, color: "#fff", border: "none", padding: "10px", borderRadius: "8px", fontWeight: "600", fontSize: "12px" }
    };
    setNodes((nds) => [...nds, newNode]);
    saveToHistory();
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setNodes(history[historyIndex - 1].nodes);
      setEdges(history[historyIndex - 1].edges);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setNodes(history[historyIndex + 1].nodes);
      setEdges(history[historyIndex + 1].edges);
    }
  };

  const handleSave = () => {
    localStorage.setItem("aetherflow_workflow", JSON.stringify({ nodes, edges }));
    toast.success("Workflow saved locally");
  };

  const handleLoad = () => {
    const saved = localStorage.getItem("aetherflow_workflow");
    if (saved) {
      const data = JSON.parse(saved);
      setNodes(data.nodes);
      setEdges(data.edges);
      toast.success("Workflow loaded");
    } else {
      toast.error("No saved workflow found");
    }
  };

  const handleClear = () => {
    setNodes(initialNodes);
    setEdges([]);
    saveToHistory();
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6">
      {/* Title & Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Workflow Builder</h2>
          <p className="text-gray-400 text-sm mt-1">Design complex job pipelines visually.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-900 border border-gray-700 rounded-lg p-1">
            <button onClick={handleUndo} disabled={historyIndex <= 0} className="p-2 text-gray-400 hover:text-white disabled:opacity-50">
              <Undo2 className="w-4 h-4" />
            </button>
            <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="p-2 text-gray-400 hover:text-white disabled:opacity-50">
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
          
          <Button onClick={handleLoad} variant="outline" className="flex items-center gap-2">
            <Upload className="w-4 h-4" /> Load
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600">
            <Save className="w-4 h-4" /> Save Workflow
          </Button>
          <Button onClick={handleClear} variant="danger" className="flex items-center gap-2 bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30">
            <Trash2 className="w-4 h-4" /> Clear
          </Button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        {/* Node Palette */}
        <div className="w-64 bg-gray-900/50 border border-white/10 rounded-xl p-4 flex flex-col gap-3">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Node Palette</h3>
          
          <button onClick={() => addNode("default", "Queue Job", "#6366f1")} className="w-full p-3 bg-indigo-500/20 border border-indigo-500 text-indigo-400 rounded-lg text-xs font-semibold text-left flex items-center gap-2 hover:bg-indigo-500/30 transition-colors">
            <span className="w-2 h-2 rounded-full bg-indigo-400" /> Queue Target
          </button>
          
          <button onClick={() => addNode("default", "Condition", "#f59e0b")} className="w-full p-3 bg-amber-500/20 border border-amber-500 text-amber-400 rounded-lg text-xs font-semibold text-left flex items-center gap-2 hover:bg-amber-500/30 transition-colors">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Branch Condition
          </button>
          
          <button onClick={() => addNode("default", "Parallel Split", "#06b6d4")} className="w-full p-3 bg-cyan-500/20 border border-cyan-500 text-cyan-400 rounded-lg text-xs font-semibold text-left flex items-center gap-2 hover:bg-cyan-500/30 transition-colors">
            <span className="w-2 h-2 rounded-full bg-cyan-400" /> Parallel Execution
          </button>
          
          <button onClick={() => addNode("default", "Sequential Merge", "#ec4899")} className="w-full p-3 bg-pink-500/20 border border-pink-500 text-pink-400 rounded-lg text-xs font-semibold text-left flex items-center gap-2 hover:bg-pink-500/30 transition-colors">
            <span className="w-2 h-2 rounded-full bg-pink-400" /> Sequence / Merge
          </button>
          
          <button onClick={() => addNode("output", "Completion", "#10b981")} className="w-full p-3 bg-emerald-500/20 border border-emerald-500 text-emerald-400 rounded-lg text-xs font-semibold text-left flex items-center gap-2 hover:bg-emerald-500/30 transition-colors mt-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> End Workflow
          </button>
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-gray-950 border border-white/10 rounded-xl overflow-hidden relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            className="react-flow-dark"
          >
            <Background color="#374151" gap={16} />
            <Controls className="react-flow__controls-dark" />
            <MiniMap 
              nodeColor={(n) => {
                if (n.style?.background) return n.style.background as string;
                return "#374151";
              }}
              maskColor="rgba(0, 0, 0, 0.7)"
              style={{ background: "#111827", border: "1px solid #374151" }}
            />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
