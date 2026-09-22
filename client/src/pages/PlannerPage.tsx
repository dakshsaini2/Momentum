import React, { useState, useEffect } from "react";
import { CalendarDays, CheckCircle2, Award, Save } from "lucide-react";
import { api } from "../api";
import type { DailyPlan, Task } from "../types";

export const PlannerPage: React.FC = () => {
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<"PLANNER" | "REVIEW">("PLANNER");

  const [biggestWin, setBiggestWin] = useState("");
  const [notes, setNotes] = useState("");
  const [carryTaskIds, setCarryTaskIds] = useState<string[]>([]);
  const [isReviewDone, setIsReviewDone] = useState(false);

  const fetchPlanData = async () => {
    try {
      const [planRes, taskRes] = await Promise.all([
        api.get("/planner/plan"),
        api.get("/tasks"),
      ]);
      if (planRes.data?.data) setPlan(planRes.data.data);
      if (taskRes.data?.data) setTasks(taskRes.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPlanData();
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/planner/review", {
        biggestWin,
        notes,
        carryForwardTaskIds: carryTaskIds,
      });
      setIsReviewDone(true);
      fetchPlanData();
    } catch (e) {
      console.error(e);
    }
  };

  const pendingTasks = tasks.filter((t) => t.status !== "COMPLETED");
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED");

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header Tabs */}
      <div className="flex items-center justify-between border-b border-[#E6E8EC] pb-4">
        <div>
          <h1 className="text-xl font-semibold text-[#172033] flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-[#176B5B]" /> Planner & Review
          </h1>
          <p className="text-xs text-[#667085]">Structure your work day and review wins at closing time.</p>
        </div>

        <div className="flex bg-[#F7F8FA] p-0.5 rounded-[7px] border border-[#E6E8EC] text-xs font-medium">
          <button
            onClick={() => setActiveTab("PLANNER")}
            className={`px-3 py-1 rounded-[5px] transition-all ${
              activeTab === "PLANNER" ? "bg-white text-[#176B5B] shadow-xs font-semibold" : "text-[#667085]"
            }`}
          >
            Morning Schedule
          </button>
          <button
            onClick={() => setActiveTab("REVIEW")}
            className={`px-3 py-1 rounded-[5px] transition-all ${
              activeTab === "REVIEW" ? "bg-white text-[#176B5B] shadow-xs font-semibold" : "text-[#667085]"
            }`}
          >
            Evening Review
          </button>
        </div>
      </div>

      {/* Tab 1: Morning Planner */}
      {activeTab === "PLANNER" && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-[#172033] uppercase tracking-wider">Today's Allocated Time Blocks</h3>
          <div className="saas-card divide-y divide-[#E6E8EC]">
            {plan?.schedule && plan.schedule.length > 0 ? (
              plan.schedule.map((slot, idx) => (
                <div key={idx} className="p-3.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs font-semibold text-[#176B5B] px-2 py-0.5 rounded bg-[#E8F3F0]">
                      {slot.time}
                    </span>
                    <div>
                      <p className="font-medium text-[#172033]">{slot.title}</p>
                      <p className="text-[11px] text-[#667085]">{slot.duration} min duration</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-[#2E7D5B] uppercase px-2 py-0.5 rounded bg-[#EAF5EF]">
                    Allocated
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#98A2B3] text-center py-6">Generating daily schedule plan...</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Evening Review */}
      {activeTab === "REVIEW" && (
        <div className="saas-card p-6 space-y-6">
          {isReviewDone ? (
            <div className="py-8 text-center space-y-2">
              <Award className="w-10 h-10 text-[#2E7D5B] mx-auto" />
              <h2 className="text-lg font-bold text-[#172033]">Day Complete! (+20 XP)</h2>
              <p className="text-xs text-[#667085]">Great job reflecting on your progress today. Time to unwind.</p>
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-[#172033]">Day Complete Review</h3>
                <p className="text-xs text-[#667085]">
                  You completed {completedTasks.length} out of {tasks.length} tasks today ({Math.round((completedTasks.length / Math.max(1, tasks.length)) * 100)}%).
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#172033] block mb-1">What was your biggest win today?</label>
                <input
                  type="text"
                  value={biggestWin}
                  onChange={(e) => setBiggestWin(e.target.value)}
                  placeholder="e.g. Shipped the JWT authentication middleware successfully"
                  className="saas-input w-full"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#172033] block mb-1">Carry Forward Incomplete Tasks to Tomorrow:</label>
                <div className="space-y-2 mt-2">
                  {pendingTasks.map((t) => (
                    <label key={t.id} className="flex items-center gap-2 text-xs text-[#172033] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={carryTaskIds.includes(t.id)}
                        onChange={(e) => {
                          if (e.target.checked) setCarryTaskIds([...carryTaskIds, t.id]);
                          else setCarryTaskIds(carryTaskIds.filter((id) => id !== t.id));
                        }}
                        className="w-4 h-4 accent-[#176B5B] rounded"
                      />
                      <span>{t.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-primary w-full py-2.5 text-xs shadow-xs flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> Save Review & Carry Forward
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
