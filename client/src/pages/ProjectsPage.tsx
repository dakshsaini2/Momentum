import React, { useState, useEffect } from "react";
import { FolderKanban, Plus, CheckCircle2, Clock, X } from "lucide-react";
import { api } from "../api";
import type { Project } from "../types";

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Project Form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#176B5B");

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/projects");
      if (res.data?.data) {
        setProjects(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await api.post("/projects", { name, description, color });
      setName("");
      setDescription("");
      setIsModalOpen(false);
      fetchProjects();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#172033] flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-[#176B5B]" /> Projects
          </h1>
          <p className="text-xs text-[#667085]">Group deliverables into goal-oriented focus projects.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-1.5 px-3 py-1.5 text-xs shadow-xs"
        >
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => (
          <div key={p.id} className="saas-card p-5 space-y-4 flex flex-col justify-between hover:border-[#D0D5DD] transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color || "#176B5B" }} />
                <span className="text-[11px] font-medium text-[#667085]">{p.taskCount || 0} Tasks</span>
              </div>
              <h3 className="text-base font-semibold text-[#172033]">{p.name}</h3>
              {p.description && <p className="text-xs text-[#667085] line-clamp-2">{p.description}</p>}
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 pt-3 border-t border-[#E6E8EC]">
              <div className="flex justify-between text-xs font-medium text-[#667085]">
                <span>Progress</span>
                <span className="text-[#172033] font-semibold">{p.progress || 0}%</span>
              </div>
              <div className="h-1.5 w-full bg-[#E8F3F0] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${p.progress || 0}%`, backgroundColor: p.color || "#176B5B" }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-[#E6E8EC] rounded-[12px] p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E8EC]">
              <h3 className="text-sm font-semibold text-[#172033]">New Project</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-[#667085] hover:text-[#172033]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[#667085] block mb-1">Project Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Backend API"
                  className="saas-input w-full"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#667085] block mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief goal summary..."
                  rows={2}
                  className="w-full bg-white border border-[#DDE1E6] rounded-[7px] p-2.5 text-xs text-[#172033] focus:outline-none focus:border-[#176B5B]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#667085] block mb-1">Accent Color</label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-9 bg-transparent border border-[#E6E8EC] rounded-[7px] cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary px-3.5 py-1.5 text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary px-3.5 py-1.5 text-xs">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
