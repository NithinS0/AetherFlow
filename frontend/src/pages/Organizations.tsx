import { useState, useEffect } from "react";
import { useStore } from "../stores/store";
import { api } from "../services/api";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Modal } from "../components/Modal";
import { Table } from "../components/Table";
import { 
  UserPlus, 
  Trash2, 
  Save
} from "lucide-react";
import { toast } from "sonner";

export function Organizations() {
  const store = useStore();
  const [orgName, setOrgName] = useState("");
  const [orgLogo, setOrgLogo] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Viewer");
  
  const [loading, setLoading] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const activeOrg = store.activeOrg;

  useEffect(() => {
    if (activeOrg) {
      setOrgName(activeOrg.name);
      setOrgLogo(activeOrg.logo_url || "");
    }
  }, [activeOrg]);

  const handleUpdateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg) return;
    setLoading(true);
    try {
      await api.updateOrganization(activeOrg.id, {
        name: orgName,
        logo_url: orgLogo
      });
      toast.success("Organization updated successfully");
      await store.fetchOrgs();
    } catch (e: any) {
      toast.error(e.message || "Failed to update organization");
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg) return;
    setLoading(true);
    try {
      await api.inviteOrgMember(activeOrg.id, {
        email: inviteEmail,
        role_name: inviteRole
      });
      toast.success(`Invitation dispatched to ${inviteEmail}`);
      setInviteModalOpen(false);
      setInviteEmail("");
      await store.fetchMembers();
    } catch (e: any) {
      toast.error(e.message || "Failed to dispatch invitation");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!activeOrg) return;
    if (userId === store.user?.id) {
      toast.error("You cannot remove yourself from the organization workspace.");
      return;
    }

    try {
      await api.removeOrgMember(activeOrg.id, userId);
      toast.success("Member removed from organization.");
      await store.fetchMembers();
    } catch (e: any) {
      toast.error(e.message || "Failed to remove member");
    }
  };

  const handleSoftDelete = async () => {
    if (!activeOrg) return;
    const confirm = window.confirm("Are you sure you want to soft-delete this organization? All projects inside will be suspended.");
    if (!confirm) return;

    try {
      await api.deleteOrganization(activeOrg.id);
      toast.success("Organization soft-deleted");
      localStorage.removeItem("aetherflow_active_org");
      window.location.reload();
    } catch (e: any) {
      toast.error(e.message || "Delete failed");
    }
  };

  const columns = [
    { key: "email", header: "Email Address" },
    { key: "full_name", header: "Display Name" },
    { 
      key: "role", 
      header: "Access Role",
      render: (row: any) => (
        <span className="font-mono text-zinc-400 font-bold uppercase text-[10px]">
          {row.role}
        </span>
      )
    },
    {
      key: "actions",
      header: "Management",
      render: (row: any) => (
        <button
          onClick={() => handleRemoveMember(row.id)}
          disabled={row.id === store.user?.id}
          className="text-red-500 hover:text-red-400 cursor-pointer disabled:opacity-30"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-50 bg-gradient-to-r from-zinc-50 to-zinc-400 bg-clip-text text-transparent">
            Workspace Access
          </h2>
          <p className="text-zinc-500 text-sm mt-1">
            Keep workspace membership and metadata secondary to the core scheduler workflow.
          </p>
        </div>
        <Button onClick={() => setInviteModalOpen(true)} size="sm">
          <UserPlus className="w-4 h-4" /> Invite Member
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Settings Card */}
        <div className="xl:col-span-1">
          <Card title="Workspace Settings" subtitle="Manage the optional workspace shell around the scheduler">
            <form onSubmit={handleUpdateOrg} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold uppercase tracking-wider">Organization Name</label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-900 border border-border rounded-lg text-zinc-200 focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold uppercase tracking-wider">Logo Asset URL</label>
                <input
                  type="text"
                  value={orgLogo}
                  onChange={(e) => setOrgLogo(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-900 border border-border rounded-lg text-zinc-200 focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" loading={loading} className="flex-1">
                  <Save className="w-4 h-4" /> Update Profile
                </Button>
                <Button type="button" variant="danger" onClick={handleSoftDelete} className="px-3">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Member Directory */}
        <div className="xl:col-span-2">
          <Card title="Workspace Members" subtitle="Review simplified platform roles for each member">
            <Table columns={columns} data={store.members} />
          </Card>
        </div>
      </div>

      {/* Invite Modal */}
      <Modal open={inviteModalOpen} onClose={() => setInviteModalOpen(false)} title="Invite Workspace Member">
        <form onSubmit={handleInviteMember} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-zinc-400 mb-1 font-semibold uppercase tracking-wider">User Email</label>
            <input
              type="email"
              required
              placeholder="collaborator@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-border rounded-lg text-zinc-200 focus:outline-none focus:border-primary text-xs"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1.5 font-semibold uppercase tracking-wider">Platform Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full px-3 py-2.5 bg-zinc-900 border border-border rounded-lg text-zinc-200 focus:outline-none focus:border-primary text-xs"
            >
              <option value="Administrator">Administrator</option>
              <option value="Operator">Operator</option>
              <option value="Viewer">Viewer (Read-Only)</option>
            </select>
          </div>

          <Button type="submit" loading={loading} className="w-full mt-2">
            Dispatch Invite
          </Button>
        </form>
      </Modal>

    </div>
  );
}
