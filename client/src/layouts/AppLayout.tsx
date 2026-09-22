import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { TopNav } from "../components/TopNav";
import { CommandPalette } from "../components/CommandPalette";
import { QuickTaskInputModal } from "../components/QuickTaskInputModal";
import { FocusOverlayModal } from "../components/FocusOverlayModal";
import { ShortcutModal } from "../components/ShortcutModal";
import { useCommandStore } from "../stores/useCommandStore";
import { useFocusStore } from "../stores/useFocusStore";

export const AppLayout: React.FC = () => {
  const { openSearch, openQuickTask, toggleShortcutModal, closeSearch, closeQuickTask } = useCommandStore();
  const { startFocus } = useFocusStore();
  const navigate = useNavigate();

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable) {
        if (e.key === "Escape") {
          closeSearch();
          closeQuickTask();
        }
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openSearch();
        return;
      }

      switch (e.key.toLowerCase()) {
        case "/":
          e.preventDefault();
          openSearch();
          break;
        case "n":
          e.preventDefault();
          openQuickTask();
          break;
        case "d":
          e.preventDefault();
          navigate("/");
          break;
        case "t":
          e.preventDefault();
          navigate("/today");
          break;
        case "f":
          e.preventDefault();
          startFocus();
          break;
        case "p":
          e.preventDefault();
          navigate("/projects");
          break;
        case "?":
          e.preventDefault();
          toggleShortcutModal();
          break;
        case "escape":
          closeSearch();
          closeQuickTask();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openSearch, openQuickTask, toggleShortcutModal, closeSearch, closeQuickTask, navigate, startFocus]);

  return (
    <div className="flex min-h-screen bg-[#F7F8FA] text-[#172033]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 bg-[#F7F8FA]">
        <TopNav />
        <main className="flex-1 overflow-y-auto bg-[#F7F8FA]">
          <Outlet />
        </main>
      </div>

      {/* Global Modals & Overlays */}
      <CommandPalette />
      <QuickTaskInputModal />
      <FocusOverlayModal />
      <ShortcutModal />
    </div>
  );
};
