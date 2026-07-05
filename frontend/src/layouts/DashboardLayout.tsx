import React from "react";
import { Sidebar } from "./Sidebar";
import { TopNavigation } from "./TopNavigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-zinc-100 flex">
      {/* Sidebar - fixed width 64 */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-64">
        <TopNavigation />
        
        <main className="flex-1 p-8 animate-fade-in relative z-0">
          {/* Subtle background glow effect for premium feel */}
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
          
          {children}
        </main>
      </div>
    </div>
  );
}
