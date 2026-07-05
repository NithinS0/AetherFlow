import { Sparkles } from "lucide-react";

interface GlobalInsightsProps {
  insights: string[];
}

export function GlobalInsights({ insights }: GlobalInsightsProps) {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 border border-indigo-500/20 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-indigo-400" />
        <h3 className="text-white font-medium">Platform Insights</h3>
      </div>
      <ul className="space-y-3">
        {insights.map((insight, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
            <p className="text-gray-300 text-sm leading-relaxed">{insight}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
