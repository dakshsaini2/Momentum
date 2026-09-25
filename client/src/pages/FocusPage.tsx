import React, { useState, useEffect } from "react";
import { Zap, Play, Clock, Smile, Meh, Frown, Ban } from "lucide-react";
import { api } from "../api";
import { useFocusStore } from "../stores/useFocusStore";
import type { FocusSession } from "../types";

export const FocusPage: React.FC = () => {
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { startFocus } = useFocusStore();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const res = await api.get("/focus/history");
        if (res.data?.data) {
          setSessions(res.data.data.sessions || []);
          setTotalMinutes(res.data.data.totalMinutes || 0);
          setTotalSessions(res.data.data.totalSessions || 0);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const feedbackIcon = (fb?: string) => {
    switch (fb) {
      case "EASY": return <Smile className="w-3.5 h-3.5 text-[#2E7D5B]" />;
      case "NORMAL": return <Meh className="w-3.5 h-3.5 text-[#176B5B]" />;
      case "DIFFICULT": return <Frown className="w-3.5 h-3.5 text-[#B7791F]" />;
      case "BLOCKED": return <Ban className="w-3.5 h-3.5 text-[#C94A4A]" />;
      default: return <Clock className="w-3.5 h-3.5 text-[#98A2B3]" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6 animate-pulse bg-[#F7F8FA]">
        <div className="h-8 bg-[#E6E8EC] rounded-[6px] w-48" />
        <div className="h-32 bg-white border border-[#E6E8EC] rounded-[10px]" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#172033] flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#176B5B]" /> Focus Mode
          </h1>
          <p className="text-xs text-[#667085]">Start distraction-free sessions and track your deep work time.</p>
        </div>

        <button
          onClick={() => startFocus()}
          className="btn-primary flex items-center gap-1.5 px-4 py-2 text-xs shadow-xs"
        >
          <Play className="w-4 h-4 fill-white" /> Start Focus Session
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="saas-card p-5 text-center space-y-1">
          <p className="text-3xl font-bold text-[#176B5B]">{totalMinutes}</p>
          <p className="text-xs text-[#667085] font-medium uppercase tracking-wider">Total Focus Minutes</p>
        </div>
        <div className="saas-card p-5 text-center space-y-1">
          <p className="text-3xl font-bold text-[#172033]">{totalSessions}</p>
          <p className="text-xs text-[#667085] font-medium uppercase tracking-wider">Sessions Completed</p>
        </div>
      </div>

      {/* Session History */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-[#172033] uppercase tracking-wider">Recent Sessions</h3>
        <div className="saas-card divide-y divide-[#E6E8EC]">
          {sessions.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <Zap className="w-8 h-8 text-[#E6E8EC] mx-auto" />
              <p className="text-xs font-medium text-[#172033]">No focus sessions yet</p>
              <p className="text-[11px] text-[#98A2B3]">Start a focus session to begin tracking your deep work time.</p>
            </div>
          ) : (
            sessions.map((s) => (
              <div key={s.id} className="p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  {feedbackIcon(s.feedback)}
                  <div>
                    <p className="font-semibold text-[#172033]">{s.task?.title || "Deep Work Session"}</p>
                    <p className="text-[11px] text-[#667085]">
                      {new Date(s.startedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {Math.round(s.duration / 60)} min
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-semibold border ${
                  s.completed
                    ? "bg-[#EAF5EF] text-[#2E7D5B] border-[#2E7D5B]/20"
                    : "bg-[#F7F8FA] text-[#98A2B3] border-[#E6E8EC]"
                }`}>
                  {s.completed ? "Completed" : "Cancelled"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
