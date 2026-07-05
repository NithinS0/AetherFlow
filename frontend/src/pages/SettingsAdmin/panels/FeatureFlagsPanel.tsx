import { useEffect, useState } from "react";
import { useStore } from "../../../stores/store";

export default function FeatureFlagsPanel() {
  const { platformSettings, fetchSettings, updateFeatureFlag } = useStore();
  const [localFlags, setLocalFlags] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!platformSettings) fetchSettings();
    else setLocalFlags(platformSettings.features || {});
  }, [platformSettings, fetchSettings]);

  const toggle = async (key: string) => {
    const next = !localFlags[key];
    setLocalFlags({ ...localFlags, [key]: next });
    await updateFeatureFlag(key, next);
  };

  if (!platformSettings) return <div className="text-gray-400">Loading...</div>;

  return (
    <div className="space-y-3">
      {Object.keys(localFlags).map((k) => (
        <div key={k} className="flex items-center justify-between p-3 border border-white/5 rounded-lg">
          <div>
            <div className="text-sm text-white font-medium">{k}</div>
            <div className="text-xs text-gray-400">{String(localFlags[k])}</div>
          </div>
          <button onClick={() => toggle(k)} className={`inline-flex h-6 w-11 items-center rounded-full p-1 ${localFlags[k] ? 'bg-indigo-500' : 'bg-gray-600'}`}>
            <span className={`block h-4 w-4 bg-white rounded-full transform ${localFlags[k] ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      ))}
    </div>
  );
}
