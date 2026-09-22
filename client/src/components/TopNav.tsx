import React, { useState, useEffect } from "react";
import { Search, Plus, Bell, Zap, BatteryCharging, Leaf, Check } from "lucide-react";
import { useCommandStore } from "../stores/useCommandStore";
import { useFocusStore } from "../stores/useFocusStore";
import { api } from "../api";
import type { Notification, EnergyLevel } from "../types";

export const TopNav: React.FC = () => {
  const { openSearch, openQuickTask } = useCommandStore();
  const { energyMode, setEnergyMode } = useFocusStore();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await api.get("/notifications");
        if (res.data?.data) {
          setNotifications(res.data.data.notifications || []);
          setUnreadCount(res.data.data.unreadCount || 0);
        }
      } catch (e) {
        // silent
      }
    };
    fetchNotifs();
  }, []);

  const markRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      // silent
    }
  };

  const energyOptions: { mode: EnergyLevel; label: string; icon: any }[] = [
    { mode: "HIGH", label: "High Energy", icon: Zap },
    { mode: "MEDIUM", label: "Medium Energy", icon: BatteryCharging },
    { mode: "LOW", label: "Low Energy", icon: Leaf },
  ];

  return (
    <header className="h-14 bg-white border-b border-[#E6E8EC] px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Compact Search Bar */}
      <button
        onClick={openSearch}
        className="flex items-center gap-2 px-3 py-1.5 rounded-[7px] bg-[#F7F8FA] border border-[#E6E8EC] text-[#667085] hover:text-[#172033] hover:border-[#D0D5DD] transition-all w-64 text-xs"
      >
        <Search className="w-3.5 h-3.5 text-[#98A2B3]" />
        <span className="text-[#98A2B3] text-xs font-normal">Search...</span>
        <kbd className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-[#E6E8EC] text-[#667085]">
          ⌘K
        </kbd>
      </button>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Energy Mode Selector */}
        <div className="flex items-center bg-[#F7F8FA] border border-[#E6E8EC] p-0.5 rounded-[7px]">
          {energyOptions.map((opt) => {
            const isSelected = energyMode === opt.mode;
            const Icon = opt.icon;
            return (
              <button
                key={opt.mode}
                onClick={() => setEnergyMode(opt.mode)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-white text-[#176B5B] shadow-xs font-semibold"
                    : "text-[#667085] hover:text-[#172033]"
                }`}
                title={`Filter recommendations for ${opt.label}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Add Task Button */}
        <button
          onClick={openQuickTask}
          className="btn-primary flex items-center gap-1.5 px-3 py-1.5 text-xs shadow-xs transition-all active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
          <kbd className="text-[10px] font-mono px-1 py-0.2 rounded bg-white/20 text-white">N</kbd>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-1.5 rounded-[7px] bg-white border border-[#E6E8EC] text-[#667085] hover:text-[#172033] hover:bg-[#F7F8FA] transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C94A4A] text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E6E8EC] rounded-[10px] shadow-lg p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-[#E6E8EC]">
                <h3 className="font-semibold text-xs text-[#172033]">Notifications</h3>
                <span className="text-[10px] text-[#667085]">{unreadCount} unread</span>
              </div>
              <div className="space-y-2 mt-3 max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-[#98A2B3] text-center py-4">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`p-2.5 rounded-[7px] border transition-colors cursor-pointer text-xs ${
                        n.read
                          ? "bg-[#F7F8FA] border-[#E6E8EC] text-[#667085]"
                          : "bg-[#E8F3F0] border-[#176B5B]/30 text-[#172033]"
                      }`}
                    >
                      <div className="flex items-center justify-between font-medium">
                        <span>{n.title}</span>
                        {!n.read && <Check className="w-3 h-3 text-[#176B5B]" />}
                      </div>
                      <p className="text-[11px] text-[#667085] mt-1 leading-snug">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
