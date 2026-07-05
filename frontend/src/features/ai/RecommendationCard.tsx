import { Sparkles, CheckCircle2, XCircle } from "lucide-react";
import { Card } from "../../components/Card";

interface RecommendationProps {
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  confidence: number;
  onApprove: () => void;
  onReject: () => void;
}

export function RecommendationCard({ title, description, priority, confidence, onApprove, onReject }: RecommendationProps) {
  const priorityColors = {
    low: "text-zinc-400 bg-zinc-800",
    medium: "text-accent bg-accent/10",
    high: "text-warning bg-warning/10",
    critical: "text-danger bg-danger/10"
  };

  return (
    <Card className="flex flex-col gap-4 border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-indigo-400" />
          <h3 className="font-semibold text-white">{title}</h3>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className={`px-2 py-1 rounded font-medium ${priorityColors[priority]}`}>
            {priority.toUpperCase()}
          </span>
          <span className="text-zinc-500 font-mono">{confidence}% Conf</span>
        </div>
      </div>
      
      <p className="text-sm text-zinc-300">{description}</p>
      
      <div className="flex items-center gap-2 mt-2">
        <button 
          onClick={onApprove}
          className="flex-1 flex items-center justify-center gap-2 py-2 bg-success/10 text-success hover:bg-success/20 rounded-md text-sm font-medium transition-colors"
        >
          <CheckCircle2 size={16} /> Approve Execution
        </button>
        <button 
          onClick={onReject}
          className="flex items-center justify-center p-2 bg-zinc-800 text-zinc-400 hover:bg-danger/20 hover:text-danger rounded-md transition-colors"
        >
          <XCircle size={16} />
        </button>
      </div>
    </Card>
  );
}
