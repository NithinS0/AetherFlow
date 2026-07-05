import React, { useEffect, useState } from "react";
import { useStore } from "../stores/store";
import { KeyRound, ShieldAlert, CheckCircle2, Copy, Plus, Terminal } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "../components/Modal";
import { Button } from "../components/Button";

export function DeveloperSettings() {
  const { apiKeys, fetchApiKeys, createApiKey, revokeApiKey } = useStore();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyPerms, setNewKeyPerms] = useState("read");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createApiKey({ name: newKeyName, permissions: newKeyPerms });
      setGeneratedKey(res.raw_key);
      setNewKeyName("");
      toast.success("API Key generated successfully");
    } catch (e) {
      toast.error("Failed to generate API Key");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-[1000px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Integration API</h1>
              <p className="text-gray-400 text-sm mt-1">Manage API keys and scheduler integrations.</p>
            </div>
          </div>
          <Button onClick={() => setCreateModalOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Generate New Key
          </Button>
        </div>

        {/* Generated Key Alert */}
        {generatedKey && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 relative">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <h3 className="text-white font-medium mb-2">Save your new API Key</h3>
                <p className="text-emerald-200/70 text-sm mb-4">
                  Please copy this key and store it securely. For security reasons, it will not be shown again.
                </p>
                <div className="flex items-center gap-2 bg-gray-950 border border-emerald-500/20 rounded-lg p-2">
                  <code className="text-emerald-400 text-sm flex-1 font-mono px-2">{generatedKey}</code>
                  <button onClick={() => copyToClipboard(generatedKey)} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-md text-gray-300 transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <button onClick={() => setGeneratedKey(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>
          </div>
        )}

        {/* API Keys Table */}
        <div className="bg-gray-800/40 border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-900/50 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Prefix</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Permissions</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {apiKeys.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                    No API keys have been generated yet.
                  </td>
                </tr>
              ) : (
                apiKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 text-sm text-white">
                        <KeyRound className="w-4 h-4 text-amber-500" />
                        <span className="font-medium">{key.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-400">
                      {key.key_prefix}...
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 rounded bg-gray-800 border border-gray-700 text-xs text-gray-300 capitalize">
                        {key.permissions}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {key.is_revoked ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-medium">
                          <ShieldAlert className="w-3.5 h-3.5" /> Revoked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!key.is_revoked && (
                        <button 
                          onClick={() => {
                            if(confirm("Are you sure you want to revoke this API key? This action cannot be undone.")) {
                              revokeApiKey(key.id);
                            }
                          }}
                          className="text-xs text-red-400 hover:text-red-300 font-medium"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* API Documentation Link */}
        <div className="bg-gray-800/40 border border-white/10 rounded-xl p-6 flex items-center justify-between">
          <div>
            <h3 className="text-white font-medium">API Documentation</h3>
            <p className="text-gray-400 text-sm mt-1">View the full OpenAPI specification for programmatic integration.</p>
          </div>
          <a href="/docs" target="_blank" rel="noreferrer" className="px-4 py-2 bg-gray-900 border border-gray-700 hover:border-amber-500/50 rounded-lg text-sm text-white font-medium transition-colors">
            Open Swagger UI
          </a>
        </div>
      </div>

      <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Generate API Key">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Key Name</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Production CI/CD Pipeline"
              value={newKeyName}
              onChange={e => setNewKeyName(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Permissions</label>
            <select 
              value={newKeyPerms}
              onChange={e => setNewKeyPerms(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="read">Read Only</option>
              <option value="write">Read & Write</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <div className="pt-2">
            <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white">Generate Key</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
