import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon?: React.ReactNode;
  subtitle?: string;
  goodDirection?: "up" | "down";
}

export function KpiCard({ title, value, trend, icon, subtitle, goodDirection = "up" }: KpiCardProps) {
  const isPositiveTrend = trend !== undefined && trend > 0;
  const isNegativeTrend = trend !== undefined && trend < 0;
  
  let trendColor = "text-gray-400";
  if (trend !== undefined) {
    if ((isPositiveTrend && goodDirection === "up") || (isNegativeTrend && goodDirection === "down")) {
      trendColor = "text-emerald-400";
    } else if (trend !== 0) {
      trendColor = "text-rose-400";
    }
  }

  return (
    <div className="bg-gray-800/40 backdrop-blur-md border border-white/10 rounded-xl p-5 hover:bg-gray-800/60 transition-all duration-300">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-gray-400 font-medium text-sm">{title}</h3>
        {icon && <div className="text-gray-500">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
        {trend !== undefined && (
          <div className={`flex items-center text-sm font-medium ${trendColor}`}>
            {isPositiveTrend ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : 
             isNegativeTrend ? <ArrowDownRight className="w-4 h-4 mr-0.5" /> : 
             <Minus className="w-4 h-4 mr-0.5" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
    </div>
  );
}
