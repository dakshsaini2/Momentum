import React, { useState, useEffect } from "react";
import { Search, CheckSquare, FolderKanban, X } from "lucide-react";
import { useCommandStore } from "../stores/useCommandStore";
import { api } from "../api";
import type { Task, Project } from "../types";
import { useNavigate } from "react-router-dom";

export const CommandPalette: React.FC = () => {
  const { isSearchOpen, closeSearch } = useCommandStore();
  const [query, setQuery] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSearchOpen) return;
    setQuery("");

    const fetchAll = async () => {
      try {
        const [taskRes, projRes] = await Promise.all([
          api.get("/tasks"),
          api.get("/projects"),
        ]);
        if (taskRes.data?.data?.tasks) setTasks(taskRes.data.data.tasks);
        if (projRes.data?.data) setProjects(projRes.data.data);
      } catch (e) {
        // silent
      }
    };
    fetchAll();
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(query.toLowerCase())
  );
  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-start justify-center pt-24 p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-[520px] bg-white border border-[#E6E8EC] rounded-[12px] shadow-lg overflow-hidden flex flex-col">
        {/* Search Header */}
        <div className="p-3.5 border-b border-[#E6E8EC] flex items-center gap-2.5">
          <Search className="w-4 h-4 text-[#176B5B] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search tasks, projects..."
            autoFocus
            className="w-full bg-transparent text-[#172033] text-xs focus:outline-none placeholder-[#98A2B3]"
          />
          <button onClick={closeSearch} className="p-1 text-[#667085] hover:text-[#172033] rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-2 max-h-80 overflow-y-auto space-y-3">
          {/* Projects */}
          {filteredProjects.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-[#667085] px-2 uppercase tracking-wider mb-1">
                Projects
              </p>
              <div className="space-y-0.5">
                {filteredProjects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      closeSearch();
                      navigate('/projects');
                    }}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-[6px] hover:bg-[#F7F8FA] cursor-pointer text-xs font-medium text-[#172033] transition-colors"
                  >
                    <FolderKanban className="w-4 h-4 text-[#176B5B]" />
                    <span>{p.name}</span>
                    <span className="ml-auto text-[10px] text-[#667085]">{p.taskCount || 0} tasks</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks */}
          {filteredTasks.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-[#667085] px-2 uppercase tracking-wider mb-1">
                Tasks
              </p>
              <div className="space-y-0.5">
                {filteredTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      closeSearch();
                      navigate(`/tasks`);
                    }}
                    className="flex items-center justify-between px-2.5 py-2 rounded-[6px] hover:bg-[#F7F8FA] cursor-pointer text-xs font-medium text-[#172033] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckSquare className="w-4 h-4 text-[#2E7D5B]" />
                      <span>{t.title}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F7F8FA] border border-[#E6E8EC] text-[#667085]">
                      {t.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredTasks.length === 0 && filteredProjects.length === 0 && (
            <p className="text-center py-6 text-xs text-[#98A2B3]">No matching tasks or projects found.</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-3.5 py-2 bg-[#F7F8FA] border-t border-[#E6E8EC] flex items-center justify-between text-[11px] text-[#667085]">
          <span>Navigate with arrows</span>
          <span><kbd className="px-1 py-0.5 rounded bg-white border border-[#E6E8EC] font-mono text-[10px]">Esc</kbd> to close</span>
        </div>
      </div>
    </div>
  );
};
