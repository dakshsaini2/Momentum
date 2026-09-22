import React, { useState } from "react";
import { Sparkles, X, CornerDownLeft } from "lucide-react";
import { useCommandStore } from "../stores/useCommandStore";
import { api } from "../api";

export const QuickTaskInputModal: React.FC<{ onTaskCreated?: () => void }> = ({ onTaskCreated }) => {
  const { isQuickTaskOpen, closeQuickTask } = useCommandStore();
  const [command, setCommand] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isQuickTaskOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    try {
      setIsSubmitting(true);
      await api.post("/tasks/quick", { command });
      setCommand("");
      closeQuickTask();
      if (onTaskCreated) onTaskCreated();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[520px] bg-white border border-[#E6E8EC] rounded-[12px] shadow-lg overflow-hidden p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E6E8EC]">
          <div className="flex items-center gap-2 text-[#176B5B] font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>New Task</span>
          </div>
          <button onClick={closeQuickTask} className="p-1 text-[#667085] hover:text-[#172033] rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="e.g. Finish database migration tomorrow 6pm #backend !high ~45m"
            rows={3}
            autoFocus
            className="w-full bg-white border border-[#DDE1E6] rounded-[7px] p-3 text-[#172033] text-xs focus:outline-none focus:border-[#176B5B] focus:ring-3 focus:ring-[#E8F3F0] placeholder-[#98A2B3] resize-none"
          />

          <div className="p-3 rounded-[6px] bg-[#F7F8FA] border border-[#E6E8EC] space-y-1 text-[11px] text-[#667085]">
            <p className="font-semibold text-[#172033]">Quick Command Shortcuts:</p>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div><span className="text-[#176B5B] font-mono font-bold">!high</span> / <span className="text-[#C94A4A] font-mono font-bold">!urgent</span> - Priority</div>
              <div><span className="text-[#2E7D5B] font-mono font-bold">#tagname</span> - Tags</div>
              <div><span className="text-[#B7791F] font-mono font-bold">@Project</span> - Project</div>
              <div><span className="text-[#386FA4] font-mono font-bold">tomorrow</span> - Due date</div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={closeQuickTask}
              className="btn-secondary px-3.5 py-1.5 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !command.trim()}
              className="btn-primary flex items-center gap-1.5 px-3.5 py-1.5 text-xs shadow-xs"
            >
              <span>{isSubmitting ? "Adding..." : "Create Task"}</span>
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
