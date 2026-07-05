import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface TrendChartProps {
  data: any[];
  xKey: string;
  yKey1: string;
  yKey2?: string;
  color1?: string;
  color2?: string;
}

export function TrendChart({ 
  data, xKey, yKey1, yKey2, 
  color1 = "#6366f1", // indigo-500
  color2 = "#f43f5e"  // rose-500
}: TrendChartProps) {
  return (
    <div className="w-full h-full min-h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorY1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color1} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color1} stopOpacity={0}/>
            </linearGradient>
            {yKey2 && (
              <linearGradient id="colorY2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color2} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color2} stopOpacity={0}/>
              </linearGradient>
            )}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis dataKey={xKey} stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
            itemStyle={{ color: '#f3f4f6' }}
          />
          <Area type="monotone" dataKey={yKey1} stroke={color1} strokeWidth={2} fillOpacity={1} fill="url(#colorY1)" />
          {yKey2 && (
            <Area type="monotone" dataKey={yKey2} stroke={color2} strokeWidth={2} fillOpacity={1} fill="url(#colorY2)" />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
