import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  Plus,
  Filter,
  Sparkles,
  ChevronRight,
  Clock,
  X,
  Play,
  Trash2,
} from "lucide-react";
import { api } from "../api";
import type { Task, Priority, TaskStatus } from "../types";
import { useCommandStore } from "../stores/useCommandStore";
import { useFocusStore } from "../stores/useFocusStore";

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterPriority, setFilterPriority] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const { openQuickTask } = useCommandStore();
  const { startFocus } = useFocusStore();

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/tasks");
      if (res.data?.data) {
        setTasks(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleUpdateStatus = async (taskId: string, status: TaskStatus) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status });
      fetchTasks();
      if (selectedTask?.id === taskId) {
        setSelectedTask((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setSelectedTask(null);
      fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAiBreakdown = async (taskId: string) => {
    try {
      setIsAiLoading(true);
      await api.post(`/tasks/${taskId}/breakdown`);
      fetchTasks();
      const updatedRes = await api.get(`/tasks/${taskId}`);
      if (updatedRes.data?.data) setSelectedTask(updatedRes.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus !== "ALL" && t.status !== filterStatus) return false;
    if (filterPriority !== "ALL" && t.priority !== filterPriority) return false;
    return true;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#172033] flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#176B5B]" /> Tasks
          </h1>
          <p className="text-xs text-[#667085]">Manage, filter, and break down deliverables.</p>
        </div>

        <button
          onClick={openQuickTask}
          className="btn-primary flex items-center gap-1.5 px-3 py-1.5 text-xs shadow-xs"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {/* Filters Bar */}
      <div className="saas-card p-3 flex flex-wrap items-center gap-4 text-xs font-medium text-[#667085]">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-[#98A2B3]" /> Filter:
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-white border border-[#E6E8EC] rounded-[6px] px-2.5 py-1 text-[#172033] focus:outline-none focus:border-[#176B5B]"
        >
          <option value="ALL">All Statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="BLOCKED">Blocked</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="bg-white border border-[#E6E8EC] rounded-[6px] px-2.5 py-1 text-[#172033] focus:outline-none focus:border-[#176B5B]"
        >
          <option value="ALL">All Priorities</option>
          <option value="URGENT">Urgent</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        <span className="ml-auto text-[11px] text-[#98A2B3]">{filteredTasks.length} tasks</span>
      </div>

      {/* Clean Task Rows */}
      <div className="saas-card divide-y divide-[#E6E8EC]">
        {filteredTasks.length === 0 ? (
          <p className="text-xs text-[#98A2B3] text-center py-6">No tasks match selected filter.</p>
        ) : (
          filteredTasks.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTask(t)}
              className={`p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#F7F8FA] transition-colors ${
                selectedTask?.id === t.id ? "bg-[#E8F3F0]/50" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={t.status === "COMPLETED"}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleUpdateStatus(t.id, t.status === "COMPLETED" ? "TODO" : "COMPLETED");
                  }}
                  className="w-4 h-4 accent-[#176B5B] rounded cursor-pointer"
                />
                <div>
                  <h3 className={`text-xs font-semibold text-[#172033] ${t.status === "COMPLETED" ? "line-through text-[#98A2B3]" : ""}`}>
                    {t.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-[#667085] mt-0.5">
                    {t.project && <span className="font-medium text-[#176B5B]">{t.project.name}</span>}
                    <span>• {t.estimatedMinutes}m</span>
                    {t.subtasks && t.subtasks.length > 0 && (
                      <span>• {t.subtasks.filter((s) => s.status === "COMPLETED").length}/{t.subtasks.length} subtasks</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-semibold border ${
                  t.priority === "URGENT" ? "bg-[#FDECEC] text-[#C94A4A] border-[#C94A4A]/20" :
                  t.priority === "HIGH" ? "bg-[#FFF7E6] text-[#C96B3B] border-[#C96B3B]/20" :
                  t.priority === "MEDIUM" ? "bg-[#FFF7E6] text-[#B7791F] border-[#B7791F]/20" :
                  "bg-[#F7F8FA] text-[#98A2B3] border-[#E6E8EC]"
                }`}>
                  {t.priority}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startFocus(t);
                  }}
                  className="p-1 text-[#667085] hover:text-[#176B5B] rounded hover:bg-white"
                  title="Start Focus"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
                <ChevronRight className="w-4 h-4 text-[#98A2B3]" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Slide-Over Right Drawer for Task Details */}
      {selectedTask && (
        <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white border-l border-[#E6E8EC] shadow-lg p-6 z-40 overflow-y-auto space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6E8EC]">
            <span className="text-xs font-semibold text-[#176B5B] uppercase tracking-wider">Task Details</span>
            <button onClick={() => setSelectedTask(null)} className="p-1 text-[#667085] hover:text-[#172033]">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#172033]">{selectedTask.title}</h2>
            {selectedTask.project && <p className="text-xs font-medium text-[#176B5B]">{selectedTask.project.name}</p>}
            {selectedTask.description && <p className="text-xs text-[#667085] mt-2 leading-relaxed">{selectedTask.description}</p>}
          </div>

          {/* Subtasks Section */}
          <div className="space-y-3 pt-4 border-t border-[#E6E8EC]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#172033]">Subtasks</span>
              <button
                onClick={() => handleAiBreakdown(selectedTask.id)}
                disabled={isAiLoading}
                className="text-[11px] font-semibold text-[#176B5B] hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> {isAiLoading ? "Generating..." : "AI Breakdown"}
              </button>
            </div>

            <div className="space-y-1.5">
              {selectedTask.subtasks && selectedTask.subtasks.length > 0 ? (
                selectedTask.subtasks.map((st) => (
                  <div key={st.id} className="p-2 rounded-[6px] bg-[#F7F8FA] border border-[#E6E8EC] flex items-center justify-between text-xs">
                    <span className="text-[#172033]">{st.title}</span>
                    <span className="text-[10px] text-[#667085]">{st.estimatedMinutes}m</span>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-[#98A2B3] italic">No subtasks yet. Click AI Breakdown above.</p>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-1.5 pt-4 border-t border-[#E6E8EC]">
            <div className="flex justify-between text-xs font-semibold text-[#667085]">
              <span>Progress</span>
              <span>{selectedTask.progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={selectedTask.progress}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setSelectedTask({ ...selectedTask, progress: val });
                api.patch(`/tasks/${selectedTask.id}`, { progress: val });
              }}
              className="w-full accent-[#176B5B] cursor-pointer"
            />
          </div>

          {/* Drawer Actions */}
          <div className="pt-4 border-t border-[#E6E8EC] flex items-center justify-between">
            <button
              onClick={() => handleDeleteTask(selectedTask.id)}
              className="flex items-center gap-1 text-xs text-[#C94A4A] hover:underline"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
            <button
              onClick={() => startFocus(selectedTask)}
              className="btn-primary px-4 py-1.5 text-xs shadow-xs"
            >
              Start Focus
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
