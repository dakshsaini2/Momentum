import React, { useState, useEffect } from "react";
import { CalendarCheck2, Flame, Zap, CheckCircle2, Clock, Plus, Play } from "lucide-react";
import { api } from "../api";
import type { Task } from "../types";
import { useFocusStore } from "../stores/useFocusStore";
import { useCommandStore } from "../stores/useCommandStore";

export const TodayPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { startFocus } = useFocusStore();
  const { openQuickTask } = useCommandStore();

  const fetchTodayTasks = async () => {
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
    fetchTodayTasks();
  }, []);

  const handleToggle = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "COMPLETED" ? "TODO" : "COMPLETED";
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
      fetchTodayTasks();
    } catch (e) {
      console.error(e);
    }
  };

  const completed = tasks.filter((t) => t.status === "COMPLETED");
  const remaining = tasks.filter((t) => t.status !== "COMPLETED" && t.status !== "ARCHIVED");
  const focusTasks = remaining.filter((t) => t.priority === "URGENT" || t.priority === "HIGH");
  const quickWins = remaining.filter((t) => t.estimatedMinutes <= 15);
  const otherTasks = remaining.filter((t) => !focusTasks.includes(t) && !quickWins.includes(t));

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#172033] flex items-center gap-2">
            <CalendarCheck2 className="w-5 h-5 text-[#176B5B]" /> Today
          </h1>
          <p className="text-xs text-[#667085]">Organize priorities and make steady progress today.</p>
        </div>

        <button
          onClick={openQuickTask}
          className="btn-primary flex items-center gap-1.5 px-3 py-1.5 text-xs shadow-xs"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="saas-card p-3.5 text-center">
          <p className="text-xl font-bold text-[#176B5B]">{focusTasks.length}</p>
          <p className="text-[11px] text-[#667085] font-medium uppercase tracking-wider">Focus Priorities</p>
        </div>
        <div className="saas-card p-3.5 text-center">
          <p className="text-xl font-bold text-[#2E7D5B]">{quickWins.length}</p>
          <p className="text-[11px] text-[#667085] font-medium uppercase tracking-wider">Quick Wins</p>
        </div>
        <div className="saas-card p-3.5 text-center">
          <p className="text-xl font-bold text-[#172033]">{completed.length}</p>
          <p className="text-[11px] text-[#667085] font-medium uppercase tracking-wider">Completed</p>
        </div>
      </div>

      {/* Task Sections as Rows */}
      <div className="space-y-6">
        {/* Focus Priorities */}
        {focusTasks.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-[#B7791F] uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" /> High Focus Priorities
            </h3>
            <div className="saas-card divide-y divide-[#E6E8EC]">
              {focusTasks.map((t) => (
                <div key={t.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-[#F7F8FA] transition-colors">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={t.status === "COMPLETED"}
                      onChange={() => handleToggle(t.id, t.status)}
                      className="w-4 h-4 accent-[#176B5B] rounded cursor-pointer"
                    />
                    <div>
                      <p className="font-semibold text-[#172033]">{t.title}</p>
                      <p className="text-[11px] text-[#667085]">
                        {t.project?.name || "General"} · {t.estimatedMinutes} min
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => startFocus(t)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-[6px] bg-[#E8F3F0] text-[#176B5B] font-medium hover:bg-[#176B5B] hover:text-white transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" /> Focus
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Wins */}
        {quickWins.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-[#2E7D5B] uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Quick Wins (≤ 15 min)
            </h3>
            <div className="saas-card divide-y divide-[#E6E8EC]">
              {quickWins.map((t) => (
                <div key={t.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-[#F7F8FA] transition-colors">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={t.status === "COMPLETED"}
                      onChange={() => handleToggle(t.id, t.status)}
                      className="w-4 h-4 accent-[#2E7D5B] rounded cursor-pointer"
                    />
                    <span className="font-medium text-[#172033]">{t.title}</span>
                  </div>
                  <span className="text-[11px] text-[#667085]">{t.estimatedMinutes} min</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Remaining Actions */}
        {otherTasks.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-[#667085] uppercase tracking-wider">Remaining Actions</h3>
            <div className="saas-card divide-y divide-[#E6E8EC]">
              {otherTasks.map((t) => (
                <div key={t.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-[#F7F8FA] transition-colors">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={t.status === "COMPLETED"}
                      onChange={() => handleToggle(t.id, t.status)}
                      className="w-4 h-4 accent-[#176B5B] rounded cursor-pointer"
                    />
                    <span className="font-medium text-[#172033]">{t.title}</span>
                  </div>
                  <button onClick={() => startFocus(t)} className="p-1 text-[#667085] hover:text-[#172033]">
                    <Play className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Today */}
        {completed.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-[#E6E8EC]">
            <h3 className="text-xs font-semibold text-[#98A2B3] uppercase tracking-wider">Completed Today</h3>
            <div className="saas-card divide-y divide-[#E6E8EC]">
              {completed.map((t) => (
                <div key={t.id} className="p-3 flex items-center gap-3 text-xs text-[#98A2B3] line-through">
                  <CheckCircle2 className="w-4 h-4 text-[#2E7D5B] shrink-0" />
                  <span>{t.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
