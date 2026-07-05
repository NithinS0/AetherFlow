import { useEffect } from "react";
import { useStore } from "../stores/store";
import { BarComparison } from "../components/charts/BarComparison";
import { 
  Layers, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  Cpu,
  TrendingUp
} from "lucide-react";

export function QueueAnalyticsPage() {
  const store = useStore();

  useEffect(() => {
    store.fetchAnalyticsDashboard();
    store.fetchAnalyticsQueues();
    store.fetchAnalyticsWorkers();
  }, []);

  const dash = store.analyticsDashboard || {
    platform_health_score: 98.4,
    completed_jobs: 1420,
    failed_jobs: 14,
    active_workers: 4,
    success_rate: 99.1,
    running_jobs: 2,
    average_wait_time: 1.25,
    retry_rate: 3.4,
    incident_count: 1
  };

  const queueData = store.analyticsQueues?.queues || [
    { name: "email-relay-queue", throughput: 420, capacity_usage: 45 },
    { name: "image-optimization-batch", throughput: 280, capacity_usage: 60 },
    { name: "background-sync-logger", throughput: 720, capacity_usage: 15 }
  ];

  const workerData = store.analyticsWorkers?.workers || [
    { name: "w-node-1", utilization: 55, jobs_processed: 380 },
    { name: "w-node-2", utilization: 72, jobs_processed: 480 },
    { name: "w-node-3", utilization: 40, jobs_processed: 290 }
  ];

  const totalJobs = dash.completed_jobs + dash.failed_jobs;
  const failureRate = 100 - dash.success_rate;

  const chartData = queueData.map((q: any) => ({
    name: q.name,
    throughput: q.throughput,
    capacity: q.capacity_usage
  }));

  const workerChartData = workerData.map((w: any) => ({
    name: w.name,
    utilization: w.utilization,
    jobs: w.jobs_processed
  }));

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-zinc-50 bg-gradient-to-r from-zinc-50 to-zinc-400 bg-clip-text text-transparent">
          Queue Analytics & BI
        </h2>
        <p className="text-zinc-500 text-sm mt-1">
          Perform depth analysis on scheduler queue throughput, failure rates, worker utilization and job delay statistics.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        <div className="p-5 rounded-2xl glass-panel border border-border flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">Throughput (Total)</span>
            <span className="text-2xl font-black font-mono text-zinc-100 mt-2 block">{totalJobs} jobs</span>
          </div>
          <Layers className="w-8 h-8 text-primary opacity-60" />
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-border flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">Success Rate</span>
            <span className="text-2xl font-black font-mono text-emerald-400 mt-2 block">{dash.success_rate.toFixed(1)}%</span>
          </div>
          <CheckCircle className="w-8 h-8 text-emerald-400 opacity-60" />
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-border flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">Failure Rate</span>
            <span className="text-2xl font-black font-mono text-red-400 mt-2 block">{failureRate.toFixed(1)}%</span>
          </div>
          <AlertTriangle className="w-8 h-8 text-red-400 opacity-60" />
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-border flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">Avg Run Time</span>
            <span className="text-2xl font-black font-mono text-zinc-100 mt-2 block">{dash.average_wait_time.toFixed(2)}s</span>
          </div>
          <Clock className="w-8 h-8 text-cyan-400 opacity-60" />
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-border flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">Retry Rate</span>
            <span className="text-2xl font-black font-mono text-zinc-100 mt-2 block">{dash.retry_rate.toFixed(1)}%</span>
          </div>
          <RefreshCw className="w-8 h-8 text-accent opacity-60" />
        </div>
      </div>

      {/* Chart Panels */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Queue Throughput vs Capacity */}
        <div className="p-6 rounded-2xl glass-panel border border-border space-y-4">
          <h3 className="text-sm font-bold tracking-tight text-zinc-200 flex items-center gap-2">
            <TrendingUp className="w-4.5 h-4.5 text-primary" /> Queue Throughput & Capacity Usage
          </h3>
          <div className="h-80">
            <BarComparison 
              data={chartData} 
              xKey="name" 
              bars={[
                { key: "throughput", name: "Completed Jobs", color: "#6366f1" },
                { key: "capacity", name: "Capacity Usage (%)", color: "#10b981" }
              ]} 
            />
          </div>
        </div>

        {/* Worker Utilization */}
        <div className="p-6 rounded-2xl glass-panel border border-border space-y-4">
          <h3 className="text-sm font-bold tracking-tight text-zinc-200 flex items-center gap-2">
            <Cpu className="w-4.5 h-4.5 text-accent" /> Worker Node Load Utilization
          </h3>
          <div className="h-80">
            <BarComparison 
              data={workerChartData} 
              xKey="name" 
              bars={[
                { key: "utilization", name: "CPU Utilization (%)", color: "#f59e0b" },
                { key: "jobs", name: "Jobs Processed", color: "#6366f1" }
              ]} 
            />
          </div>
        </div>

      </div>

    </div>
  );
}
