import React, { useEffect, useState } from "react";
import { Play, Pause, CheckCircle, Smile, Meh, Frown, Ban, Flame } from "lucide-react";
import { useFocusStore } from "../stores/useFocusStore";
import { api } from "../api";
import type { FocusFeedback } from "../types";

export const FocusOverlayModal: React.FC = () => {
  const {
    activeTask,
    isFocusModeActive,
    isTimerRunning,
    durationSeconds,
    elapsedSeconds,
    pauseTimer,
    resumeTimer,
    tickTimer,
    stopFocus,
  } = useFocusStore();

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isFocusModeActive || !isTimerRunning) return;

    const interval = setInterval(() => {
      tickTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [isFocusModeActive, isTimerRunning, tickTimer]);

  useEffect(() => {
    if (isFocusModeActive && elapsedSeconds >= durationSeconds && durationSeconds > 0) {
      pauseTimer();
      setShowFeedbackModal(true);
    }
  }, [elapsedSeconds, durationSeconds, isFocusModeActive]);

  if (!isFocusModeActive) return null;

  const remainingSeconds = Math.max(0, durationSeconds - elapsedSeconds);
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const progressPercent = Math.min(100, Math.round((elapsedSeconds / durationSeconds) * 100));

  const handleFinishSession = () => {
    setShowFeedbackModal(true);
  };

  const submitFeedback = async (feedbackChoice: FocusFeedback) => {
    try {
      setIsSubmitting(true);
      await api.post("/focus/session", {
        taskId: activeTask?.id,
        durationSeconds: Math.max(1, elapsedSeconds),
        feedback: feedbackChoice,
        completed: true,
      });

      if (activeTask?.id) {
        await api.patch(`/tasks/${activeTask.id}`, {
          status: feedbackChoice === "BLOCKED" ? "BLOCKED" : "COMPLETED",
          progress: 100,
        });
      }

      setShowFeedbackModal(false);
      stopFocus();
    } catch (e) {
      console.error(e);
      stopFocus();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#F7F8FA] z-50 flex flex-col items-center justify-between p-8 text-[#172033] select-none animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="w-full max-w-3xl flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#176B5B] font-semibold text-xs uppercase tracking-wider">
          <Flame className="w-4 h-4" />
          <span>MOMENTUM FOCUS</span>
        </div>
        <button
          onClick={stopFocus}
          className="btn-secondary px-3 py-1.5 text-xs"
        >
          Exit Focus
        </button>
      </div>

      {/* Main Focus Center */}
      <div className="w-full max-w-md text-center space-y-8 my-auto">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-[#176B5B] uppercase tracking-wider">
            {activeTask?.project?.name || "Deep Focus Work"}
          </span>
          <h2 className="text-2xl font-bold text-[#172033] tracking-tight">
            {activeTask?.title || "Deep Work Session"}
          </h2>
        </div>

        {/* Digital Timer */}
        <div className="py-2">
          <div className="text-7xl font-mono font-bold tracking-tighter text-[#172033]">
            {formattedTime}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="h-2 w-full bg-[#E8F3F0] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#176B5B] rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs font-medium text-[#667085]">{progressPercent}% complete</p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          {isTimerRunning ? (
            <button onClick={pauseTimer} className="btn-secondary px-5 py-2.5 text-xs flex items-center gap-2">
              <Pause className="w-4 h-4" /> Pause
            </button>
          ) : (
            <button onClick={resumeTimer} className="btn-primary px-5 py-2.5 text-xs flex items-center gap-2">
              <Play className="w-4 h-4 fill-white" /> Resume
            </button>
          )}

          <button onClick={handleFinishSession} className="btn-primary px-5 py-2.5 text-xs flex items-center gap-2 bg-[#2E7D5B] hover:bg-[#25664A]">
            <CheckCircle className="w-4 h-4" /> Finish Session
          </button>
        </div>
      </div>

      {/* Quote */}
      <p className="text-xs text-[#98A2B3]">Focus is a muscle. Build momentum one task at a time.</p>

      {/* Post-Focus Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-60 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white border border-[#E6E8EC] rounded-[12px] p-6 shadow-lg text-center space-y-5">
            <h3 className="text-base font-semibold text-[#172033]">How did the session go?</h3>
            <p className="text-xs text-[#667085]">Rate difficulty to calibrate your productivity insights.</p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => submitFeedback("EASY")}
                disabled={isSubmitting}
                className="flex flex-col items-center gap-1.5 p-3 rounded-[8px] bg-[#EAF5EF] border border-[#2E7D5B]/30 hover:bg-[#2E7D5B] hover:text-white transition-colors"
              >
                <Smile className="w-6 h-6 text-[#2E7D5B]" />
                <span className="text-xs font-semibold">Easy (+15 XP)</span>
              </button>

              <button
                onClick={() => submitFeedback("NORMAL")}
                disabled={isSubmitting}
                className="flex flex-col items-center gap-1.5 p-3 rounded-[8px] bg-[#E8F3F0] border border-[#176B5B]/30 hover:bg-[#176B5B] hover:text-white transition-colors"
              >
                <Meh className="w-6 h-6 text-[#176B5B]" />
                <span className="text-xs font-semibold">Normal (+15 XP)</span>
              </button>

              <button
                onClick={() => submitFeedback("DIFFICULT")}
                disabled={isSubmitting}
                className="flex flex-col items-center gap-1.5 p-3 rounded-[8px] bg-[#FFF7E6] border border-[#B7791F]/30 hover:bg-[#B7791F] hover:text-white transition-colors"
              >
                <Frown className="w-6 h-6 text-[#B7791F]" />
                <span className="text-xs font-semibold">Difficult (+25 XP)</span>
              </button>

              <button
                onClick={() => submitFeedback("BLOCKED")}
                disabled={isSubmitting}
                className="flex flex-col items-center gap-1.5 p-3 rounded-[8px] bg-[#FDECEC] border border-[#C94A4A]/30 hover:bg-[#C94A4A] hover:text-white transition-colors"
              >
                <Ban className="w-6 h-6 text-[#C94A4A]" />
                <span className="text-xs font-semibold">Blocked</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
