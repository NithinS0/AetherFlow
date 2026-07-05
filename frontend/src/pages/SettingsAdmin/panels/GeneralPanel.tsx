import { useEffect, useState } from "react";
import { useStore } from "../../../stores/store";

export default function GeneralPanel() {
  const { platformSettings, fetchSettings, updatePlatformSettings } = useStore();
  const [logDays, setLogDays] = useState<number>(30);
  const [maxJobs, setMaxJobs] = useState<number>(1000);

  useEffect(() => {
    if (!platformSettings) fetchSettings();
  }, [platformSettings, fetchSettings]);

  useEffect(() => {
    if (platformSettings?.platform) {
      setLogDays(platformSettings.platform.log_retention_days || 30);
      setMaxJobs(platformSettings.platform.max_concurrent_jobs || 1000);
    }
  }, [platformSettings]);

  const save = async () => {
    await updatePlatformSettings({ log_retention_days: logDays, max_concurrent_jobs: maxJobs });
  };

  if (!platformSettings) return <div className="text-gray-400">Loading...</div>;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-gray-300 mb-2">Log Retention (days)</label>
        <input type="number" value={logDays} onChange={(e) => setLogDays(Number(e.target.value))} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white" />
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-2">Max Concurrent Jobs</label>
        <input type="number" value={maxJobs} onChange={(e) => setMaxJobs(Number(e.target.value))} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white" />
      </div>

      <div className="pt-2">
        <button onClick={save} className="px-4 py-2 bg-indigo-500 text-white rounded-lg">Save</button>
      </div>
    </div>
  );
}
