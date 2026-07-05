import { useEffect, useState } from "react";
import { Card } from "../../components/Card";
import { Table } from "../../components/Table";
import { Button } from "../../components/Button";
import { jobService } from "./jobService";
import type { Job } from "./jobService";
import { RefreshCw, Play } from "lucide-react";

interface JobListViewProps {
  queueId: string;
}

export function JobListView({ queueId }: JobListViewProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchJobs() {
    setLoading(true);
    try {
      const data = await jobService.getJobs(queueId);
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
  }, [queueId]);

  const columns = [
    { header: "Job ID", key: "id" },
    { 
      header: "Status", 
      key: "status",
      render: (row: Job) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
          row.status === "completed" ? "bg-emerald-500/10 text-emerald-400" :
          row.status === "running" ? "bg-cyan-500/10 text-cyan-400 animate-pulse" :
          row.status === "failed" ? "bg-red-500/10 text-red-400" :
          "bg-zinc-800 text-zinc-400"
        }`}>
          {row.status}
        </span>
      )
    },
    { header: "Retries", key: "retry_count" }
  ];

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">Queue Pipelines</h3>
          <p className="text-[10px] text-zinc-500">Atomic execution states via SKIP LOCKED</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchJobs} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button variant="primary" size="sm">
            <Play className="w-3.5 h-3.5" /> Dispatch Job
          </Button>
        </div>
      </div>

      <Table columns={columns} data={jobs} />
    </Card>
  );
}
