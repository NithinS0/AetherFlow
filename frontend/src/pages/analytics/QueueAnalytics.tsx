import { useEffect } from "react";
import { useStore } from "../../stores/store";
import { BarComparison } from "../../components/charts/BarComparison";

export function QueueAnalytics() {
  const { analyticsQueues, fetchAnalyticsQueues } = useStore();

  useEffect(() => {
    fetchAnalyticsQueues();
  }, [fetchAnalyticsQueues]);

  if (!analyticsQueues) return <div className="text-gray-400 p-8">Loading queue analytics...</div>;

  const chartData = analyticsQueues.queues.map((q: any) => ({
    name: q.name,
    throughput: q.throughput,
    capacity: q.capacity_usage
  }));

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/40 backdrop-blur-md border border-white/10 rounded-xl p-5">
        <h3 className="text-gray-300 font-medium mb-4">Queue Throughput vs Capacity</h3>
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
    </div>
  );
}
