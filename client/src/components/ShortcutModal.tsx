import React from "react";
import { Keyboard, X } from "lucide-react";
import { useCommandStore } from "../stores/useCommandStore";

export const ShortcutModal: React.FC = () => {
  const { isShortcutModalOpen, toggleShortcutModal } = useCommandStore();

  if (!isShortcutModalOpen) return null;

  const shortcuts = [
    { key: "N", desc: "Create New Task (Quick Command Capture)" },
    { key: "⌘ K or /", desc: "Open Global Search Palette" },
    { key: "D", desc: "Navigate to Dashboard / Overview" },
    { key: "T", desc: "Navigate to Today View" },
    { key: "F", desc: "Open Focus Mode Timer" },
    { key: "P", desc: "Navigate to Projects" },
    { key: "Esc", desc: "Close Modals / Overlays" },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white border border-[#E6E8EC] rounded-[12px] p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E6E8EC]">
          <div className="flex items-center gap-2 text-[#172033] font-semibold text-xs uppercase tracking-wider">
            <Keyboard className="w-4 h-4 text-[#176B5B]" />
            <span>Shortcuts</span>
          </div>
          <button onClick={toggleShortcutModal} className="p-1 text-[#667085] hover:text-[#172033] rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1.5">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between p-2 rounded-[6px] bg-[#F7F8FA] border border-[#E6E8EC] text-xs">
              <span className="text-[#172033] font-medium">{s.desc}</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#E6E8EC] text-[#176B5B] font-mono text-[10px] font-bold">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
