import React, { useState } from "react";
import { BarChart2, Server, Layers, AlertTriangle, Zap, FileText } from "lucide-react";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { QueueAnalytics } from "./QueueAnalytics";
import { WorkerAnalytics } from "./WorkerAnalytics";
import { JobAnalytics } from "./JobAnalytics";
import { IncidentAnalytics } from "./IncidentAnalytics";
import { AiAnalytics } from "./AiAnalytics";
import { Reports } from "./Reports";

type Tab = "overview" | "queues" | "workers" | "jobs" | "incidents" | "ai" | "reports";

export function Analytics() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Executive Overview", icon: <BarChart2 className="w-4 h-4" /> },
    { id: "queues", label: "Queues", icon: <Layers className="w-4 h-4" /> },
    { id: "workers", label: "Workers", icon: <Server className="w-4 h-4" /> },
    { id: "jobs", label: "Jobs", icon: <Zap className="w-4 h-4" /> },
    { id: "incidents", label: "Incidents", icon: <AlertTriangle className="w-4 h-4" /> },
    { id: "ai", label: "AI & Recommendations", icon: <Zap className="w-4 h-4 text-purple-400" /> },
    { id: "reports", label: "Reports & Exports", icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Analytics & Business Intelligence</h1>
            <p className="text-gray-400 mt-2">Enterprise reporting, system performance, and predictive forecasting.</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 border border-transparent"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "overview" && <AnalyticsDashboard />}
          {activeTab === "queues" && <QueueAnalytics />}
          {activeTab === "workers" && <WorkerAnalytics />}
          {activeTab === "jobs" && <JobAnalytics />}
          {activeTab === "incidents" && <IncidentAnalytics />}
          {activeTab === "ai" && <AiAnalytics />}
          {activeTab === "reports" && <Reports />}
        </div>
      </div>
    </div>
  );
}
