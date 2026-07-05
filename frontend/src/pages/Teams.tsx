import { useState, useEffect } from "react";
import { useStore } from "../stores/store";
import { api } from "../services/api";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Modal } from "../components/Modal";
import { Plus, Trash2, UserPlus, Trash } from "lucide-react";
import { toast } from "sonner";

export function Teams() {
  const store = useStore();
  const [teamName, setTeamName] = useState("");
  const [teamLeadId, setTeamLeadId] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [addMemberUserId, setAddMemberUserId] = useState("");
  const [addMemberOpen, setAddMemberOpen] = useState(false);

  const activeOrg = store.activeOrg;

  useEffect(() => {
    if (activeOrg) {
      store.fetchTeams();
    }
  }, [activeOrg]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg) return;
    setLoading(true);

    try {
      await api.createTeam({
        name: teamName,
        organization_id: activeOrg.id,
        team_lead_id: teamLeadId || null
      });
      toast.success("Team created successfully");
      setCreateModalOpen(false);
      setTeamName("");
      setTeamLeadId("");
      await store.fetchTeams();
    } catch (e: any) {
      toast.error(e.message || "Failed to create team");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    const confirm = window.confirm("Are you sure you want to permanently delete this team?");
    if (!confirm) return;

    try {
      await api.deleteTeam(teamId);
      toast.success("Team deleted");
      if (selectedTeamId === teamId) setSelectedTeamId(null);
      await store.fetchTeams();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete team");
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId || !addMemberUserId) return;
    setLoading(true);

    try {
      await api.addTeamMember(selectedTeamId, addMemberUserId);
      toast.success("User added to team");
      setAddMemberOpen(false);
      setAddMemberUserId("");
      // Refresh teams / members lists
      await store.fetchTeams();
    } catch (e: any) {
      toast.error(e.message || "Failed to add member to team");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (teamId: string, userId: string) => {
    try {
      await api.removeTeamMember(teamId, userId);
      toast.success("Member removed from team");
      await store.fetchTeams();
    } catch (e: any) {
      toast.error(e.message || "Failed to remove member");
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-50 bg-gradient-to-r from-zinc-50 to-zinc-400 bg-clip-text text-transparent">
            Workspace Teams
          </h2>
          <p className="text-zinc-500 text-sm mt-1">
            Group operators and administrators for shared scheduling ownership.
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} size="sm">
          <Plus className="w-4 h-4" /> Create Team Group
        </Button>
      </div>

      {/* Grid of Teams */}
      {store.teams.length === 0 ? (
        <div className="p-12 text-center border border-border rounded-2xl glass-panel text-zinc-500 font-medium">
          No teams registered inside this organization workspace.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Teams list */}
          <div className="xl:col-span-1 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">Registered Teams</h3>
            {store.teams.map((team) => (
              <button
                key={team.id}
                onClick={() => setSelectedTeamId(team.id)}
                className={`w-full p-4 rounded-xl text-left glass-panel border transition-all duration-300 flex items-center justify-between ${
                  selectedTeamId === team.id ? "border-primary bg-zinc-900/60" : "border-border hover:border-zinc-700/60"
                }`}
              >
                <div>
                  <h4 className="font-bold text-zinc-200">{team.name}</h4>
                  <span className="text-[10px] text-zinc-500 font-mono block mt-1">Lead ID: {team.team_lead_id ? team.team_lead_id.slice(0, 8) : "None"}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTeam(team.id);
                  }}
                  className="p-1.5 hover:bg-zinc-800 text-zinc-500 hover:text-red-400 rounded-lg cursor-pointer transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </button>
            ))}
          </div>

          {/* Selected Team Members Detail View */}
          <div className="xl:col-span-2">
            {selectedTeamId ? (
              <Card 
                title={`Team Management details`}
                headerAction={
                  <Button onClick={() => setAddMemberOpen(true)} size="sm" variant="outline">
                    <UserPlus className="w-3.5 h-3.5" /> Add Member
                  </Button>
                }
              >
                <div className="p-4 rounded-xl bg-zinc-900/20 border border-border/60 text-xs font-mono space-y-4">
                  <div className="flex justify-between items-center text-zinc-400 border-b border-border/40 pb-3">
                    <span>Collaborator Name</span>
                    <span>Role Access</span>
                  </div>
                  {/* Simulate listed team members */}
                  {store.members.slice(0, 3).map(m => (
                    <div key={m.id} className="flex justify-between items-center py-1">
                      <div>
                        <span className="text-zinc-200 font-bold">{m.full_name || m.email}</span>
                        <span className="text-[10px] text-zinc-500 block">{m.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-zinc-400">{m.role}</span>
                        <button
                          onClick={() => handleRemoveMember(selectedTeamId, m.id)}
                          className="text-red-500 hover:text-red-400 cursor-pointer"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <div className="h-full flex items-center justify-center border border-dashed border-border rounded-2xl p-12 text-zinc-500 text-xs font-mono">
                Select a team from the registry list to edit members and ownership.
              </div>
            )}
          </div>

        </div>
      )}

      {/* Create Team Modal */}
      <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create Team Group">
        <form onSubmit={handleCreateTeam} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-zinc-400 mb-1 font-semibold uppercase tracking-wider">Team Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Core SRE Squad"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-border rounded-lg text-zinc-200 focus:outline-none focus:border-primary text-xs"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1.5 font-semibold uppercase tracking-wider">Assign Team Owner</label>
            <select
              value={teamLeadId}
              onChange={(e) => setTeamLeadId(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-border rounded-lg text-zinc-200 focus:outline-none focus:border-primary text-xs"
            >
              <option value="">-- Select Team Owner --</option>
              {store.members.map((u: any) => (
                <option key={u.id} value={u.id}>
                  {u.full_name || u.email}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" loading={loading} className="w-full mt-2">
            Create Team
          </Button>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal open={addMemberOpen} onClose={() => setAddMemberOpen(false)} title="Add Member to Team">
        <form onSubmit={handleAddMember} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-zinc-400 mb-1.5 font-semibold uppercase tracking-wider">Select Collaborator</label>
            <select
              value={addMemberUserId}
              required
              onChange={(e) => setAddMemberUserId(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-border rounded-lg text-zinc-200 focus:outline-none focus:border-primary text-xs"
            >
              <option value="">-- Choose Member --</option>
              {store.members.map((u: any) => (
                <option key={u.id} value={u.id}>
                  {u.full_name || u.email}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" loading={loading} className="w-full mt-2">
            Add to Team
          </Button>
        </form>
      </Modal>

    </div>
  );
}
