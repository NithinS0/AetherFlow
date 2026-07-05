import { useEffect } from "react";
import { useStore } from "../stores/store";
import { Settings as SettingsIcon, Sliders, Shield, Zap, Bell, Monitor, BarChart2, MessageSquare, Bot, Sun, Moon, Palette } from "lucide-react";
import { useThemeStore, type Theme } from "../stores/themeStore";
import { ThemeToggle } from "../components/ThemeToggle";

export function Settings() {
  const { platformSettings, fetchSettings, updateFeatureFlag } = useStore();
  const { theme, setTheme, resolvedTheme } = useThemeStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  if (!platformSettings) {
    return <div className="text-gray-400 p-8">Loading settings...</div>;
  }

  const features = [
    { key: "ai_assistant", name: "AI Assistant", description: "Enable AI-powered recommendations.", icon: Bot },
    { key: "workflow_builder", name: "Workflow Builder", description: "Visual drag-and-drop workflow canvas.", icon: Sliders },
    { key: "plugins", name: "Plugin System", description: "Allow third-party and custom workers.", icon: Zap },
    { key: "notifications", name: "Notifications", description: "Global in-app notifications and email alerts.", icon: Bell },
    { key: "analytics", name: "Analytics & BI", description: "Advanced reporting and business intelligence.", icon: BarChart2 },
    { key: "digital_twin", name: "Digital Twin (Beta)", description: "Simulate workload execution without side effects.", icon: Monitor },
    { key: "replay_engine", name: "Replay Engine", description: "Replay failed jobs step-by-step.", icon: Shield },
    { key: "chat", name: "Team Chat", description: "Enable collaborative channels and incident rooms.", icon: MessageSquare }
  ];

  const handleToggle = (key: string, current: boolean) => {
    updateFeatureFlag(key, !current);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-[1200px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Platform Settings</h1>
            <p className="text-gray-400 text-sm mt-1">Manage global configuration and feature flags.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* ── Appearance ── */}
          <div className="xl:col-span-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-violet-500/10 text-violet-400 rounded-xl">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Appearance</h2>
                <p className="text-gray-400 text-xs mt-0.5">Personalise how AetherFlow looks on your device.</p>
              </div>
            </div>

            <div className="bg-gray-800/40 border border-white/10 rounded-2xl p-6 space-y-6">
              {/* Theme selector */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-white font-semibold text-sm mb-1">Theme</h3>
                  <p className="text-gray-400 text-xs">
                    Currently using{" "}
                    <span className="text-primary font-bold capitalize">{theme}</span>
                    {theme === "system" && (
                      <span className="text-zinc-500"> (resolved: {resolvedTheme})</span>
                    )}
                  </p>
                </div>
                <ThemeToggle size="md" showLabels />
              </div>

              {/* Visual preview cards */}
              <div className="grid grid-cols-3 gap-3">
                {(
                  [
                    { value: "light" as Theme, label: "Light", icon: Sun, preview: "bg-white border-gray-200 text-gray-900" },
                    { value: "system" as Theme, label: "System", icon: Monitor, preview: "bg-gradient-to-br from-white to-[#03050c] border-gray-400 text-gray-500" },
                    { value: "dark" as Theme, label: "Dark", icon: Moon, preview: "bg-[#03050c] border-white/10 text-white" },
                  ] as { value: Theme; label: string; icon: React.ElementType; preview: string }[]
                ).map(({ value, label, icon: Icon, preview }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      theme === value
                        ? "border-primary shadow-[0_0_0_3px_rgba(99,102,241,0.2)]"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    {theme === value && (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary shadow-[0_0_6px_rgba(99,102,241,0.6)]" />
                    )}
                    <div className={`w-12 h-8 rounded-lg border flex items-center justify-center ${preview}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[12px] font-semibold text-zinc-300">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Feature Flags Section */}
          <div className="xl:col-span-2 space-y-4">
            <h2 className="text-lg font-medium text-white mb-4">Feature Flags</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map(feat => {
                const isEnabled = platformSettings.features?.[feat.key] || false;
                const Icon = feat.icon;
                return (
                  <div key={feat.key} className="bg-gray-800/40 border border-white/10 rounded-xl p-5 flex flex-col justify-between hover:border-indigo-500/30 transition-colors">
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`p-2 rounded-lg ${isEnabled ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-800 text-gray-500'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{feat.name}</h3>
                        <p className="text-gray-400 text-xs mt-1">{feat.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
                      <span className={`text-xs font-semibold ${isEnabled ? 'text-indigo-400' : 'text-gray-500'}`}>
                        {isEnabled ? "ENABLED" : "DISABLED"}
                      </span>
                      <button 
                        onClick={() => handleToggle(feat.key, isEnabled)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isEnabled ? 'bg-indigo-500' : 'bg-gray-600'}`}
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* General Platform Settings */}
          <div className="xl:col-span-1 space-y-4">
            <h2 className="text-lg font-medium text-white mb-4">General Configuration</h2>
            
            <div className="bg-gray-800/40 border border-white/10 rounded-xl p-5 space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Log Retention (Days)</label>
                <input 
                  type="number" 
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:border-indigo-500"
                  defaultValue={platformSettings.platform?.log_retention_days || 30}
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Max Concurrent Jobs Limit</label>
                <input 
                  type="number" 
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:border-indigo-500"
                  defaultValue={platformSettings.platform?.max_concurrent_jobs || 1000}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div>
                  <h4 className="text-red-400 text-sm font-medium">Maintenance Mode</h4>
                  <p className="text-red-400/70 text-xs">Pauses all workers and queues.</p>
                </div>
                <button className="px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600">
                  {platformSettings.platform?.maintenance_mode ? 'Deactivate' : 'Activate'}
                </button>
              </div>
              
              <button className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors font-medium text-sm">
                Save Platform Config
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
