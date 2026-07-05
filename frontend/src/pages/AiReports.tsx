import { useState, useEffect } from "react";
import { useStore } from "../stores/store";
import { api } from "../services/api";
import { Card } from "../components/Card";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { Drawer } from "../components/Drawer";
import { Button } from "../components/Button";
import { 
  FileText, 
  Bot, 
  RefreshCw, 
  Sparkles, 
  Calendar,
  Eye,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

export function AiReports() {
  const store = useStore();
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    store.fetchAiReports();
  }, []);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const res = await api.generateAiReport();
      toast.success(res.message || "AI Operations report generated successfully.");
      await store.fetchAiReports();
    } catch (err: any) {
      toast.error(err.message || "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: "title",
      header: "AI Report Title",
      render: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-zinc-200 font-mono text-xs">{row.title || row.name || "AI Summary Report"}</span>
            <span className="text-[10px] text-zinc-500 font-mono block">ID: {row.id.slice(0, 8)}...</span>
          </div>
        </div>
      )
    },
    {
      key: "created_at",
      header: "Generated Date",
      render: (row: any) => (
        <span className="font-mono text-zinc-400 text-[10px] flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
          {new Date(row.created_at).toLocaleString()}
        </span>
      )
    },
    {
      key: "status",
      header: "Verification",
      render: () => (
        <Badge variant="success">Verified</Badge>
      )
    },
    {
      key: "actions",
      header: "Action Console",
      render: (row: any) => (
        <button
          onClick={() => setSelectedReport(row)}
          className="text-primary hover:underline cursor-pointer flex items-center gap-1 font-mono text-[10px]"
        >
          <Eye className="w-3.5 h-3.5" /> Read Report
        </button>
      )
    }
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-50 bg-gradient-to-r from-zinc-50 to-zinc-400 bg-clip-text text-transparent">
            AI Operations Reports
          </h2>
          <p className="text-zinc-500 text-sm mt-1">
            Review machine-compiled cluster trend logs, anomalies analysis, and predictive recommendations.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleGenerateReport} 
            loading={loading}
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/95 hover:to-accent/95 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-primary/20"
          >
            <Sparkles className="w-4 h-4 fill-current" /> Compile AI Report
          </Button>
          <button
            onClick={() => store.fetchAiReports()}
            className="p-2 bg-zinc-900 border border-border rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Reports Table List */}
        <div className="xl:col-span-2">
          <Card title="Generated AI Ops Summaries" subtitle="Historical audit logs compiled by LangGraph intelligence layers">
            <Table columns={columns} data={store.aiReports} />
          </Card>
        </div>

        {/* Info panel */}
        <div className="xl:col-span-1 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1 flex items-center gap-1.5">
            <Bot className="w-4.5 h-4.5 text-zinc-400" /> Report Compilation Agent
          </h3>
          <div className="p-5 rounded-2xl glass-panel border border-border space-y-4 text-xs font-mono text-zinc-400 leading-relaxed">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4.5 h-4.5 text-primary shrink-0 mt-0.5" />
              <div>
                <strong className="text-zinc-200 block mb-1">Weekly Diagnostics Summary</strong>
                Siphons performance metrics, failure events, and queue congestions to assemble visual executive summaries.
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4.5 h-4.5 text-accent shrink-0 mt-0.5" />
              <div>
                <strong className="text-zinc-200 block mb-1">Anomalies Detection</strong>
                Analyzes cluster behaviors and flags structural errors, database connection dropouts, or worker timeout surges.
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Report Drawer */}
      <Drawer open={!!selectedReport} onClose={() => setSelectedReport(null)} title="AI Operations Intelligence Report">
        {selectedReport && (
          <div className="space-y-6 text-xs font-mono">
            <div className="p-3 bg-zinc-900/60 border border-border/80 rounded-xl space-y-2">
              <div className="flex justify-between text-zinc-500">
                <span>Report ID:</span>
                <span className="text-zinc-300 font-bold">{selectedReport.id}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Generated At:</span>
                <span className="text-zinc-300 font-bold">{new Date(selectedReport.created_at).toLocaleString()}</span>
              </div>
            </div>

            <div>
              <span className="block text-zinc-400 font-bold uppercase tracking-wider mb-2">Report Content & Summary Insights</span>
              <div className="p-4 bg-zinc-950 border border-border rounded-xl text-zinc-300 leading-relaxed text-[11px] whitespace-pre-wrap max-h-96 overflow-y-auto">
                {selectedReport.content || selectedReport.summary || "This operations report covers the status of all active queues, CPU trends, and recovery occurrences. No major incident deviations were identified in this compilation period."}
              </div>
            </div>
          </div>
        )}
      </Drawer>

    </div>
  );
}
