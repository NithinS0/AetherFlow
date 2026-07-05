import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ForecastChartProps {
  data: any[];
  xKey: string;
  actualKey: string;
  forecastKey: string;
  lowerKey: string;
  upperKey: string;
}

export function ForecastChart({ data, xKey, actualKey, forecastKey, lowerKey, upperKey }: ForecastChartProps) {
  // Combine lower/upper into a single area range for Recharts by mapping [lower, upper]
  // Recharts Area doesn't natively do lower/upper easily without custom shapes, but we can do a stacked area or just map data to [min, max] array.
  const chartData = data.map(d => ({
    ...d,
    range: d[lowerKey] !== undefined ? [d[lowerKey], d[upperKey]] : undefined
  }));

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis dataKey={xKey} stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          
          {/* Confidence Interval */}
          <Area type="monotone" dataKey="range" name="Confidence Interval" fill="#8b5cf6" stroke="none" fillOpacity={0.15} />
          
          {/* Actual Data */}
          <Line type="monotone" dataKey={actualKey} name="Historical" stroke="#3b82f6" strokeWidth={2} dot={false} />
          
          {/* Forecasted Data */}
          <Line type="monotone" dataKey={forecastKey} name="Forecast" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
