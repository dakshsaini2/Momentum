import React, { useState, useEffect } from "react";
import {
  Flame,
  Clock,
  Play,
  Sparkles,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { api } from "../api";
import type { DashboardSummary, Task } from "../types";
import { useFocusStore } from "../stores/useFocusStore";
import { useCommandStore } from "../stores/useCommandStore";

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { startFocus, energyMode } = useFocusStore();
  const { openQuickTask } = useCommandStore();

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/dashboard?energy=${energyMode}`);
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [energyMode]);

  const handleTaskComplete = async (taskId: string) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status: "COMPLETED", progress: 100 });
      fetchDashboard();
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="p-8 space-y-6 animate-pulse bg-[#F7F8FA]">
        <div className="h-8 bg-[#E6E8EC] rounded-[6px] w-64" />
        <div className="h-48 bg-white border border-[#E6E8EC] rounded-[10px]" />
      </div>
    );
  }

  const { user, momentumScore, focusNow, todayProgress, needsAttention, quickWins } = data;
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto bg-[#F7F8FA]">
      {/* Header Greeting */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-[#667085] uppercase tracking-wider">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
        </p>
        <h1 className="text-3xl font-[650] text-[#172033] tracking-tight">
          Good day, {firstName}
        </h1>
        <p className="text-sm text-[#667085]">Let's build some momentum today.</p>
      </div>

      {/* Grid: Momentum Score + Focus Now */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Momentum Card */}
        <div className="md:col-span-4 bg-white border border-[#E6E8EC] rounded-[10px] p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#176B5B] flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" /> TODAY'S MOMENTUM
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#E8F3F0] text-[#176B5B]">
                Lvl {user?.level || 1}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-[#172033] font-mono">{momentumScore}</span>
              <span className="text-xs text-[#667085]">/ 100</span>
            </div>

            <div className="space-y-1.5">
              <div className="h-2 w-full bg-[#E9EDF1] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#176B5B] rounded-full transition-all duration-300"
                  style={{ width: `${momentumScore}%` }}
                />
              </div>
              <p className="text-[11px] text-[#667085] flex justify-between font-medium">
                <span>{momentumScore > 70 ? "Strong Velocity" : "Building Inertia"}</span>
                <span>{user?.streak || 0}-day streak</span>
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E6E8EC] flex items-center justify-between text-xs text-[#667085]">
            <span>Focus Time Today</span>
            <span className="font-semibold text-[#172033]">{todayProgress.focusMinutes} mins</span>
          </div>
        </div>

        {/* FOCUS NOW Card */}
        <div className="md:col-span-8 bg-white border border-[#E6E8EC] rounded-[10px] p-6 shadow-xs border-l-4 border-l-[#176B5B] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#176B5B] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> FOCUS NOW
            </span>
            {focusNow.task && (
              <span className="text-xs text-[#667085] font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#98A2B3]" /> {focusNow.task.estimatedMinutes} min
              </span>
            )}
          </div>

          {focusNow.task ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-[#172033] tracking-tight">
                  {focusNow.task.title}
                </h2>
                <p className="text-xs text-[#667085] mt-1 font-medium">
                  {focusNow.task.priority} priority · {focusNow.task.project?.name || "General"}
                </p>
              </div>

              {/* Why this task */}
              <div className="space-y-1.5 pt-2 border-t border-[#E6E8EC]">
                <p className="text-xs font-semibold text-[#667085]">Why this task?</p>
                <ul className="space-y-1 text-xs text-[#172033]">
                  {focusNow.reasons.map((reason, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#176B5B]" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#E6E8EC]">
                <div className="text-xs text-[#667085]">
                  Progress: <span className="font-semibold text-[#172033]">{focusNow.task.progress}%</span>
                </div>
                <button
                  onClick={() => startFocus(focusNow.task)}
                  className="btn-primary flex items-center gap-2 px-4 py-2 text-xs shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-white" /> Start Focus
                </button>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center space-y-3">
              <p className="text-base font-semibold text-[#172033]">All clear!</p>
              <p className="text-xs text-[#667085]">No urgent focus tasks. Capture a new task or explore your projects.</p>
              <button
                onClick={openQuickTask}
                className="btn-primary inline-flex items-center gap-1.5 px-3.5 py-2 text-xs shadow-xs"
              >
                <Plus className="w-4 h-4" /> Add Your First Task
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TODAY'S PROGRESS CARD */}
      <div className="bg-white border border-[#E6E8EC] rounded-[10px] p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#172033]">
            ✓ TODAY'S PROGRESS
          </span>
          <span className="text-xs font-semibold text-[#176B5B]">
            {todayProgress.completed} / {todayProgress.total} completed ({todayProgress.percent}%)
          </span>
        </div>
        <div className="h-2 w-full bg-[#E6E8EC] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#176B5B] rounded-full transition-all duration-300"
            style={{ width: `${todayProgress.percent}%` }}
          />
        </div>
      </div>

      {/* NEEDS ATTENTION & QUICK WINS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Needs Attention */}
        <div className="bg-white border border-[#E6E8EC] rounded-[10px] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6E8EC]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#172033] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#B7791F]" /> Needs Attention
            </span>
            <span className="text-xs text-[#667085]">{needsAttention.count} items</span>
          </div>

          <div className="divide-y divide-[#E6E8EC]">
            {needsAttention.count === 0 ? (
              <div className="py-6 text-center space-y-1">
                <p className="text-xs font-medium text-[#172033]">Everything looks clean and on schedule.</p>
                <p className="text-[11px] text-[#98A2B3]">Your tasks will appear here when they need attention.</p>
              </div>
            ) : (
              <>
                {needsAttention.overdue.map((t) => (
                  <div key={t.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-medium text-[#172033]">{t.title}</p>
                      <p className="text-[11px] text-[#C94A4A]">Overdue</p>
                    </div>
                    <button
                      onClick={() => handleTaskComplete(t.id)}
                      className="px-2.5 py-1 rounded-[6px] bg-[#EAF5EF] text-[#2E7D5B] font-medium hover:bg-[#2E7D5B] hover:text-white transition-colors"
                    >
                      Done
                    </button>
                  </div>
                ))}

                {needsAttention.blocked.map((t) => (
                  <div key={t.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-medium text-[#172033]">{t.title}</p>
                      <p className="text-[11px] text-[#B7791F]">
                        Blocked: {t.blockedNote || t.blockedReason}
                      </p>
                    </div>
                    <button
                      onClick={() => startFocus(t)}
                      className="px-2.5 py-1 rounded-[6px] bg-[#F7F8FA] border border-[#E6E8EC] text-[#172033] font-medium hover:bg-[#E6E8EC] transition-colors"
                    >
                      Unblock
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Quick Wins */}
        <div className="bg-white border border-[#E6E8EC] rounded-[10px] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6E8EC]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#172033] flex items-center gap-1.5">
              ⚡ Quick Wins
            </span>
            <span className="text-xs text-[#667085]">≤ 15 mins</span>
          </div>

          <div className="divide-y divide-[#E6E8EC]">
            {quickWins.length === 0 ? (
              <div className="py-6 text-center space-y-1">
                <p className="text-xs font-medium text-[#172033]">No quick win tasks available.</p>
                <p className="text-[11px] text-[#98A2B3]">Add smaller tasks to see quick wins here.</p>
              </div>
            ) : (
              quickWins.map((t) => (
                <div key={t.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={t.status === "COMPLETED"}
                      onChange={() => handleTaskComplete(t.id)}
                      className="w-4 h-4 accent-[#176B5B] rounded cursor-pointer"
                    />
                    <span className="font-medium text-[#172033]">{t.title}</span>
                  </div>
                  <span className="text-[11px] text-[#667085]">{t.estimatedMinutes}m</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
