import { DashboardLayout } from "../layouts/DashboardLayout";
import { PageHeader } from "../components/PageHeader";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { StatusBadge } from "../components/StatusBadge";
import { Download, Plus } from "lucide-react";

export function OperationsDashboard() {
  return (
    <DashboardLayout>
      <PageHeader 
        title="Operations Center"
        description="Real-time observability of your distributed scheduling cluster."
        breadcrumbs={["AetherFlow", "Workspaces", "Production Cluster", "Operations"]}
        actions={
          <>
            <Button variant="outline" size="sm"><Download size={14} /> Export Report</Button>
            <Button variant="primary" size="sm"><Plus size={14} /> Provision Worker</Button>
          </>
        }
      />

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Active Workers", value: "1,204", trend: "+12%", status: "healthy" },
          { label: "Queued Jobs", value: "45,291", trend: "-5%", status: "busy" },
          { label: "Success Rate", value: "99.98%", trend: "+0.01%", status: "healthy" },
          { label: "Failed Executions", value: "14", trend: "Critical", status: "critical" }
        ].map((kpi, idx) => (
          <Card key={idx} className="flex flex-col gap-2 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider">{kpi.label}</span>
              <StatusBadge status={kpi.status as any} />
            </div>
            <div className="text-3xl font-bold text-white tracking-tight mt-2">{kpi.value}</div>
            
            {/* Hover subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          </Card>
        ))}
      </div>

      {/* Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 min-h-[400px]">
          <h3 className="text-sm font-bold mb-4">Cluster Topology (Digital Twin Placeholder)</h3>
          <div className="w-full h-full border border-white/5 bg-zinc-900/30 rounded-lg flex items-center justify-center text-zinc-600">
            [React Flow Instance]
          </div>
        </Card>

        <Card className="flex flex-col gap-4">
          <h3 className="text-sm font-bold">Activity Feed</h3>
          
          <div className="space-y-4">
            {[1,2,3,4].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-1">
                  <div className="w-2 h-2 rounded-full bg-primary ring-4 ring-primary/20"></div>
                </div>
                <div>
                  <p className="text-xs text-white">Worker <span className="font-mono text-primary">w-node-{i}</span> joined</p>
                  <p className="text-[10px] text-zinc-500">2 mins ago</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

    </DashboardLayout>
  );
}
