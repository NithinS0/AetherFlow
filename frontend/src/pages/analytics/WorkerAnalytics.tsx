import { useEffect } from "react";
import { useStore } from "../../stores/store";
import { BarComparison } from "../../components/charts/BarComparison";

export function WorkerAnalytics() {
  const { analyticsWorkers, fetchAnalyticsWorkers } = useStore();

  useEffect(() => {
    fetchAnalyticsWorkers();
  }, [fetchAnalyticsWorkers]);

  if (!analyticsWorkers) return <div className="text-gray-400 p-8">Loading worker analytics...</div>;

  const chartData = analyticsWorkers.workers.map((w: any) => ({
    name: w.name,
    utilization: w.utilization,
    jobs: w.jobs_processed
  }));

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/40 backdrop-blur-md border border-white/10 rounded-xl p-5">
        <h3 className="text-gray-300 font-medium mb-4">Worker Utilization & Processed Jobs</h3>
        <div className="h-80">
          <BarComparison 
            data={chartData} 
            xKey="name" 
            bars={[
              { key: "utilization", name: "CPU Utilization (%)", color: "#f59e0b" },
              { key: "jobs", name: "Jobs Processed", color: "#6366f1" }
            ]} 
          />
        </div>
      </div>
    </div>
  );
}
