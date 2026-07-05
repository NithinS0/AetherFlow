import { useState, useEffect } from "react";
import { useStore } from "../stores/store";
import { api } from "../services/api";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { Plus, Tag, Archive, FolderMinus } from "lucide-react";
import { toast } from "sonner";

export function Projects() {
  const store = useStore();
  const [projName, setProjName] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projAvatar, setProjAvatar] = useState("");
  const [projTags, setProjTags] = useState("");
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const activeOrg = store.activeOrg;

  useEffect(() => {
    if (activeOrg) {
      store.fetchProjects();
    }
  }, [activeOrg]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg) return;
    setLoading(true);

    const tagsArray = projTags.split(",").map(t => t.trim()).filter(Boolean);

    try {
      await api.createProject({
        name: projName,
        description: projDesc,
        organization_id: activeOrg.id,
        avatar_url: projAvatar || null,
        tags: tagsArray
      });
      toast.success("Project created successfully");
      setCreateModalOpen(false);
      setProjName("");
      setProjDesc("");
      setProjAvatar("");
      setProjTags("");
      await store.fetchProjects();
    } catch (e: any) {
      toast.error(e.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveProject = async (projectId: string) => {
    const confirm = window.confirm("Are you sure you want to archive this project?");
    if (!confirm) return;

    try {
      await api.archiveProject(projectId);
      toast.success("Project archived");
      await store.fetchProjects();
    } catch (e: any) {
      toast.error(e.message || "Failed to archive project");
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const confirm = window.confirm("Are you sure you want to permanently delete this project?");
    if (!confirm) return;

    try {
      await api.deleteProject(projectId);
      toast.success("Project permanently deleted");
      await store.fetchProjects();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete project");
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-50 bg-gradient-to-r from-zinc-50 to-zinc-400 bg-clip-text text-transparent">
            Project Pipelines
          </h2>
          <p className="text-zinc-500 text-sm mt-1">
            Create project scopes, archive stale codebases, and assign tags parameters.
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} size="sm">
          <Plus className="w-4 h-4" /> Create Project
        </Button>
      </div>

      {/* Grid of Projects */}
      {store.projects.length === 0 ? (
        <div className="p-12 text-center border border-border rounded-2xl glass-panel text-zinc-500 font-medium">
          No projects registered inside this organization workspace.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {store.projects.map((project) => (
            <div 
              key={project.id}
              className={`p-6 rounded-2xl glass-panel border shadow-lg flex flex-col justify-between space-y-6 transition-all duration-300 relative overflow-hidden ${
                project.is_archived ? "border-amber-900/30 opacity-60" : "border-border hover:border-primary/20"
              }`}
            >
              {/* Badge for archived */}
              {project.is_archived && (
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] font-bold uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1">
                  <Archive className="w-3 h-3" /> Archived
                </span>
              )}

              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center font-bold text-zinc-300 border border-border">
                    {project.avatar_url ? (
                      <img src={project.avatar_url} alt={project.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      project.name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-200">{project.name}</h3>
                    <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">{project.id.slice(0, 8)}...</span>
                  </div>
                </div>
                
                <p className="text-xs text-zinc-400 mt-4 leading-relaxed">
                  {project.description || "No description provided."}
                </p>
              </div>

              {/* Tags and actions */}
              <div className="space-y-4 pt-4 border-t border-border/40">
                <div className="flex flex-wrap gap-1.5">
                  {project.tags && Array.isArray(project.tags) ? (
                    project.tags.map((tag: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-zinc-900 border border-border text-[9px] font-mono text-zinc-400 flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5 text-zinc-500" /> {tag}
                      </span>
                    ))
                  ) : null}
                </div>

                <div className="flex gap-2">
                  {!project.is_archived && (
                    <button
                      onClick={() => handleArchiveProject(project.id)}
                      className="flex-1 py-2 bg-zinc-900 border border-border text-zinc-400 hover:text-amber-400 hover:border-amber-950 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Archive className="w-3.5 h-3.5" /> Archive Project
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="p-2 bg-zinc-900 border border-border text-zinc-500 hover:text-red-400 hover:border-red-950 rounded-lg transition-colors cursor-pointer"
                  >
                    <FolderMinus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Project">
        <form onSubmit={handleCreateProject} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-zinc-400 mb-1 font-semibold uppercase tracking-wider">Project Name</label>
            <input
              type="text"
              required
              placeholder="e.g. API Gateway Hub"
              value={projName}
              onChange={(e) => setProjName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-border rounded-lg text-zinc-200 focus:outline-none focus:border-primary text-xs"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1 font-semibold uppercase tracking-wider">Description</label>
            <textarea
              rows={3}
              placeholder="Provide project context and pipeline requirements..."
              value={projDesc}
              onChange={(e) => setProjDesc(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-border rounded-lg text-zinc-200 focus:outline-none focus:border-primary text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 mb-1 font-semibold uppercase tracking-wider">Tags (comma-separated)</label>
              <input
                type="text"
                placeholder="api, devops, backend"
                value={projTags}
                onChange={(e) => setProjTags(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-border rounded-lg text-zinc-200 focus:outline-none focus:border-primary text-xs"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1 font-semibold uppercase tracking-wider">Avatar Icon URL</label>
              <input
                type="text"
                placeholder="https://..."
                value={projAvatar}
                onChange={(e) => setProjAvatar(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-border rounded-lg text-zinc-200 focus:outline-none focus:border-primary text-xs"
              />
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full mt-2">
            Create Project
          </Button>
        </form>
      </Modal>

    </div>
  );
}
