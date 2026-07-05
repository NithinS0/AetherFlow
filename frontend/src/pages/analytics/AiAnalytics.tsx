import { useEffect } from "react";
import { useStore } from "../../stores/store";
import { DonutChart } from "../../components/charts/DonutChart";

export function AiAnalytics() {
  const { analyticsAiSummary, fetchAnalyticsAiSummary } = useStore();

  useEffect(() => {
    fetchAnalyticsAiSummary();
  }, [fetchAnalyticsAiSummary]);

  if (!analyticsAiSummary) return <div className="text-gray-400 p-8">Loading AI analytics...</div>;

  const approvalData = [
    { name: "Approved", count: analyticsAiSummary.approved },
    { name: "Rejected", count: analyticsAiSummary.rejected },
    { name: "Pending", count: analyticsAiSummary.pending }
  ];

  const colors = ["#10b981", "#f43f5e", "#f59e0b"];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-1 bg-gray-800/40 backdrop-blur-md border border-white/10 rounded-xl p-5">
        <h3 className="text-gray-300 font-medium mb-4">Recommendation Approval Rate</h3>
        <div className="h-64">
          <DonutChart 
            data={approvalData} 
            nameKey="name" 
            dataKey="count" 
            colors={colors} 
          />
        </div>
      </div>
    </div>
  );
}
