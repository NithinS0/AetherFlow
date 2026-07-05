import { useEffect } from "react";
import { useStore } from "../stores/store";
import { PlugZap, CheckCircle2, XCircle, Package } from "lucide-react";
import { toast } from "sonner";

export function Plugins() {
  const { plugins, fetchPlugins, enablePlugin, disablePlugin } = useStore();

  useEffect(() => {
    fetchPlugins();
  }, [fetchPlugins]);

  if (!plugins) {
    return <div className="text-gray-400 p-8">Loading plugins...</div>;
  }

  const handleToggle = async (name: string, isEnabled: boolean) => {
    try {
      if (isEnabled) {
        await disablePlugin(name);
        toast.success(`Plugin ${name} disabled`);
      } else {
        await enablePlugin(name);
        toast.success(`Plugin ${name} enabled`);
      }
    } catch (e) {
      toast.error("Failed to toggle plugin");
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-[1200px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-fuchsia-500/10 text-fuchsia-400 rounded-xl">
            <PlugZap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Plugin Management</h1>
            <p className="text-gray-400 text-sm mt-1">Install, enable, and configure third-party extensions.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Object.entries(plugins).map(([key, plugin]: [string, any]) => (
            <div key={key} className="bg-gray-800/40 border border-white/10 rounded-xl p-5 flex flex-col justify-between hover:border-fuchsia-500/30 transition-colors">
              <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 rounded-xl ${plugin.enabled ? 'bg-fuchsia-500/20 text-fuchsia-400' : 'bg-gray-800 text-gray-500'}`}>
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-medium flex items-center gap-2">
                    {plugin.name}
                    {plugin.enabled ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-600" />
                    )}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-gray-900 text-gray-400 px-1.5 py-0.5 rounded border border-gray-700 font-mono">v{plugin.version}</span>
                    <span className="text-xs text-gray-500">by {plugin.author}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-400 text-xs mb-6 h-10">{plugin.description}</p>
              
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <span className={`text-xs font-semibold ${plugin.enabled ? 'text-emerald-400' : 'text-gray-500'}`}>
                  {plugin.enabled ? "ACTIVE" : "INACTIVE"}
                </span>
                <button 
                  onClick={() => handleToggle(key, plugin.enabled)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    plugin.enabled 
                      ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                      : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                >
                  {plugin.enabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
}
