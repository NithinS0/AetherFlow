import { useEffect } from "react";
import { useStore } from "../../stores/store";
import { DonutChart } from "../../components/charts/DonutChart";
import { TrendChart } from "../../components/charts/TrendChart";

export function IncidentAnalytics() {
  const { analyticsIncidentSummary, fetchAnalyticsIncidentSummary } = useStore();

  useEffect(() => {
    fetchAnalyticsIncidentSummary();
  }, [fetchAnalyticsIncidentSummary]);

  if (!analyticsIncidentSummary) return <div className="text-gray-400 p-8">Loading incident analytics...</div>;

  const severityColors = ["#f43f5e", "#f59e0b", "#3b82f6", "#10b981"];
  
  const mttrData = [
    { month: 'Jan', minutes: 120 },
    { month: 'Feb', minutes: 98 },
    { month: 'Mar', minutes: 86 },
    { month: 'Apr', minutes: 99 },
    { month: 'May', minutes: 75 },
    { month: 'Jun', minutes: 60 },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-1 bg-gray-800/40 backdrop-blur-md border border-white/10 rounded-xl p-5">
        <h3 className="text-gray-300 font-medium mb-4">Incident Severity</h3>
        <div className="h-64">
          <DonutChart 
            data={analyticsIncidentSummary.severity} 
            nameKey="severity" 
            dataKey="count" 
            colors={severityColors} 
          />
        </div>
      </div>
      <div className="xl:col-span-2 bg-gray-800/40 backdrop-blur-md border border-white/10 rounded-xl p-5">
        <h3 className="text-gray-300 font-medium mb-4">Mean Time To Resolution (MTTR) Trend</h3>
        <div className="h-64">
           <TrendChart data={mttrData} xKey="month" yKey1="minutes" color1="#10b981" />
        </div>
      </div>
    </div>
  );
}
