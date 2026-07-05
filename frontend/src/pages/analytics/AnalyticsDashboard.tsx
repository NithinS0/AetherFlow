import { useEffect } from "react";
import { useStore } from "../../stores/store";
import { KpiCard } from "../../components/charts/KpiCard";
import { TrendChart } from "../../components/charts/TrendChart";
import { GlobalInsights } from "../../components/GlobalInsights";
import { Layers, Activity, AlertTriangle, CheckCircle, Clock, Server, Zap, RefreshCw } from "lucide-react";

export function AnalyticsDashboard() {
  const { analyticsDashboard, fetchAnalyticsDashboard } = useStore();
  
  useEffect(() => {
    fetchAnalyticsDashboard();
  }, [fetchAnalyticsDashboard]);
  
  if (!analyticsDashboard) return <div className="text-gray-400 p-8">Loading dashboard metrics...</div>;
  
  // Dummy trend data for the platform overview
  const trendData = [
    { name: 'Mon', jobs: 4000, incidents: 24 },
    { name: 'Tue', jobs: 3000, incidents: 13 },
    { name: 'Wed', jobs: 2000, incidents: 8 },
    { name: 'Thu', jobs: 2780, incidents: 39 },
    { name: 'Fri', jobs: 1890, incidents: 48 },
    { name: 'Sat', jobs: 2390, incidents: 38 },
    { name: 'Sun', jobs: 3490, incidents: 43 },
  ];

  const insights = [
    "Overall platform health is stable at 98.4%.",
    "Worker utilization peaked at 84% during the last hour.",
    "Retry rate has decreased by 12% week-over-week."
  ];
  
  return (
    <div className="space-y-6">
      <GlobalInsights insights={insights} />
      
      {/* KPIs Level 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Platform Health Score" value={`${analyticsDashboard.platform_health_score.toFixed(1)}%`} icon={<Activity />} trend={1.2} />
        <KpiCard title="Total Jobs Processed" value={analyticsDashboard.completed_jobs + analyticsDashboard.failed_jobs} icon={<Layers />} trend={14} />
        <KpiCard title="Active Workers" value={analyticsDashboard.active_workers} icon={<Server />} trend={0} />
        <KpiCard title="Success Rate" value={`${analyticsDashboard.success_rate.toFixed(1)}%`} icon={<CheckCircle />} trend={0.5} />
      </div>
      
      {/* Platform Trend */}
      <div className="bg-gray-800/40 backdrop-blur-md border border-white/10 rounded-xl p-5">
        <h3 className="text-gray-300 font-medium mb-4">Platform Throughput & Incidents</h3>
        <div className="h-64">
          <TrendChart data={trendData} xKey="name" yKey1="jobs" yKey2="incidents" color1="#6366f1" color2="#f43f5e" />
        </div>
      </div>
      
      {/* KPIs Level 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Running Jobs" value={analyticsDashboard.running_jobs} icon={<Zap />} trend={5} goodDirection="down" />
        <KpiCard title="Average Wait Time" value={`${analyticsDashboard.average_wait_time.toFixed(1)}s`} icon={<Clock />} trend={-2} goodDirection="down" />
        <KpiCard title="Retry Rate" value={`${analyticsDashboard.retry_rate.toFixed(1)}%`} icon={<RefreshCw />} trend={-1.5} goodDirection="down" />
        <KpiCard title="Open Incidents" value={analyticsDashboard.incident_count} icon={<AlertTriangle />} trend={-3} goodDirection="down" />
      </div>
    </div>
  );
}
