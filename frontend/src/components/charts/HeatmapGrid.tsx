interface HeatmapGridProps {
  data: { day: number; hour: number; value: number }[];
}

export function HeatmapGrid({ data }: HeatmapGridProps) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  // Normalize values for opacity mapping (0.1 to 1)
  const maxVal = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Hours Header */}
        <div className="flex ml-12 mb-2">
          {hours.map(h => (
            <div key={`h-${h}`} className="flex-1 text-center text-xs text-gray-500">
              {h % 4 === 0 ? `${h}h` : ''}
            </div>
          ))}
        </div>
        
        {/* Grid */}
        <div className="flex flex-col gap-1">
          {days.map((day, dIdx) => (
            <div key={day} className="flex items-center gap-1">
              <div className="w-10 text-xs text-gray-400 font-medium">{day}</div>
              <div className="flex flex-1 gap-1">
                {hours.map(h => {
                  const cell = data.find(c => c.day === dIdx && c.hour === h);
                  const val = cell?.value || 0;
                  const intensity = val / maxVal;
                  
                  return (
                    <div 
                      key={`${dIdx}-${h}`}
                      className="flex-1 aspect-square rounded-sm bg-indigo-500 transition-opacity duration-300 hover:ring-1 hover:ring-white"
                      style={{ opacity: val === 0 ? 0.05 : 0.2 + (intensity * 0.8) }}
                      title={`${day} ${h}:00 - Value: ${val}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
