import { DashboardLayout } from "../../layouts/DashboardLayout";
import { PageHeader } from "../../components/PageHeader";
import { ChatInterface } from "./ChatInterface";
import { RecommendationCard } from "./RecommendationCard";
import { Button } from "../../components/Button";
import { Settings, Sparkles } from "lucide-react";

export function OpsGPTWorkspace() {
  return (
    <DashboardLayout>
      <PageHeader 
        title="OpsGPT Intelligence"
        description="Your AI operations assistant. Monitor, diagnose, and optimize your cluster using natural language."
        breadcrumbs={["AetherFlow", "Workspaces", "Operations", "OpsGPT"]}
        actions={
          <Button variant="outline" size="sm"><Settings size={14} /> Agent Settings</Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chat Interface (Main Column) */}
        <div className="lg:col-span-2">
          <ChatInterface />
        </div>

        {/* Governance & Context Sidebar */}
        <div className="flex flex-col gap-6">
          
          <div className="bg-zinc-950/50 border border-white/5 rounded-xl p-4 backdrop-blur-sm">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-400" />
              Pending Approvals
            </h3>
            
            <div className="space-y-4">
              <RecommendationCard 
                title="Scale Worker Pool"
                description="Queue 'DataProcessing' is experiencing high latency. Recommend scaling active workers from 4 to 8 to clear the backlog within 15 minutes."
                priority="high"
                confidence={92}
                onApprove={() => console.log('Approved')}
                onReject={() => console.log('Rejected')}
              />
            </div>
          </div>

          <div className="bg-zinc-950/50 border border-white/5 rounded-xl p-4 backdrop-blur-sm">
            <h3 className="text-sm font-bold text-white mb-2">Active Agents</h3>
            <div className="space-y-2 text-sm text-zinc-400">
              <div className="flex justify-between items-center p-2 rounded hover:bg-white/5">
                <span>Monitoring Agent</span>
                <span className="w-2 h-2 rounded-full bg-success"></span>
              </div>
              <div className="flex justify-between items-center p-2 rounded hover:bg-white/5">
                <span>Failure Analyst</span>
                <span className="w-2 h-2 rounded-full bg-success"></span>
              </div>
              <div className="flex justify-between items-center p-2 rounded hover:bg-white/5">
                <span>Optimization Agent</span>
                <span className="text-zinc-500 text-xs">Sleeping</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </DashboardLayout>
  );
}
