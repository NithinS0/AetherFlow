import { useEffect } from "react";
import { useStore } from "../../stores/store";
import { DonutChart } from "../../components/charts/DonutChart";
import { HeatmapGrid } from "../../components/charts/HeatmapGrid";

export function JobAnalytics() {
  const { analyticsJobDistribution, fetchAnalyticsJobDistribution } = useStore();

  useEffect(() => {
    fetchAnalyticsJobDistribution();
  }, [fetchAnalyticsJobDistribution]);

  if (!analyticsJobDistribution) return <div className="text-gray-400 p-8">Loading job analytics...</div>;

  const colors = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6"];
  
  // Dummy heatmap data
  const heatmapData = [];
  for(let d=0; d<7; d++) {
    for(let h=0; h<24; h++) {
      heatmapData.push({ day: d, hour: h, value: Math.floor(Math.random() * 500) });
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-1 bg-gray-800/40 backdrop-blur-md border border-white/10 rounded-xl p-5">
        <h3 className="text-gray-300 font-medium mb-4">Job Status Distribution</h3>
        <div className="h-64">
          <DonutChart 
            data={analyticsJobDistribution.distribution} 
            nameKey="status" 
            dataKey="count" 
            colors={colors} 
          />
        </div>
      </div>
      <div className="xl:col-span-2 bg-gray-800/40 backdrop-blur-md border border-white/10 rounded-xl p-5">
        <h3 className="text-gray-300 font-medium mb-4">Peak Execution Hours Heatmap</h3>
        <div className="overflow-x-auto pb-4">
           <HeatmapGrid data={heatmapData} />
        </div>
      </div>
    </div>
  );
}
